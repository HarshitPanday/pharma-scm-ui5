sap.ui.define(["./BaseController"], function (B) {
  "use strict";
  return B.extend("pharma.scm.controller.Quality", {
    _qc: async function (e, s) { await this._update(e.getSource().getBindingContext().getPath(), { Status: s }); await this.done("Batch marked " + s); },
    onRelease: function (e) { return this._qc(e, "Released"); },
    onReject: function (e) { return this._qc(e, "Rejected"); },
    onHold: function (e) { return this._qc(e, "Quarantine"); }
  });
});
