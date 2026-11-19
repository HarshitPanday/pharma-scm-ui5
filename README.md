# PharmaSCM - Pharma Inventory & Supply Chain (SAPUI5 / Fiori)

SAPUI5 + sap.m / sap.tnt / sap.viz app (SAP Horizon theme) with an **OData V2** model (`ZPHARMA_SRV`), served by the UI5 MockServer.
Business logic follows SAP MM: PR -> PO -> GRN (batch + expiry, QC quarantine) -> stock -> Goods Issue with **FEFO**.

## Run
```
npm install
npm start
```
(or serve the `webapp` folder with any static server, e.g. VS Code Live Server. Opening index.html via file:// will not work.)
Needs internet to load UI5 from https://ui5.sap.com. Mock data is in memory and resets on page reload.

## Structure
- `webapp/manifest.json` - app descriptor, OData datasource, routing for 10 modules
- `webapp/view/*.view.xml`, `webapp/controller/*.controller.js` - one view + controller per module
- `webapp/model/Analytics.js` - KPI / chart / FEFO queue calculations, `model/formatter.js`
- `webapp/localService/` - `metadata.xml` (EDMX), `seed.js`, `mockserver.js`

## Connecting a real SAP system
Remove `MS.init()` from `webapp/init.js` and point `dataSources.mainService.uri` in manifest.json to your SEGW / CAP OData V2 service with the same entity sets.
