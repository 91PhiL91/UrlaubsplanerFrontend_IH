sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",


],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (MessageToast) {
        "use strict";

        return{
            handleStatusCode : function(oResponse, oController) {
                
               console.warn(oResponse);

                switch (oResponse.status) {
                    case 401:
                        MessageToast.show("Deine Sitzung ist abgelaufen");
                        var oRouter = oController.getOwnerComponent().getRouter();
                        oRouter.navTo("RouteLogin", {}, true);
                        break;
                    case 200:
                        sap.m.MessageToast.show(`Erfolgreich!`);
                        break;
                    case 403:
                        sap.m.MessageToast.show(`Forbidden! Du hast nicht die benötigten Rechte`);
                        break;
                    case 404:
                        sap.m.MessageToast.show(`Not Found! Etwas fehlt`);
                        break;
                    default:
                        console.warn(oResponse.status)
                        break;
                }


            },

        };
    })
