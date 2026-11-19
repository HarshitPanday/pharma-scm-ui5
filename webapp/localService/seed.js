sap.ui.define([], function () {
  "use strict";
  const iso = d => d.toISOString().slice(0, 10);
  const D = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const M = n => { const d = new Date(); d.setMonth(d.getMonth() + n, 10); return iso(d); };
  return {
    build: function () {
      const meds = [["Paracetamol 500mg","Analgesic","Cipla",200],["Amoxicillin 250mg","Antibiotic","Sun Pharma",150],["Metformin 500mg","Antidiabetic","Lupin",120],["Atorvastatin 10mg","Cardiac","Dr. Reddys",100],["Cetirizine 10mg","Antihistamine","Zydus",80],["Insulin Glargine","Antidiabetic","Biocon",40]]
        .map((x, i) => ({ MedicineId: "M00" + (i + 1), Name: x[0], Category: x[1], Manufacturer: x[2], MinStock: x[3] }));
      const batches = [[1,"PCM-A21",45,300,"WH1",1.2,"Released"],[1,"PCM-B07",210,500,"WH1",1.3,"Quarantine"],[2,"AMX-C11",20,90,"WH1",3.5,"Released"],[2,"AMX-D02",300,160,"WH2",3.6,"Released"],[3,"MET-E40",-12,60,"WH1",2.1,"Released"],[3,"MET-F09",400,260,"WH1",2.2,"Released"],[4,"ATV-G33",150,70,"WH1",4.8,"Released"],[5,"CET-H15",75,200,"WH2",0.9,"Released"],[6,"INS-J02",60,25,"WH1",410,"Released"]]
        .map((x, i) => ({ BatchId: "B" + (i + 1), MedicineId: "M00" + x[0], BatchNo: x[1], ExpiryDate: D(x[2]), Quantity: x[3], Warehouse: x[4], Bin: "R" + (i % 4 + 1) + "-B" + (i % 3 + 1), CostPrice: x[5], Status: x[6] }));
      const mv = []; let n = 1;
      [-5,-4,-3,-2,-1,0].forEach((m, k) => [0,1,2,3,5].forEach(i => {
        const c = batches[i].CostPrice, f = m === 0 ? 0.4 : 1, q = Math.round((i === 5 ? 10 + k * 2 : 150 + k * 20 + i * 30) * f), o = Math.round((i === 5 ? 8 + k * 2 : 120 + k * 15 + i * 25) * f);
        mv.push({ MovementId: "T" + (n++), Date: M(m), Type: "GRN", MedicineId: meds[i].MedicineId, BatchNo: batches[i].BatchNo, Quantity: q, Value: Math.round(q * c), Warehouse: "WH1", Reference: "PO-HIST" });
        mv.push({ MovementId: "T" + (n++), Date: M(m), Type: "Issue", MedicineId: meds[i].MedicineId, BatchNo: batches[i].BatchNo, Quantity: o, Value: Math.round(o * c * 1.25), Warehouse: "WH1", Reference: "SO-HIST" });
      }));
      return {
        Medicines: meds, Batches: batches, StockMovements: mv,
        Vendors: [{ VendorId: "V1", Name: "MediSupply Pvt Ltd", Phone: "9810011223", City: "Delhi" }, { VendorId: "V2", Name: "HealthChain Traders", Phone: "9899044556", City: "Gurugram" }],
        Customers: [{ CustomerId: "C1", Name: "Apollo Pharmacy - Sector 14", Type: "Pharmacy", Phone: "9811122334" }, { CustomerId: "C2", Name: "City Distributors", Type: "Distributor", Phone: "9873311220" }],
        PurchaseRequisitions: [{ PrId: "PR001", MedicineId: "M005", Quantity: 200, Status: "Pending", CreatedOn: D(-1) }],
        PurchaseOrders: [{ PoId: "PO001", VendorId: "V1", MedicineId: "M004", Quantity: 300, Rate: 5, Status: "Open", CreatedOn: D(-3) }, { PoId: "PO002", VendorId: "V2", MedicineId: "M003", Quantity: 500, Rate: 2.2, Status: "Open", CreatedOn: D(-2) }],
        SalesOrders: [{ SoId: "SO001", CustomerId: "C1", MedicineId: "M001", Quantity: 120, Status: "Open", CreatedOn: D(-2) }, { SoId: "SO002", CustomerId: "C2", MedicineId: "M003", Quantity: 80, Status: "Open", CreatedOn: D(-1) }]
      };
    }
  };
});
