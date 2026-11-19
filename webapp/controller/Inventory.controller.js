sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  return B.extend("pharma.scm.controller.Inventory", {
    onAdjust: function () {
      this.openForm("Stock Adjustment", [{ key: "b", label: "Batch", items: this.items("batch") }, { key: "t", label: "Type", items: [["-", "Decrease"], ["+", "Increase"]] },
        { key: "qty", label: "Quantity", type: "number", value: "5" }, { key: "r", label: "Reason", items: [["Cycle count", "Cycle count"], ["Breakage", "Breakage"], ["Sample", "Sample / QC"]] }], async v => {
        const b = await this.batch(v.b), q = +v.qty * (v.t === "-" ? -1 : 1);
        if (!b || +v.qty <= 0 || b.Quantity + q < 0) { return "Invalid quantity"; }
        await this._update("/" + this.key("Batches", { BatchId: b.BatchId }), { Quantity: b.Quantity + q });
        await this.log("Adjust", b.MedicineId, b.BatchNo, q, b.Warehouse, v.r, 0);
        await this.done("Stock adjusted");
      });
    }
  });
});
