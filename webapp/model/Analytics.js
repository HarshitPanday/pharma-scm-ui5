sap.ui.define([], function () {
  "use strict";
  const iso = () => new Date().toISOString().slice(0, 10);
  const dl = e => Math.ceil((new Date(e) - new Date(iso())) / 864e5);
  const ym = n => { const d = new Date(); d.setMonth(d.getMonth() + n, 1); return d.toISOString().slice(0, 7); };
  const MN = k => new Date(k + "-01").toLocaleString("en", { month: "short" });
  const sum = (a, f) => a.reduce((s, x) => s + (+f(x) || 0), 0);
  const inr = n => "\u20B9" + Math.round(n).toLocaleString("en-IN");
  return {
    compute: function (meds, batches, vendors, customers, prs, pos, sos, mv) {
      const live = b => dl(b.ExpiryDate) >= 0 && b.Quantity > 0, rel = b => live(b) && b.Status === "Released";
      const lookup = { med: {}, ven: {}, cus: {}, batch: {}, avail: {}, poCount: {}, soCount: {} };
      const name = id => lookup.med[id] || id;
      const avail = (id, wh) => sum(batches.filter(b => b.MedicineId === id && rel(b) && (!wh || b.Warehouse === wh)), b => b.Quantity);
      meds.forEach(m => { lookup.med[m.MedicineId] = m.Name; });
      meds.forEach(m => { lookup.avail[m.MedicineId] = avail(m.MedicineId); });
      vendors.forEach(v => { lookup.ven[v.VendorId] = v.Name; lookup.poCount[v.VendorId] = pos.filter(p => p.VendorId === v.VendorId).length; });
      customers.forEach(c => { lookup.cus[c.CustomerId] = c.Name; lookup.soCount[c.CustomerId] = sos.filter(s => s.CustomerId === c.CustomerId).length; });
      batches.forEach(b => { if (b.Quantity > 0) { lookup.batch[b.BatchId] = name(b.MedicineId) + " \u00B7 " + b.BatchNo + " (" + b.Quantity + ")"; } });

      const low = meds.filter(m => avail(m.MedicineId) < m.MinStock);
      const dm = f => new Set(batches.filter(b => b.Quantity > 0 && f(dl(b.ExpiryDate))).map(b => b.MedicineId)).size;
      const liveB = batches.filter(live);
      const K = (label, sub, value, state, icon) => ({ label: label, sub: sub, value: value, state: state, icon: "sap-icon://" + icon,
        iconColor: { None: "#2563eb", Warning: "#c2410c", Error: "#b42318", Success: "#15803d" }[state] });
      const kpis = [
        K("Total Medicines", "In medicine master", String(meds.length), "None", "pharmacy"),
        K("Total Stock Quantity", "Units on hand", sum(liveB, b => b.Quantity).toLocaleString("en-IN"), "None", "inventory"),
        K("Total Stock Value", "At batch cost", inr(sum(liveB, b => b.Quantity * b.CostPrice)), "None", "money-bills"),
        K("Active Suppliers", "Registered vendors", String(vendors.length), "None", "supplier"),
        K("Low Stock Items", "Below minimum level", String(low.length), low.length ? "Warning" : "Success", "alert"),
        K("Near Expiry Medicines", "Expiring within 90 days", String(dm(d => d >= 0 && d <= 90)), "Warning", "history"),
        K("Expired Medicines", "Needs return / disposal", String(dm(d => d < 0)), "Error", "decline"),
        K("Pending Purchase Orders", "Awaiting goods receipt", String(pos.filter(p => p.Status === "Open").length), "None", "document-text")
      ];
      const months = [-5, -4, -3, -2, -1, 0].map(ym), inM = (k, t) => mv.filter(x => x.Type === t && x.Date.slice(0, 7) === k);
      const cats = {}; liveB.forEach(b => { const c = (meds.find(m => m.MedicineId === b.MedicineId) || {}).Category; cats[c] = (cats[c] || 0) + b.Quantity; });
      const exp = [{ Period: "Expired", Units: sum(batches.filter(b => b.Quantity > 0 && dl(b.ExpiryDate) < 0), b => b.Quantity) }]
        .concat([0, 1, 2, 3, 4, 5].map(i => ym(i)).map(k => ({ Period: MN(k), Units: sum(liveB.filter(b => b.ExpiryDate.slice(0, 7) === k), b => b.Quantity) })));
      const stock = meds.map(m => { const a = avail(m.MedicineId), st = a < m.MinStock ? "Reorder" : "OK";
        return { Name: m.Name, Main: avail(m.MedicineId, "WH1"), Branch: avail(m.MedicineId, "WH2"), Hold: sum(batches.filter(b => b.MedicineId === m.MedicineId && b.Status !== "Released" && live(b)), b => b.Quantity), Available: a, Min: m.MinStock, Status: st }; });
      const fefo = []; meds.forEach(m => batches.filter(b => b.MedicineId === m.MedicineId && rel(b)).sort((a, b) => (a.ExpiryDate < b.ExpiryDate ? -1 : 1))
        .forEach((b, i) => fefo.push({ Medicine: i ? "" : m.Name, Order: i + 1, BatchNo: b.BatchNo, Expiry: b.ExpiryDate, Warehouse: b.Warehouse, Qty: b.Quantity, Next: i ? "" : "Next pick" })));
      const alerts = [].concat(
        low.map(m => ({ type: "Warning", text: "Low stock: " + m.Name + " (" + avail(m.MedicineId) + " / min " + m.MinStock + ")" })),
        batches.filter(b => b.Quantity > 0 && dl(b.ExpiryDate) >= 0 && dl(b.ExpiryDate) <= 90).map(b => ({ type: "Warning", text: "Near expiry: " + name(b.MedicineId) + " \u00B7 " + b.BatchNo + " (" + dl(b.ExpiryDate) + " days)" })),
        batches.filter(b => b.Quantity > 0 && dl(b.ExpiryDate) < 0).map(b => ({ type: "Error", text: "Expired: " + name(b.MedicineId) + " \u00B7 " + b.BatchNo + " - return or dispose" })),
        batches.filter(b => b.Status === "Quarantine").map(b => ({ type: "Information", text: "Awaiting QC release: " + name(b.MedicineId) + " \u00B7 " + b.BatchNo })),
        pos.filter(p => p.Status === "Open").map(p => ({ type: "Information", text: "Pending PO " + p.PoId + " - " + (lookup.ven[p.VendorId] || p.VendorId) })));
      return { lookup: lookup, kpis: kpis, stock: stock, fefo: fefo, alerts: alerts,
        valuation: meds.map(m => { const bs = liveB.filter(b => b.MedicineId === m.MedicineId); return { Name: m.Name, Qty: sum(bs, b => b.Quantity), Value: inr(sum(bs, b => b.Quantity * b.CostPrice)) }; }),
        charts: { ps: months.map(k => ({ Month: MN(k), Purchase: sum(inM(k, "GRN"), x => x.Value), Sales: sum(inM(k, "Issue"), x => x.Value) })),
          cat: Object.keys(cats).map(c => ({ Category: c, Units: cats[c] })),
          mov: months.map(k => ({ Month: MN(k), StockIn: sum(inM(k, "GRN"), x => x.Quantity), StockOut: sum(inM(k, "Issue"), x => x.Quantity) })), exp: exp } };
    }
  };
});
