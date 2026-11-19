sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  return B.extend("pharma.scm.controller.Purchase", {
    onAddPr: function () {
      this.openForm("New Purchase Requisition", [{ key: "med", label: "Medicine", items: this.items("med") }, { key: "qty", label: "Quantity", type: "number", value: "100" }], async v => {
        if (+v.qty <= 0) { return "Invalid quantity"; }
        await this._create("PurchaseRequisitions", { PrId: this.uid("PR"), MedicineId: v.med, Quantity: +v.qty, Status: "Pending", CreatedOn: this.fmt.today() });
        await this.done("Purchase requisition created");
      });
    },
    onApprovePr: async function (e) { await this._update(e.getSource().getBindingContext().getPath(), { Status: "Approved" }); await this.done("PR approved"); },
    onCreatePo: function (e) {
      const ctx = e.getSource().getBindingContext(), pr = ctx.getObject();
      this.openForm("Create PO from " + pr.PrId, [{ key: "ven", label: "Vendor", items: this.items("ven") }, { key: "rate", label: "Rate (INR / unit)", type: "number", value: "1" }], async v => {
        if (+v.rate <= 0) { return "Invalid rate"; }
        await this._create("PurchaseOrders", { PoId: this.uid("PO"), VendorId: v.ven, MedicineId: pr.MedicineId, Quantity: pr.Quantity, Rate: +v.rate, Status: "Open", CreatedOn: this.fmt.today() });
        await this._update(ctx.getPath(), { Status: "Converted" });
        await this.done("Purchase order created");
      });
    },
    onReceive: function (e) {
      const ctx = e.getSource().getBindingContext(), po = ctx.getObject();
      this.openForm("Goods Receipt (GRN) for " + po.PoId, [{ key: "no", label: "Batch number" }, { key: "exp", label: "Expiry date", type: "date", value: new Date(Date.now() + 540 * 864e5).toISOString().slice(0, 10) },
        { key: "wh", label: "Warehouse", items: this.whItems() }, { key: "bin", label: "Bin location", value: "R1-B1" }], async v => {
        if (!v.no || !v.exp) { return "Batch number and expiry date are required"; }
        if (this.fmt.days(v.exp) <= 0) { return "Cannot receive expired stock"; }
        await this._create("Batches", { BatchId: this.uid("B"), MedicineId: po.MedicineId, BatchNo: v.no, ExpiryDate: v.exp, Quantity: po.Quantity, Warehouse: v.wh, Bin: v.bin, CostPrice: po.Rate, Status: "Quarantine" });
        await this.log("GRN", po.MedicineId, v.no, po.Quantity, v.wh, po.PoId, po.Quantity * po.Rate);
        await this._update(ctx.getPath(), { Status: "Received" });
        await this.done("GRN posted - batch is in QC quarantine until released");
      });
    }
  });
});
