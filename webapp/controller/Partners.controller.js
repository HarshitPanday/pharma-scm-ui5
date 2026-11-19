sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  return B.extend("pharma.scm.controller.Partners", {
    onAddVendor: function () {
      this.openForm("New Vendor", [{ key: "name", label: "Name" }, { key: "phone", label: "Phone" }, { key: "city", label: "City" }], async v => {
        if (!v.name) { return "Name is required"; }
        await this._create("Vendors", { VendorId: this.uid("V"), Name: v.name, Phone: v.phone, City: v.city }); await this.done("Vendor created");
      });
    },
    onAddCustomer: function () {
      this.openForm("New Customer", [{ key: "name", label: "Name" }, { key: "type", label: "Type", items: [["Pharmacy", "Pharmacy"], ["Distributor", "Distributor"], ["Hospital", "Hospital"]] }, { key: "phone", label: "Phone" }], async v => {
        if (!v.name) { return "Name is required"; }
        await this._create("Customers", { CustomerId: this.uid("C"), Name: v.name, Type: v.type, Phone: v.phone }); await this.done("Customer created");
      });
    }
  });
});
