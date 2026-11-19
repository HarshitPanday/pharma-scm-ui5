sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/MessageToast", "sap/m/MessageBox",
  "sap/m/Dialog", "sap/m/Button", "sap/m/Label", "sap/m/Input", "sap/m/Select", "sap/m/Text", "sap/m/VBox", "sap/m/DatePicker", "sap/ui/core/Item", "pharma/scm/model/formatter"],
function (Controller, Filter, FO, MessageToast, MessageBox, Dialog, Button, Label, Input, Select, Text, VBox, DatePicker, Item, formatter) {
  "use strict";
  return Controller.extend("pharma.scm.controller.BaseController", {
    fmt: formatter,
    getRouter: function () { return this.getOwnerComponent().getRouter(); },
    odata: function () { return this.getOwnerComponent().getModel(); },
    uid: function (p) { return p + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10); },
    items: function (map) { return Object.entries(this.getOwnerComponent().getModel("app").getProperty("/lookup/" + map) || {}); },
    whItems: function () { return [["WH1", "Main Warehouse"], ["WH2", "Branch Warehouse"]]; },
    key: function (set, o) { return this.odata().createKey(set, o); },

    /* ---------- OData CRUD helpers (promise wrappers around ODataModel V2) ---------- */
    _read: function (set) { return new Promise((ok, err) => this.odata().read("/" + set, { success: d => ok(d.results), error: err })); },
    _create: function (set, data) { return new Promise((ok, err) => this.odata().create("/" + set, data, { success: ok, error: err })); },
    _update: function (path, data) { return new Promise((ok, err) => this.odata().update(path, data, { success: ok, error: err })); },
    batch: function (id) { return this._read("Batches").then(a => a.find(b => b.BatchId === id)); },
    log: function (type, med, batch, qty, wh, ref, value) {
      return this._create("StockMovements", { MovementId: this.uid("T"), Date: this.fmt.today(), Type: type, MedicineId: med, BatchNo: batch, Quantity: qty, Value: Math.round(value || 0), Warehouse: wh, Reference: ref || "" });
    },
    done: function (msg) { return this.getOwnerComponent().refreshData().then(() => MessageToast.show(msg)); },

    /* ---------- FEFO: First Expiry, First Out ---------- */
    allocate: function (med, wh, qty) {
      return this._read("Batches").then(all => {
        let left = qty; const plan = [];
        all.filter(b => b.MedicineId === med && b.Warehouse === wh && b.Status === "Released" && b.Quantity > 0 && this.fmt.days(b.ExpiryDate) >= 0)
          .sort((a, b) => (a.ExpiryDate < b.ExpiryDate ? -1 : 1))
          .forEach(b => { if (left > 0) { const t = Math.min(left, b.Quantity); plan.push({ batch: b, take: t }); left -= t; } });
        return { plan: plan, short: left };
      });
    },
    issue: async function (med, wh, qty, ref) {
      const a = await this.allocate(med, wh, qty);
      if (qty <= 0 || a.short > 0) { return "Insufficient released (non-expired) stock in " + this.fmt.wh(wh); }
      for (const p of a.plan) {
        await this._update("/" + this.key("Batches", { BatchId: p.batch.BatchId }), { Quantity: p.batch.Quantity - p.take });
        await this.log("Issue", med, p.batch.BatchNo, p.take, wh, ref, p.take * p.batch.CostPrice * 1.25);
      }
      return "";
    },

    /* ---------- generic form dialog ---------- */
    openForm: function (title, fields, onSave, preview) {
      const ctl = {}, box = new VBox().addStyleClass("sapUiSmallMargin"), pv = new Text().addStyleClass("sapUiSmallMarginTop");
      const val = () => { const o = {}; fields.forEach(f => { o[f.key] = f.items ? ctl[f.key].getSelectedKey() : ctl[f.key].getValue(); }); return o; };
      const up = () => { if (preview) { preview(val()).then(t => pv.setText(t)); } };
      fields.forEach(f => {
        let c;
        if (f.items) { c = new Select({ width: "100%", items: f.items.map(i => new Item({ key: i[0], text: i[1] })) }); }
        else if (f.type === "date") { c = new DatePicker({ valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy", value: f.value }); }
        else { c = new Input({ type: f.type === "number" ? "Number" : "Text", value: f.value }); }
        if (c.attachLiveChange) { c.attachLiveChange(up); } else { c.attachChange(up); }
        ctl[f.key] = c; box.addItem(new Label({ text: f.label })); box.addItem(c);
      });
      box.addItem(pv);
      const dlg = new Dialog({ title: title, contentWidth: "26rem", content: [box],
        beginButton: new Button({ text: "Save", type: "Emphasized", press: () => {
          Promise.resolve(onSave(val())).then(err => { if (err) { MessageBox.error(err); } else { dlg.close(); } }).catch(() => MessageBox.error("Operation failed"));
        } }),
        endButton: new Button({ text: "Cancel", press: () => dlg.close() }), afterClose: () => dlg.destroy() });
      this.getView().addDependent(dlg); dlg.open(); up();
    },
    onSearch: function (e) {
      const q = e.getParameter("query");
      e.getSource().getParent().getParent().getBinding("items").filter(q ? [new Filter("Name", FO.Contains, q)] : []);
    }
  });
});
