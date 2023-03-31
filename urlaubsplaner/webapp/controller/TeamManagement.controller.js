sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/ToolbarSpacer",
	"sap/ui/table/library",
	"sap/ui/thirdparty/jquery",
    "sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/MessageBox",
	// "urlaubsplaner/urlaubsplaner/utils/xlsx",
	"./helper/ResponseStatusHelper",
	"./helper/DataHelper"
], function(Log, Controller, Sorter, JSONModel, DateFormat, ToolbarSpacer, library, jQuery, Fragment, MessageToast, Export, ExportTypeCSV, MessageBox, /*xlsx*/ ResponseStatusHelper, Datahelper) {
	"use strict";

	// shortcut for sap.ui.table.SortOrder
	var SortOrder = library.SortOrder;

	return Controller.extend("urlaubsplaner.urlaubsplaner.controller.Dashboard", {

		onInit : function() {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			
			
			var oView = this.getView();
			oView.setModel(new JSONModel({
				globalFilter: "",
				availabilityFilterOn: false,
				cellFilterOn: false
			}), "ui");

			this._oGlobalFilter = null;
			this._oPriceFilter = null;
		},


		onRouteMatched: function (oEvent) {

            this.token = oEvent.getParameter("arguments").token;
			this.userID = oEvent.getParameter("arguments").userID;
			var oController = this;


			if(this.token){
				var oModel = new sap.ui.model.json.JSONModel();
				var oView = this.getView();
				//Edit Modus wird erstmal auf false gesetzt 
				oModel.setProperty("/bEdit", false);
				oView.setModel(oModel, "oTeamModel");
				this.loadData();
			}else{
				MessageToast.show("Deine Sitzung ist abgelaufen");
				var oRouter = oController.getOwnerComponent().getRouter();
				oRouter.navTo("RouteLogin", {}, true);
			}
		},
		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("RouteDashboard", {
				userID: this.userID,
				token: this.token
				
			   });
		},
		loadData: function () {

			//MOCK-Data Team
			//Aufruf GET /Api/User

			var oView = this.getView();
			var oModel = oView.getModel("oTeamModel");
			var oController = this;
			var oParams = {"token" : this.token};
			var sURL = "http://localhost:3000/api/User";

			Datahelper.read(sURL, oParams, oController).then(function(oResponse){
				console.log(oResponse.allUsers);
				oModel.setProperty("/Users", oResponse.allUsers)
				oView.setModel(oModel, "oTeamModel");
				oController.loadTeamData();
			}.bind(this)).catch(function(oError){
				console.log(oError);
			})



		},


		loadDataIntoUser: function (userID) {

			//Aufruf  POST  /api/user

			
		},


		clearAllSortings : function(oEvent) {
			var oTable = this.byId("TeamTable");
			oTable.getBinding().sort(null);
			this._resetSortingState();
		},

		onEdit: function () {
			this.byId("TeamTable").setSelectionMode("MultiToggle");
			this.getView().getModel("oTeamModel").setProperty("/bEdit", true);
			

		},

		onAbortEdit: function () {
			this.byId("TeamTable").setSelectionMode("None");
			this.getView().getModel("oTeamModel").setProperty("/bEdit", false);
			

		},

		deleteTeam: function () {
			var oTable = this.byId("oTeamModel");
			var aSelectedIndices = oTable.getSelectedIndices();
			var aUrlaube = [];
			for (var i = 0; i < aSelectedIndices.length; i++) {
				var oSelectedContext = oTable.getContextByIndex(aSelectedIndices[i]);
				var oSelectedData = oSelectedContext.getObject();
				oSelectedData.status = "genehmigt";
				aUrlaube.push(oSelectedData);
			}
			this.pushUrlaubData(aUrlaube);
			

		},
		

		
		onEditTeam: function (e) {
			var oView = this.getView();
			var sPath = e.getSource().getBindingContext('oTeamModel').getPath();
			var oModel = this.getView().getModel('oTeamModel');
			var oUserData = oModel.getProperty(sPath);
			var oEditModel = new sap.ui.model.json.JSONModel();
			oEditModel.setProperty("/EditTeam", oUserData);
			oView.setModel(oEditModel, "oEditModel");
			console.log("OEditModel:" +oEditModel);
			this.openDialog();
			
		},



		onCreateTeam: function () {
			this.openCreateTeamDialog();
		},


		


		loadTeamData: function(){

			var oModel = this.getView().getModel("oTeamModel");
		
			var oParams = { "token" : this.token};
			var sURL = "http://localhost:3000/api/Team";
			var oController = this;

			Datahelper.read(sURL, oParams, oController).then(function(oResponse){
				console.log("Hier Drunter stehe die oResponse von /api/Team");
				console.log(oResponse.data);

                var oUserArray = oModel.getProperty("/Users");
				console.log(oUserArray);
					oResponse.data.forEach(oTeam => {
						var oTeamleadID = oTeam.teamLeaderID;
						var oTeamlead = oUserArray.find(function (oUser) {
						  return oUser.userID === oTeamleadID;
						});
						oTeam.teamlead = oTeamlead.firstName + " " + oTeamlead.lastName;
					});
					oModel.setProperty("/Teams", oResponse.data);
	
					
			}.bind(this)).catch(function(oResponse){
				console.log(oResponse);
				if(oResponse.status === 401){
				 			MessageToast.show("Deine Sitzung ist abgelaufen");
				 			var oRouter = oController.getOwnerComponent().getRouter();
							oRouter.navTo("RouteLogin", {}, true);
				}
                sap.m.MessageToast.show("BenutzerName oder Passwort falsch!");
			})







			
			// jQuery.ajax({
			// 	type: "GET",
			// 	contentType: "application/json",
			// 	url: "http://localhost:3000/api/Team",
			// 	data: $.param({ "token" : this.token}),
			// 	dataType: "json",
			// 	async: true,
			// 	success: function (oResponse) {
			// 		console.log("Team Daten geladen!");
			// 		var oUserArray = oModel.getProperty("/Users");
			// 		oResponse.forEach(oTeam => {
			// 			var oTeamlead = oUserArray.find(function (oUser) {
			// 				return oUser.userID === oTeam.teamLeaderID;
			// 			});
			// 			oTeam.teamlead = oTeamlead;
			// 		});
			// 		oModel.setProperty("/Teams", oResponse)
			// 	},
			// 	error: function (oResponse) {
			// 		console.log(oResponse);
			// 		if(oResponse.status === 401){
			// 			MessageToast.show("Deine Sitzung ist abgelaufen");
			// 			var oRouter = oController.getOwnerComponent().getRouter();
			// 			oRouter.navTo("RouteLogin", {}, true);
			// 		}
			// 	}
			// })


		},


		openDialog: function(){
			var oView = this.getView();
			if (!this.byId("TeamsEditDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: this.getView().getId(),
					name: "urlaubsplaner.urlaubsplaner.view.dialogs.TeamsEditDialog",
					controller: this
				}).then(function (oDialog) {

					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("TeamsEditDialog").open();
			}
		},


		openCreateTeamDialog: function(){
			var oView = this.getView();
			if (!this.byId("TeamsCreateDialog")) {
				Fragment.load({
					id: this.getView().getId(),
					name: "urlaubsplaner.urlaubsplaner.view.dialogs.TeamsCreateDialog",
					controller: this
				}).then(function (oDialog) {

					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("TeamsCreateDialog").open();
			}
		},

		sortCategories : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("TeamTable");
			var oCategoriesColumn = oView.byId("categories");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		clearAllFilters: function(oEvent) {
			var oTable = this.byId("TeamTable");

			var oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			oUiModel.setProperty("/availabilityFilterOn", false);

			this._oGlobalFilter = null;
			this._oPriceFilter = null;
			this._filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},
		_filter: function() {
			var oFilter = null;

			this.byId("TeamTable").getBinding().filter(oFilter, "Application");
		},

	
		closeEditDialog: function(){
			this.byId("TeamsEditDialog").close();
		},
		closeTeamsCreateDialog: function(){
			var oView = this.getView();
			this.byId("TeamsCreateDialog").close();
			oView.byId("TeamCreateName").setValue("");
			oView.byId("TeamCreateNote").setValue("");
			this.onAbortEdit();
		},


		firstUp: function(oFlum){
			var uncap = oFlum.toLowerCase();
			var cap = uncap.charAt(0).toUpperCase() + uncap.slice(1);
			return cap;
		},

		createTeam: function() {
			var oView = this.getView();
			var oController = this;
			var sTeamName= oView.byId("TeamCreateName").getValue();
			var sTeamLeader = oView.byId("TeamEditteamLeaderID").getSelectedKey();
			
			
			
			$.ajax({
				url: "/api/Team",
				method: "POST",
				data: {
					teamLeaderID: sTeamLeader,
					teamName: sTeamName,
					token: this.token

				},
				success: function(oResponse) {
					console.log("Erfolgreich erstellt");
					oController.loadData();
				},
				error: function(oResponse) {
					console.error("Das hat leider nicht geklappt");
					
					oController.loadData();
				}
			});
		
			this.closeTeamsCreateDialog();
		},


		editTeam: function() {
			var oView = this.getView();
			var oController = this;
			var oEditTeam = oView.getModel("oEditModel").getProperty("/EditTeam");
			var sTeamName= oView.byId("TeamEditName").getValue();
			var sTeamLeader = oView.byId("TeamEditteamLeaderID").getSelectedKey();
			console.log(oEditTeam);






			// var oParams = {teamLeaderID: sTeamLeader, teamName: sTeamName, teamId:  oEditTeam.teamId, token: this.token};
			// var sURL = "http://localhost:3000/api/Team";

			// Datahelper.update(sURL, oParams, oController).then(function(oResponse){
			// 	console.log("Erfolgreich überarbeitet");
			// 	oView.getModel("oEditModel").setProperty("/EditTeam", null);
			// 	oController.loadData();
			// }.bind(this)).catch(function(oError){
			// 	ResponseStatusHelper.handleStatusCode(oResponse,oController);
			// })







			$.ajax({
				url: "/api/Team",
				method: "PUT",
				contentType: "application/json",
				dataType: "json",
				async: true,
				data: JSON.stringify({
					teamLeaderID: sTeamLeader,
					teamName: sTeamName,
					teamId:  oEditTeam.teamId,
					token: this.token
				}),
				success: function() {
					console.log("Erfolgreich überarbeitet");
					oView.getModel("oEditModel").setProperty("/EditTeam", null);
					oController.loadData();
				},
				error: function(oResponse) {
					ResponseStatusHelper.handleStatusCode(oResponse,oController);
					
				}

			});
		
			this.closeEditDialog();
		},


		onExportButtonPress: function (){
			var myDataModel = this.getView().getModel("oTeamModel");
			var myTeamArray = myDataModel.getProperty("/Teams");
			console.log(myTeamArray);
			var myResultsArray = [];
			
			myTeamArray.forEach(Team => {
				myResultsArray.push(Team);
			});
			myResultsArray.forEach(Team => {
				if(Team.teamlead){
					Team.Teamleiter = Team.teamlead.vorname + " " + Team.teamlead.nachname;
					delete Team.teamlead;
				}
				
			});


			var workSheet = XLSX.utils.json_to_sheet(myResultsArray);

			var workBook = XLSX.utils.book_new();
			
			XLSX.utils.book_append_sheet(workBook, workSheet, "My Data Export");
			var sFilename = "My Data Export.xlsx";
			XLSX.writeFile(workBook, sFilename);









		},



		onExportExcel: function () {
			var oExport = new sap.ui.core.util.Export({
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ";"
				}),
				models: this.getView().getModel('oTeamModel'),
				rows: {
					path: "/Teams"
				},
				columns: [{
					name: "Team ID",
					template: {
						content: "{oTeamModel>teamId}"
					}
				}, {
					name: "Team Name",
					
						content: "Grützi"
			
				}, {
					name: "Teamleiter",
					template: {
						content: "{oTeamModel>teamlead/vorname} {oTeamModel>teamlead/nachname}"
					}
				}, {
					name: "Notiz",
					template: {
						content: "{oTeamModel>note}"
					}
				}]
			});
		
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Stinkig\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},




		onDeleteFundus: function(){


			var oTable = this.byId("TeamTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			var aTeamsSelected = [];
			for (var i = 0; i < aSelectedIndices.length; i++) {
				var oSelectedContext = oTable.getContextByIndex(aSelectedIndices[i]);
				var oSelectedData = oSelectedContext.getObject();
				aTeamsSelected.push(oSelectedData);

			}
			console.warn("Grungo")
			console.log(aTeamsSelected)
			var oController = this;
			aTeamsSelected.forEach(Team => {
				console.log("Jetzt gehts los")
				console.log(Team.teamId)
				jQuery.ajax({
					type: "DELETE",
					contentType: "application/json",
					url: "http://localhost:3000/api/Team",
					dataType: "json",
					data: JSON.stringify({ teamLeaderID: Team.teamLeaderID, teamId: Team.teamId, token : this.token}),
					async: true,
					success: function (oResponse) {
						sap.m.MessageToast.show("Update erfolgreich!")
						oController.loadData();
					},
					error: function (oResponse) {
						ResponseStatusHelper.handleStatusCode(oResponse,oController);
					}
				})})

	},

		getUserNameById: function(userID) {
		
			var oModel = this.getView().getModel('oTeamModel');

			console.log(oModel);
		},


		onResetUserPW: function(e){
			this.getUserNameById(6);
			console.log("lol")
			var sPath = e.getSource().getBindingContext('oTeamModel').getPath();
			var oModel = this.getView().getModel('oTeamModel');
			var oUserData = oModel.getProperty(sPath);
			console.log(oUserData);
			var oController = this;
			

		},

		sortCategoriesAndName : function(oEvent){
			var oView = this.getView();
			var oTable = oView.byId("TeamTable");
			oTable.sort(oView.byId("categories"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("name"), SortOrder.Ascending, true);
		},

		sortDeliveryDate : function(oEvent) {
			var oCurrentColumn = oEvent.getParameter("column");
			var oDeliveryDateColumn = this.byId("deliverydate");
			if (oCurrentColumn != oDeliveryDateColumn) {
				oDeliveryDateColumn.setSorted(false); //No multi-column sorting
				return;
			}

			oEvent.preventDefault();

			var sOrder = oEvent.getParameter("sortOrder");
			var oDateFormat = DateFormat.getDateInstance({pattern: "dd/MM/yyyy"});

			this._resetSortingState(); //No multi-column sorting
			oDeliveryDateColumn.setSorted(true);
			oDeliveryDateColumn.setSortOrder(sOrder);

			var oSorter = new Sorter(oDeliveryDateColumn.getSortProperty(), sOrder === SortOrder.Descending);
			//The date data in the JSON model is string based. For a proper sorting the compare function needs to be customized.
			oSorter.fnCompare = function(a, b) {
				if (b == null) {
					return -1;
				}
				if (a == null) {
					return 1;
				}

				var aa = oDateFormat.parse(a).getTime();
				var bb = oDateFormat.parse(b).getTime();

				if (aa < bb) {
					return -1;
				}
				if (aa > bb) {
					return 1;
				}
				return 0;
			};

			this.byId("TeamTable").getBinding().sort(oSorter);
		},

		_resetSortingState : function() {
			var oTable = this.byId("TeamTable");
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},


	});

});