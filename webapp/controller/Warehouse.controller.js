sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  return B.extend("pharma.scm.controller.Warehouse", {
    onTransfer: function () {
      this.openForm("Stock Transfer", [{ key: "b", label: "Batch", items: this.items("batch") }, { key: "to", label: "Destination warehouse", items: this.whItems() }, { key: "qty", label: "Quantity", type: "number", value: "10" }], async v => {
        const b = await this.batch(v.b), q = +v.qty;
        if (!b || q <= 0 || q > b.Quantity) { return "Invalid quantity"; }
        if (b.Warehouse === v.to) { return "Choose a different warehouse"; }
        await this._update("/" + this.key("Batches", { BatchId: b.BatchId }), { Quantity: b.Quantity - q });
        const dest = (await this._read("Batches")).find(x => x.MedicineId === b.MedicineId && x.BatchNo === b.BatchNo && x.Warehouse === v.to);
        if (dest) { await this._update("/" + this.key("Batches", { BatchId: dest.BatchId }), { Quantity: dest.Quantity + q }); }
        else { await this._create("Batches", Object.assign({}, b, { BatchId: this.uid("B"), Warehouse: v.to, Quantity: q, Bin: "RCV-01", __metadata: undefined })); }
        await this.log("Transfer", b.MedicineId, b.BatchNo, q, b.Warehouse, b.Warehouse + " -> " + v.to, 0);
        await this.done("Stock transferred");
      });
    }
  });
});
