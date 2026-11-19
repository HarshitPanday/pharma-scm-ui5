sap.ui.define([], function () {
  "use strict";
  const today = () => new Date().toISOString().slice(0, 10);
  const days = e => Math.ceil((new Date(e) - new Date(today())) / 864e5);
  return {
    today: today, days: days,
    name: (id, map) => (map && map[id] !== undefined ? map[id] : id),
    wh: w => ({ WH1: "Main Warehouse", WH2: "Branch Warehouse" })[w] || w,
    expText: e => (days(e) < 0 ? "Expired" : days(e) + " days"),
    expState: e => (days(e) < 0 ? "Error" : days(e) <= 90 ? "Warning" : "Success"),
    state: s => ({ Released: "Success", Approved: "Success", Received: "Success", Dispatched: "Success", GRN: "Success", OK: "Success",
      Quarantine: "Warning", Pending: "Warning", Open: "Warning", Return: "Warning", Adjust: "Warning", Transfer: "Warning", Reorder: "Warning",
      Rejected: "Error", Issue: "Information", Converted: "Information" })[s] || "None"
  };
});
