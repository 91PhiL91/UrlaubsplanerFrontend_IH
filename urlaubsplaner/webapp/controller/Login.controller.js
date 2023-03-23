sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./helper/Datahelper"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Datahelper) {
        "use strict";

        return Controller.extend("urlaubsplaner.urlaubsplaner.controller.Login", {
            onInit: function () {

            },
            handleClick: function () {
      
                var sUserEmail = this.byId("userEmailInput").getValue();
                var sUserPassword = this.byId("userPasswordInput").getValue();
                var oModel = new sap.ui.model.xml.XMLModel();
                var that = this;

                var oController = this;
                var oParams = { "email": sUserEmail, "password": sUserPassword };
                var sURL = "http://localhost:3000/api/UserDetail";

                Datahelper.read(sURL, oParams, oController).then(function (oResponse) {
                    console.warn(oResponse)
                    that.getOwnerComponent().getRouter().navTo("RouteDashboard", {
                        userID: oResponse.userID,
                        token: oResponse.token
                    });
                }.bind(this)).catch(function (oError) {
                    console.log(oError);
                    if (oError.status === 401) {
                        MessageToast.show("Deine Sitzung ist abgelaufen");
                        var oRouter = oController.getOwnerComponent().getRouter();
                        oRouter.navTo("RouteLogin", {}, true);
                    }
                    sap.m.MessageToast.show("BenutzerName oder Passwort falsch!");
                })





                this.getView().setModel(oModel);



            },
            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("overview", {}, true);
                }
            },
            
            loadData: function () {

            },

        });



    });
