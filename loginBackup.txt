sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("urlaubsplaner.urlaubsplaner.controller.Login", {
            onInit: function () {

            },
            handleClick: function () {
                //  var oRouter = sap.ui.core.UIComponent.getRouter();
                //         oRouter.navTo("RouteDashboard");
                //Test Kommentar für Push

                var sUserEmail = this.byId("userEmailInput").getValue();
                var sUserPassword = this.byId("userPasswordInput").getValue();
                var oModel = new sap.ui.model.xml.XMLModel();
                var that = this;

                console.log("E-Mail: " + sUserEmail, "PW: " + sUserPassword); 

                var aData = jQuery.ajax({
                    type: "GET",
                    contentType: "application/xml",
                    url: "http://localhost:3000/api/UserDetail",
                    dataType: "json",
                    data: $.param({ "email": sUserEmail, "password": sUserPassword }),
                    async: false,
                    success: function (data) {
        
                        console.log(data);

                        that.getOwnerComponent().getRouter().navTo("RouteDashboard", {
                            userID: data.userID,
                            token: data.token

                        });
                        console.log("Hier müsste die UserID stehen: " + data.userID);
                         oModel.setData(data);
                    },
                    error: function (oResponse) {
                        
                        sap.m.MessageToast.show("BenutzerName oder Passwort falsch!");
                    }

                   
                });
                console.log(aData);
                this.getView().setModel(oModel);
            }
        });
    });
