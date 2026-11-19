sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  return B.extend("pharma.scm.controller.Dashboard", {
    onAfterRendering: function () {
      ["vizPS", "vizCat", "vizMov", "vizExp"].forEach(id => {
        const f = this.byId(id);
        f.setUiConfig({ applicationSet: "fiori" });
        f.setVizProperties({ title: { visible: false }, plotArea: { dataLabel: { visible: false } } });
      });
    }
  });
});
