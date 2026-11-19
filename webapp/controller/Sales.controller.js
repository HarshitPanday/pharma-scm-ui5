sap.ui.define(["./BaseController", "sap/m/MessageBox"], function (B, MessageBox) {
  "use strict";
  return B.extend("pharma.scm.controller.Sales", {
    onAddSo: function () {
      this.openForm("New Sales Order", [{ key: "cus", label: "Customer", items: this.items("cus") }, { key: "med", label: "Medicine", items: this.items("med") }, { key: "qty", label: "Quantity", type: "number", value: "50" }], async v => {
        if (+v.qty <= 0) { return "Invalid quantity"; }
        await this._create("SalesOrders", { SoId: this.uid("SO"), CustomerId: v.cus, MedicineId: v.med, Quantity: +v.qty, Status: "Open", CreatedOn: this.fmt.today() });
        await this.done("Sales order created");
      });
    },
    onDispatch: async function (e) {
      const ctx = e.getSource().getBindingContext(), o = ctx.getObject();
      for (const w of ["WH1", "WH2"]) {
        if (!(await this.issue(o.MedicineId, w, o.Quantity, o.SoId))) {
          await this._update(ctx.getPath(), { Status: "Dispatched" });
          return this.done("Dispatched with FEFO from " + this.fmt.wh(w));
        }
      }
      MessageBox.error("Insufficient released stock in a single warehouse");
    },
    onIssue: function () {
      this.openForm("Goods Issue (FEFO)", [{ key: "med", label: "Medicine", items: this.items("med") }, { key: "wh", label: "Warehouse", items: this.whItems() },
        { key: "cus", label: "Customer", items: this.items("cus") }, { key: "qty", label: "Quantity", type: "number", value: "50" }],
        async v => { const r = await this.issue(v.med, v.wh, +v.qty, this.items("cus").find(c => c[0] === v.cus)[1]); if (!r) { await this.done("Goods issued"); } return r; },
        async v => {
          const a = await this.allocate(v.med, v.wh, +v.qty || 0);
          return "FEFO allocation: " + (a.plan.map(p => p.batch.BatchNo + " (exp " + p.batch.ExpiryDate + ") x " + p.take).join(", ") || "no stock") + (a.short > 0 ? "  |  short by " + a.short : "");
        });
    },
    onReturn: function () {
      this.openForm("Goods Return", [{ key: "b", label: "Batch", items: this.items("batch") }, { key: "qty", label: "Quantity", type: "number", value: "10" },
        { key: "r", label: "Reason", items: [["Expired", "Expired"], ["Damaged", "Damaged"], ["Recall", "Quality recall"]] }], async v => {
        const b = await this.batch(v.b);
        if (!b || +v.qty <= 0 || +v.qty > b.Quantity) { return "Invalid quantity"; }
        await this._update("/" + this.key("Batches", { BatchId: b.BatchId }), { Quantity: b.Quantity - +v.qty });
        await this.log("Return", b.MedicineId, b.BatchNo, +v.qty, b.Warehouse, v.r, 0);
        await this.done("Return posted");
      });
    }
  });
});
