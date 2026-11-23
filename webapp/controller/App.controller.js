sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  const tablet = window.matchMedia("(max-width: 1024px)");
  return B.extend("pharma.scm.controller.App", {
    onInit: function () {
      this.getRouter().attachRouteMatched(e => {
        const k = e.getParameter("name");
        this.byId("sideNav").setSelectedKey(k);
        this.byId("drawerNav").setSelectedKey(k);
      });
      this.byId("scrim").attachBrowserEvent("click", () => this._close()); // dim par tap = drawer band
      this._fit = () => { this._close(); this.byId("toolPage").setSideExpanded(!tablet.matches); };
      this._fit();
      tablet.addEventListener("change", this._fit);
      window.matchMedia("(max-width: 760px)").addEventListener("change", () => this._close());
    },
    _close: function () { this.byId("drawer").removeStyleClass("open"); this.byId("scrim").removeStyleClass("open"); },
    onToggle: function () { this.byId("drawer").toggleStyleClass("open"); this.byId("scrim").toggleStyleClass("open"); },
    onSelect: function (e) { this.getRouter().navTo(e.getParameter("item").getKey()); this._close(); },
    onAlerts: function () { this.getRouter().navTo("reports"); }
  });
});