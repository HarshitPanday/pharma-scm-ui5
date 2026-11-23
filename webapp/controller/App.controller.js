sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  const phone = window.matchMedia("(max-width: 760px)"), tablet = window.matchMedia("(max-width: 1024px)");
  return B.extend("pharma.scm.controller.App", {
    onInit: function () {
      this.getRouter().attachRouteMatched(e => this.byId("sideNav").setSelectedKey(e.getParameter("name")));
      this._fit = () => { const p = this.byId("toolPage"); p.removeStyleClass("navOpen"); p.setSideExpanded(phone.matches || !tablet.matches); };
      this._fit();
      phone.addEventListener("change", this._fit); tablet.addEventListener("change", this._fit);
    },
    onAfterRendering: function () {
      const root = this.byId("toolPage").getDomRef();
      if (root && !root._bd) { // dimmed backdrop par tap = drawer band
        root._bd = true;
        root.addEventListener("click", e => { if (phone.matches && e.target === root) { this.byId("toolPage").removeStyleClass("navOpen"); } });
      }
    },
    onSelect: function (e) { this.getRouter().navTo(e.getParameter("item").getKey()); this.byId("toolPage").removeStyleClass("navOpen"); },
    onToggle: function () { this.byId("toolPage").toggleStyleClass("navOpen"); },
    onAlerts: function () { this.getRouter().navTo("reports"); }
  });
});