sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "pharma/scm/model/Analytics"], function (UIComponent, JSONModel, Analytics) {
  "use strict";
  return UIComponent.extend("pharma.scm.Component", {
    metadata: { manifest: "json" },
    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      const app = new JSONModel({ lookup: {}, kpis: [], charts: {} }); app.setSizeLimit(1000);
      this.setModel(app, "app");
      this.getRouter().initialize();
      this.refreshData();
    },
    /** Reads all entity sets via OData and recomputes dashboard / stock analytics. */
    refreshData: function () {
      const m = this.getModel();
      const rd = s => new Promise((ok, err) => m.read("/" + s, { success: d => ok(d.results), error: err }));
      return Promise.all(["Medicines", "Batches", "Vendors", "Customers", "PurchaseRequisitions", "PurchaseOrders", "SalesOrders", "StockMovements"].map(rd))
        .then(r => this.getModel("app").setData(Analytics.compute.apply(null, r)));
    }
  });
});
