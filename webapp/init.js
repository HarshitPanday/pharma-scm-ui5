sap.ui.define(["sap/ui/core/ComponentContainer","pharma/scm/localService/mockserver"], function (CC, MS) {
  "use strict";
  MS.init(); // simulates the OData V2 service; remove when a real backend is connected
  new CC({ name: "pharma.scm", settings: { id: "pharma" }, async: true, height: "100%" }).placeAt("content");
});
