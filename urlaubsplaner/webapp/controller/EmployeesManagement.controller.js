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
	"./helper/ResponseStatusHelper",
	"./helper/DataHelper"
], function (Log, Controller, Sorter, JSONModel, DateFormat, ToolbarSpacer, library, jQuery, Fragment, MessageToast, ResponseStatusHelper, Datahelper) {
	"use strict";

	// shortcut for sap.ui.table.SortOrder
	var SortOrder = library.SortOrder;

	return Controller.extend("urlaubsplaner.urlaubsplaner.controller.Dashboard", {

		onInit: function () {
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


			if (this.token) {
				var oModel = new sap.ui.model.json.JSONModel();
				var oView = this.getView();
				oModel.setProperty("/bEdit", false);
				oView.setModel(oModel, "oEmployeesModel");
				this.loadData();
			} else {
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

			// MOCK-Data Team
			//Aufruf GET /Api/User

			var oView = this.getView();
			var oModel = oView.getModel("oEmployeesModel");
			var oController = this;
			var aArray = [];



			var oParams = { "token": this.token };
			var sURL = "http://localhost:3000/api/User";

			Datahelper.read(sURL, oParams, oController).then(function (oResponse) {
				console.log(oResponse);
				oModel.setProperty("/Users", oResponse.allUsers)
				oView.setModel(oModel, "oEmployeesModel");
				
				//oController.loadTeamData();
			}.bind(this)).catch(function (oError) {
				console.log(oError);
				if (oResponse.status === 401) {
					MessageToast.show("Deine Sitzung ist abgelaufen");
					var oRouter = oController.getOwnerComponent().getRouter();
					oRouter.navTo("RouteLogin", {}, true);
				}
			})



			

		},


		loadDataIntoUser: function (userID) {

			//Aufruf  POST  /api/user


		},


		clearAllSortings: function (oEvent) {
			var oTable = this.byId("EmployeesTable");
			oTable.getBinding().sort(null);
			this._resetSortingState();
		},

		onEdit: function () {
			this.byId("EmployeesTable").setSelectionMode("MultiToggle");
			this.getView().getModel("oEmployeesModel").setProperty("/bEdit", true);


		},

		onAbortEdit: function () {
			this.byId("EmployeesTable").setSelectionMode("None");
			this.getView().getModel("oEmployeesModel").setProperty("/bEdit", false);


		},

		deleteEmployee: function () {
			var oTable = this.byId("oEmployeesModel");
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



		onEditUser: function (e) {
			var oView = this.getView();
			var sPath = e.getSource().getBindingContext('oEmployeesModel').getPath();
			var oModel = this.getView().getModel('oEmployeesModel');
			var oUserData = oModel.getProperty(sPath);
			var oEditModel = new sap.ui.model.json.JSONModel();
			switch (oUserData.role) {
				case "Mitarbeiter":
					oUserData.rolekey = "MA";
					break;
				case "Vorgesetzter":
					oUserData.rolekey = "TL";
					break;
				case "Mitarbeiter Personalabteilung":
					oUserData.rolekey = "BO";
					break;
				case "Administrator":
					oUserData.rolekey = "AD";
					break;
				default:
					break;
			}
			oEditModel.setProperty("/EditUser", oUserData);
			oView.setModel(oEditModel, "oEditModel");
			console.log(oEditModel);
			this.openDialog();

		},



		onCreateUser: function () {
			this.openCreateDialog();
		},


		onDeleteFlumbus: function () {


			var oTable = this.byId("EmployeesTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			var aEmployeesSelected = [];
			for (var i = 0; i < aSelectedIndices.length; i++) {
				var oSelectedContext = oTable.getContextByIndex(aSelectedIndices[i]);
				var oSelectedData = oSelectedContext.getObject();
				aEmployeesSelected.push(oSelectedData);

			}
			console.warn("Grungo")
			console.log(aEmployeesSelected)
			var oController = this;
			aEmployeesSelected.forEach(User => {
				jQuery.ajax({
					type: "DELETE",
					contentType: "application/json",
					url: "http://localhost:3000/api/User",
					dataType: "json",
					data: JSON.stringify({ "userID": User.userID, "token": this.token }),
					async: true,
					success: function (oResponse) {
						sap.m.MessageToast.show("Update erfolgreich!")
						oController.loadData();
					},
					error: function (oResponse) {
						ResponseStatusHelper.handleStatusCode(oResponse, oController);
						oController.loadData();
					}
				})
			})

		},


		loadTeamData: function () {

			console.log("loadTeamData sollte hier stattfinden. doch // ");
			// var oModel = this.getView().getModel("oEmployeesModel");

			// var oModel = this.getView().getModel("oEmployeesModel");
			// jQuery.ajax({
			// 	type: "GET",
			// 	contentType: "application/json",
			// 	url: "http://localhost:3000/api/Team",
			// 	data: $.param({ "token" : this.token}),
			// 	dataType: "json",
			// 	async: true,
			// 	success: function (oResponse) {
			// 		console.log("Team Daten geladen!");
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



		openDialog: function () {
			var oView = this.getView();
			if (!this.byId("EmployeeEditDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: this.getView().getId(),
					name: "urlaubsplaner.urlaubsplaner.view.dialogs.EmployeesEditDialog",
					controller: this
				}).then(function (oDialog) {

					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("EmployeeEditDialog").open();
			}
		},


		openCreateDialog: function () {
			var oView = this.getView();
			if (!this.byId("EmployeeCreateDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: this.getView().getId(),
					name: "urlaubsplaner.urlaubsplaner.view.dialogs.EmployeesCreateDialog",
					controller: this
				}).then(function (oDialog) {

					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("EmployeeCreateDialog").open();
			}
		},

		sortCategories: function (oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("EmployeesTable");
			var oCategoriesColumn = oView.byId("categories");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		clearAllFilters: function (oEvent) {
			var oTable = this.byId("EmployeesTable");

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
		_filter: function () {
			var oFilter = null;

			this.byId("EmployeesTable").getBinding().filter(oFilter, "Application");
		},


		closeEditDialog: function () {
			this.byId("EmployeeEditDialog").close();
		},
		closeCreateDialog: function () {
			var oView = this.getView();
			this.byId("EmployeeCreateDialog").close();
			oView.byId("EmployeeCreateFirstname").setValue("");
			oView.byId("EmployeeCreateLastname").setValue("");
			oView.byId("EmployeeCreateVacation").setValue(0);
			oView.byId("EmployeeCreateNote").setValue("");
			oView.byId("EmployeeCreateUserName").setValue("");
			oView.byId("EmployeeCreateRole").setSelectedIndex(0)
			oView.byId("EmployeeCreateTeam").setSelectedIndex(0)
			this.onAbortEdit();
		},


		firstUp: function (oFlum) {
			var uncap = oFlum.toLowerCase();
			var cap = uncap.charAt(0).toUpperCase() + uncap.slice(1);
			return cap;
		},

		createEmployee: function () {
			var oView = this.getView();
			var oController = this;
			var sUserName = oView.byId("EmployeeCreateUserName").getValue();
			var sFirstNameUncap = oView.byId("EmployeeCreateFirstname").getValue();
			var sLastNameUncap = oView.byId("EmployeeCreateLastname").getValue();
			var sRole = oView.byId("EmployeeCreateRole").getSelectedItem().getText();
			var sGesamtUrlaub = oView.byId("EmployeeCreateVacation").getValue();
			var sNotiz = oView.byId("EmployeeCreateNote").getValue();
			var sTeam = oView.byId("EmployeeCreateTeam").getSelectedKey();
			var sRestUrlaub = 0;


			var sFirstName = this.firstUp(sFirstNameUncap);
			var sLastName = this.firstUp(sLastNameUncap);

			var Emailformat = /\S+@\S+\.\S+/;
			if (!Emailformat.test(sUserName)) {
				sap.m.MessageToast.show("Der Benutzername muss eine gültige E-Mail-Adresse sein.");
				return;
			}

			if (!sGesamtUrlaub) {
				sap.m.MessageToast.show("Bitte geben Sie den Gesamturlaub an.");
				return;
			}

			$.ajax({
				url: "/api/User",
				method: "POST",
				data: {
					username: sUserName,
					vorname: sFirstName,
					nachname: sLastName,
					role: sRole,
					gesUrlaub: sGesamtUrlaub,
					restUrlaub: sRestUrlaub,
					note: sNotiz,
					teamId: sTeam,
					token: this.token

				},
				success: function (oResponse) {
					console.log("Erfolgreich erstellt");
					oController.loadData();
				},
				error: function (oResponse) {
					console.error("Das hat leider nicht geklappt");

					oController.loadData();
				}
			});

			this.closeCreateDialog();
		},


		editEmployee: function () {
			var oView = this.getView();
			var oController = this;
			var oEditEmployee = oView.getModel("oEditModel").getProperty("/EditUser");
			var sRole = oView.byId("EmployeeEditRole").getSelectedItem().getText();
			console.log(oEditEmployee);
			$.ajax({
				url: "/api/user",
				method: "PUT",
				contentType: "application/json",
				dataType: "json",
				async: true,
				data: JSON.stringify({
					username: oEditEmployee.username,
					vorname: oEditEmployee.vorname,
					nachname: oEditEmployee.nachname,
					role: sRole,
					restUrlaub: oEditEmployee.restUrlaub,
					gesUrlaub: oEditEmployee.gesUrlaub,
					note: oEditEmployee.note,
					teamId: oEditEmployee.teamId,
					userID: oEditEmployee.userID,
					token: this.token
				}),
				success: function () {
					console.log("Erfolgreich überarbeitet");
					oView.getModel("oEditModel").setProperty("/EditUser", null);
					oController.loadData();
				},
				error: function (oResponse) {

					ResponseStatusHelper.handleStatusCode(oResponse, oController);
					oView.getModel("oEditModel").setProperty("/EditUser", null);
					oController.loadData();

				}

			});

			this.closeEditDialog();
		},

		onResetUserPW: function (e) {
			var sPath = e.getSource().getBindingContext('oEmployeesModel').getPath();
			var oModel = this.getView().getModel('oEmployeesModel');
			var oUserData = oModel.getProperty(sPath);
			console.log(oUserData);
			var oController = this;
			$.ajax({
				url: "/api/User",
				method: "PUT",
				contentType: "application/json",
				dataType: "json",
				async: true,
				data: JSON.stringify({
					userID: oUserData.userID,
					passwort: "ABC123",
					token: this.token
				}),
				success: function () {
					sap.m.MessageToast.show(`Passwort von User ${oUserData.username} wurde auf das Standardpasswort zurückgesetzt.`);
					oController.loadData();
				},
				error: function (oResponse) {
					console.log(oResponse);
					if (oResponse.status === 200) {
						sap.m.MessageToast.show(`Passwort von User ${oUserData.username} wurde auf das Standardpasswort zurückgesetzt.`);
					} else {
						if (oResponse.status === 401) {
							MessageToast.show("Deine Sitzung ist abgelaufen");
							var oRouter = oController.getOwnerComponent().getRouter();
							oRouter.navTo("RouteLogin", {}, true);
						}
						sap.m.MessageToast.show(`Passwort von User ${oUserData.username} konnte nicht zurückgesetzt werden!`);
					}

					oController.loadData();
				}
			});

		},

		sortCategoriesAndName: function (oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("EmployeesTable");
			oTable.sort(oView.byId("categories"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("name"), SortOrder.Ascending, true);
		},

		sortDeliveryDate: function (oEvent) {
			var oCurrentColumn = oEvent.getParameter("column");
			var oDeliveryDateColumn = this.byId("deliverydate");
			if (oCurrentColumn != oDeliveryDateColumn) {
				oDeliveryDateColumn.setSorted(false); //No multi-column sorting
				return;
			}

			oEvent.preventDefault();

			var sOrder = oEvent.getParameter("sortOrder");
			var oDateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });

			this._resetSortingState(); //No multi-column sorting
			oDeliveryDateColumn.setSorted(true);
			oDeliveryDateColumn.setSortOrder(sOrder);

			var oSorter = new Sorter(oDeliveryDateColumn.getSortProperty(), sOrder === SortOrder.Descending);
			//The date data in the JSON model is string based. For a proper sorting the compare function needs to be customized.
			oSorter.fnCompare = function (a, b) {
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

			this.byId("EmployeesTable").getBinding().sort(oSorter);
		},

		_resetSortingState: function () {
			var oTable = this.byId("EmployeesTable");
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},


	});

});