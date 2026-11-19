sap.ui.define(["sap/ui/core/util/MockServer", "./seed"], function (MockServer, Seed) {
  "use strict";
  return {
    init: function () {
      const ms = new MockServer({ rootUri: "/sap/opu/odata/sap/ZPHARMA_SRV/" });
      const base = sap.ui.require.toUrl("pharma/scm/localService");
      ms.simulate(base + "/metadata.xml", { sMockdataBaseUrl: base + "/mockdata/", bGenerateMissingMockData: false });
      ms.start();
      const data = Seed.build();
      Object.keys(data).forEach(k => ms.setEntitySetData(k, data[k]));
    }
  };
});
