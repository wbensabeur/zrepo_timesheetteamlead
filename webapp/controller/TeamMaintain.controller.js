sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, formatter, datetime, Filter, FilterOperator, MessageBox, MessageToast) {
	"use strict";
	return BaseController.extend("com.vinci.timesheet.admin.controller.TeamMaintain", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.TeamMaintain
		 */
		onInit: function() {
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			this.getRouter().getRoute("TeamMaintain").attachPatternMatched(this._onObjectMatched, this);
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTotalTeams: 0,
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},
		onUpdateStart: function(oEvent) {
			this.byId("table").setBusy(true);
		},
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			this.byId("table").setBusy(false);
			var sTotalTeam, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			this.totalEmp = iTotalItems;
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTotalTeam = iTotalItems;
			} else {
				sTotalTeam = 0;
			}
			this.getModel("worklistView").setProperty("/worklistTableTotalTeams", sTotalTeam);
			this.getModel("teamDetail").setProperty("/data/0/TotalTeams", sTotalTeam);
			this.getModel("teamDetail").setProperty("/data/0/BUText", this.getModel("userPreference").getProperty("/defaultBUT"));
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.vinci.timesheet.admin.view.TeamMaintain
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.vinci.timesheet.admin.view.TeamMaintain
		 */
		onAfterRendering: function() {

		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.vinci.timesheet.admin.view.TeamMaintain
		 */
		//	onExit: function() {
		//
		//	}
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.TeamMaintain
		 */
		teamDetailModel: function() {
			var oTeamDetailData = {
				data: []
			};
			var idata = {
				BUText: this.userPref.defaultBU,
				TotalTeams: "",
				width: "100%"
			};
			var oTeamDetailModel = new JSONModel(oTeamDetailData);
			oTeamDetailData.data.push(idata);
			this.setModel(oTeamDetailModel, "teamDetail");
			this._applyFilters();
		},
		_applyFilters: function() {
			var oTable = this.byId("table");
			var Filters = [
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU)
			];
			oTable.getBinding("items").filter(Filters, "Application");
			oTable.getBinding("items").resume();
		},
		_onObjectMatched: function(oEvent) {
			this.refresh = false;
			this.userPref = this.getView().getModel("userPreference").getData();
			this.teamDetailModel();
		},
		onPressCancel: function() {
			this.getRouter().navTo("TeamManage", {
				source: 'TeamMaintain'
			}, true);
		},
		OnTeamDetailsReset: function(oEvent) {
			var localData = this.getView().getModel().getProperty(oEvent.getSource().getBindingContext().getPath());
			var localCellControl = oEvent.getSource().getParent().getParent().getParent();
			var localCellDataControl = localCellControl.getItems()[0].getItems()[0].getItems()[1];
			// Team Name
			localCellDataControl.getItems()[1].getItems()[0].setValue(localData.TeamName);
			// Team Description
			localCellDataControl.getItems()[2].getItems()[0].setValue(localData.TeamDescription);
		},
		onPressSaveEntries: function() {
			var requestBody = {
				"UserId": this.userPref.userID,
				"ProcessingMode": "THC", // THC :- Team  Header Create
				"NavTeamActionTeams": []
			};
			var tableItems = this.byId("table").getItems();
			for (var i = 0; i < tableItems.length; i++) {
				var tableItemCells = tableItems[i].getCells();
				for (var e = 0; e < tableItemCells.length; e++) {
					var Items = tableItemCells[0].getItems()[0].getItems()[0].getItems()[0].getItems()[1].getItems();
					var localTeamId = Items[0].getItems()[0].getValue();
					var localTeamName = Items[1].getItems()[0].getValue();
					var localTeamDescription = Items[2].getItems()[0].getValue();
					var locatData = {
						UserId: this.userPref.userID,
						BusinessUnit: this.userPref.defaultBU,
						TeamId: localTeamId,
						TeamName: localTeamName,
						TeamDescription: localTeamDescription,
						ProcessingMode: null
					};
					requestBody.NavTeamActionTeams.push(locatData);
				}
			}
			var that = this;
			this.getView().setBusy(true);
			this.getView().getModel().create("/TeamActionSet", requestBody, {
				success: function() {
					that.getView().setBusy(false);
					MessageToast.show(that.getResourceBundle().getText("successTeamRegisterPostMsg"));
					//Home Page
					that.getRouter().navTo("TeamManage", {
						source: 'TeamMaintain'
					}, true);
					//	that.getRouter().navTo("TeamManage", {}, true);
					that.getView().getModel("userPreference").setProperty("/successTeamSubmit", true);
				},
				error: function() {
					that.getView().setBusy(false);
				}
			});
		}
	});
});