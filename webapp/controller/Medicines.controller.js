sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  return B.extend("pharma.scm.controller.Medicines", {
    onAdd: function () {
      this.openForm("New Medicine", [{ key: "name", label: "Medicine name" }, { key: "cat", label: "Category" }, { key: "mfr", label: "Manufacturer" }, { key: "min", label: "Minimum stock", type: "number", value: "100" }], async v => {
        if (!v.name) { return "Medicine name is required"; }
        const n = this.items("med").length + 1;
        await this._create("Medicines", { MedicineId: "M" + String(n).padStart(3, "0"), Name: v.name, Category: v.cat, Manufacturer: v.mfr, MinStock: +v.min });
        await this.done("Medicine created");
      });
    }
  });
});
