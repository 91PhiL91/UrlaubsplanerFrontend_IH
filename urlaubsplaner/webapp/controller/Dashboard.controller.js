sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
	"./helper/DataHelper",
    "./helper/ResponseStatusHelper"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, Fragment, Datahelper, ResponseStatusHelper) {
        "use strict";

        return Controller.extend("urlaubsplaner.urlaubsplaner.controller.Dashboard", {
            onInit: function () {
                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
                var oController = this;








            },
            onNavBack: function () {
                
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteLogin", {}, true);
            },
            /**
             * 
             * @param { } oEvent 
             */
            onRouteMatched: function (oEvent) {
                var oController = this;
                this.userID = oEvent.getParameter("arguments").userID;
                this.token = oEvent.getParameter("arguments").token;
                this.teamLeaderID = oEvent.getParameter("arguments").teamLeaderID;
                // console.log("teamLeaderID!" + this.teamLeaderID)
                // console.log(" userID im DashboardController die durch Login übergeben wurde " + this.userID);
                if(this.token){
                    this.loadData();
                    this.setFirstDay();
                }else{
                    MessageToast.show("Deine Sitzung ist abgelaufen");
                    var oRouter = oController.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteLogin", {}, true);
                }
                



            },
            /**
             * 
             */
            loadData: function () {
               
                //GET /api/UserById


               
                var oView = this.getView();
                var oModel = new sap.ui.model.json.JSONModel();
                var oKalenderModel = new sap.ui.model.json.JSONModel();
                var aArray = [];
                var oController = this;
                
        




            var oController = this;
            var oParams = { "userID": this.userID, "token" : this.token };
			var sURL = "http://localhost:3000/api/UserById";
                
			Datahelper.read(sURL, oParams, oController).then(function(oResponse){
				
                // console.log("Test Log am Anfang von Datahelper")
                        oResponse.data.appointments.forEach(vacationObject => {
                            vacationObject.type = "Type05";
                            var dateObject = new Date(vacationObject.endDate);
                            vacationObject.endDate = dateObject;
                            dateObject = new Date(vacationObject.startDate);
                            vacationObject.startDate = dateObject;
                        });
                        oModel.setProperty("/User", oResponse.data);
                        oView.setModel(oModel, "userDetail");
                        aArray.push(oResponse.data);
                        oKalenderModel.setProperty("/People", aArray);
                        oView.setModel(oKalenderModel, "vacationKalenderModel");
                        // console.log("Hier drunte sollte das oKalenderModel ausgegeben werden.")
                        // console.log(oKalenderModel);
                        if(oResponse.data.isSupervisor === true){
                            oController.loadOwnTeamData(oResponse.data.userID);
                        }
			}.bind(this)).catch(function(oError){
				console.log(oError);
				if(oError.status === 401){
				 			MessageToast.show("Deine Sitzung ist abgelaufen");
				 			var oRouter = oController.getOwnerComponent().getRouter();
							oRouter.navTo("RouteLogin", {}, true);
				}
			})




                
            },
                
            loadOwnTeamData: function(userID) {
                // var oView = this.getView();
                // var oModel = new sap.ui.model.json.JSONModel();


                // var oController = this;
                // var oParams = { "token" : this.token, "teamLeaderID": userID };
			    // var sURL = "http://localhost:3000/api/UserTeam";


                // Datahelper.read(sURL, oParams, oController).then(function(oResponse){
                //     oModel.setProperty("/Team", oResponse.data);
                //     oResponse.data.forEach(element => {
                //         element.appointments.forEach(vacationObject => {
                //             console.log(vacationObject);
                //             vacationObject.type = "Type05";
                //             var dateObject = new Date(vacationObject.endDate);
                //             // console.log("EndDate:");
                //             // console.log(dateObject);
                //             vacationObject.endDate = dateObject;
                //             dateObject = new Date(vacationObject.startDate);
                //             // console.log("StartDate:");
                //             // console.log(dateObject);
                //             vacationObject.startDate = dateObject;
                //         });
                //     });
                   

                //     console.log(oModel);
                //     oView.setModel(oModel, "oTeamModel");
                // }.bind(this)).catch(function(oError){
                //     // console.log(oError);
                //     // if(oResponse.status === 401){
                //     //              MessageToast.show("Deine Sitzung ist abgelaufen");
                //     //              var oRouter = oController.getOwnerComponent().getRouter();
                //     //             oRouter.navTo("RouteLogin", {}, true);
                //     // }
                // })



            },

            employeeHandleClick: function () {
                console.log("Der Button MA Verwaltung wurde gedrückt");
                this.getOwnerComponent().getRouter().navTo("RouteEmployeesManagement", 
                {
                    userID : this.userID,
                    token: this.token
                });                    
            },
            
            
            teamHandleClick: function () {
                
                this.getOwnerComponent().getRouter().navTo("RouteTeams", 
                {
                    userID : this.userID,
                    token: this.token
                });                       
            },


            vacationHandleClick: function () {
                console.log("Button MitarbeiterVerwaltung wurde geklickt!");
                this.getOwnerComponent().getRouter().navTo("RouteVacationManagement", {
                    userID: this.userID,
                    token: this.token
                });
            },

            getfirstDayOfWeek: function () {
                var today = new Date();
                var day = today.getDay();
                return new Date(today.getFullYear(), today.getMonth(), today.getDate() - day + 1);
            },

            onOpenDialog: function () {
                var oView = this.getView();
                if (!this.byId("vacationPickerDialog")) {
                      Fragment.load({
                        id: oView.getId(),
                        name: "urlaubsplaner.urlaubsplaner.view.dialogs.VacationDateDialog",
                        controller: this
                    }).then(function (oDialog) {

                        oView.addDependent(oDialog);
                        oDialog.open();
                    });
                } else {
                    this.byId("vacationPickerDialog").open();
                }
            },

            closeDialog: function () {
                this.byId("vacationPickerDialog").close();
                this.byId("datePickerStart").setValue(null);
                this.byId("datePickerEnd").setValue(null);
                this.byId("InputGrundRequired").setValue(null);
            },


            sendVacation: function () {

                //Zu Buchunder Urlaub wird ausgelesen und in Variable gespeichert

                // POST - /api/urlaub 

                var sVacationStart = this.byId("datePickerStart").getDateValue();
                var sVacationEnd = this.byId("datePickerEnd").getDateValue();
                var sTitel = this.byId("InputGrundRequired").getValue();
                var today = new Date();
                var day = today.getDay();
                var iUserTotalVacation = this.getView().getModel("userDetail").getProperty("/User/totalVacation");
                //Speicher die Zeit zwischen urlaubsStart und urlaubEnde in ms  in diffTage
                console.log("Hier müsste dei totalVacation stehten :" + iUserTotalVacation);
                var diffDays = sVacationEnd.getTime() - sVacationStart.getTime();
                //diffTage wird durch Tag in ms geteilt und der floatwert wird durch Math.floor in eine ganze Zahl konvertiert
                var iDay = Math.floor(1 + (diffDays / (24 * 60 * 60 * 1000)));

                //Schaue ob beantragte Tage kleinerGleich Restage sind wenn ja dann
                if (sVacationStart < today) {

                    MessageToast.show("Dein Urlaub darf nicht in der Vergangenheit liegen!");
                }
                else if (sVacationEnd < today) {

                    MessageToast.show("Dein Urlaub darf nicht in der Vergangenheit liegen!");
                }
                else if (sVacationEnd < sVacationStart) {

                    MessageToast.show("Dein Urlaubs Ende darf nicht vor dem Beginn deines Urlaubs liegen!");
                }
                else if (iDay <= iUserTotalVacation) {

                    //UrlaubsVerwaltungDaten
                    this.sUrlaubsVerwaltungStart = sVacationStart;
                    this.sUrlaubsVerwaltungEnde = sVacationEnd;
                    iUserTotalVacation = iUserTotalVacation - iDay;
                    
                    
                    //Noch mal schauen. Weil daten nicht dauerhaft geändert werden.----------------------------------------------------------------------------------------------
                    console.log("totalVacation - gebuchte Tage" + iUserTotalVacation);
                    this.getView().getModel("userDetail").setProperty("/User/totalVacation", iUserTotalVacation);

                    //Aufruf der update funktion vom Backend  
                    this.vacationPush(sVacationStart, sVacationEnd, sTitel);
                } else {
                    //Gebe Fehler Meldung mit Grund aus
                    console.log("Error zu wenig UrlaubsTage");
                   
                }
                this.closeDialog();
                


             },


            setFirstDay: function () {
                var Date = this.getfirstDayOfWeek();
                var oKalender = [];
                // oKalender.push(this.byId("EmployeePC"));
                oKalender.push(this.byId("Own"));
                // oKalender.push(this.byId("TeamPC"));
                oKalender.forEach(element => {
                    element.setStartDate(Date);
                });

            },

            vacationPush: function (sVacationStart, sVacationEnd, sTitel) {

                var oUser = this.getView().getModel("userDetail").getProperty("/User");
                //Wichtig für Anzeige im Kalender (setzt das Ende auch auf 23:59 Uhr an dem Tag)
                sVacationEnd.setHours(23, 59);

                var oAppointment = {
                    pic: "",
                    userID: oUser.userID,
                    titel: sTitel,
                    start: new Date(sVacationStart),
                    end: new Date(sVacationEnd),
                    status: "beantragt",
                    isRead: 0
                }
                console.log("urlaubsPush oAppointment ausgabe!")
                console.log(oAppointment);

                var oController = this;
                $.ajax({
                    type: "POST",
                    url: "http://localhost:3000/api/Vacation",
                    dataType: "json",
                    data: $.param({oAppointment, "token" : this.token}),
                    async: true,
                    success: function (oResponse, textStatus, jqXHR) {
                        sap.m.MessageToast.show("Urlaub erfolgreich beantragt");
                        console.log(oResponse);
                        oController.loadData();
                    },
                    error: function (oResponse) {
                        ResponseStatusHelper.handleStatusCode(oResponse,oController);
                        console.warn("OController:")
                        console.log(oController)
                        oController.loadData();

                        
                        
                    }
                });      

            }

        });
    });

    