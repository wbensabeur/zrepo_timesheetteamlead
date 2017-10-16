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
	return BaseController.extend("com.vinci.timesheet.admin.controller.TeamManage", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.TeamManage
		 */
		onInit: function() {
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			this.getRouter().getRoute("TeamManage").attachPatternMatched(this._onObjectMatched, this);
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this.teamsSelected = [];
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
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
			var that = this;
			/*this.getView().byId('tableHeader').onAfterRendering = function(oEvent) {
				//var comboId =  that.getView().byId('tableColumnCombo').getId() + '-inner';
				try {
					var elements = document.getElementsByClassName("tableColumnCombo"); //
					for (var k = 0; k < elements.length; k++) {
						var eleId = elements[k].id + '-inner';
						document.getElementById(eleId).disabled = true; // .get.("tableColumnCombo")
						//	elements[k].disabled = true;
					}
				} catch (err) {

				}

			};*/

			$(window).resize(function() {
				var totalH = window.innerHeight - 200;
				that.getView().byId('TableScroll').setHeight(totalH + 'px');
			});
		},
		onUpdateStart: function(oEvent) {
			this.byId("table").setBusy(true);
		},
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			this.byId("table").setBusy(false);
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			this.totalEmp = iTotalItems;
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("teamHeader").setProperty("/data/0/ColumnTxt1", sTitle);
			this.getModel("teamHeader").setProperty("/data/0/ColumnTxt2", this.getModel("userPreference").getProperty("/defaultBUT"));
			this.teamItemBinding();
		},
		OnTeamSelActionPress: function(oEvent) {
			var button = oEvent.getSource();
			var localTeamAssigned, entryFount = false;
			if (button.getIcon() === "sap-icon://border") {
				button.setIcon("sap-icon://color-fill");
				localTeamAssigned = true;
			} else if (button.getIcon() === "sap-icon://color-fill") {
				button.setIcon("sap-icon://border");
				localTeamAssigned = false;
			}
			var localData = {
				employee: button.data().employee,
				selectedTeam: button.data().selectedTeam,
				teamAssigned: localTeamAssigned
			};
			// if entry already exist then replace it
			for (var i = 0; i < this.teamsSelected.length; i++) {
				if (this.teamsSelected[i].employee === button.data().employee &&
					this.teamsSelected[i].selectedTeam === button.data().selectedTeam) {
					this.teamsSelected[i] = localData;
					entryFount = true;
					break;
				}
			}
			if (entryFount === false) {
				this.teamsSelected.push(localData);
			}
		},
		OnDatePress: function(oEvent) {
			return;
		},
		OnEmployeePress: function(oEvent) {
			return;
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.vinci.timesheet.admin.view.TeamManage
		 */
		//		onBeforeRendering: function() {
		//		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.vinci.timesheet.admin.view.TeamManage
		 */
		onAfterRendering: function() {
			var totalH = window.innerHeight - 200;
			this.getView().byId('TableScroll').setHeight(totalH + 'px');

		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.vinci.timesheet.admin.view.TeamManage
		 */
		//	onExit: function() {
		//
		//	}
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_calendarBinding: function(startDate, noOfWeek) {
			var caldenderdata = datetime.getCalenderData(startDate, noOfWeek, this.getResourceBundle());
			var oCalendarModel = new JSONModel(caldenderdata);
			this.setModel(oCalendarModel, "calendar");
			// Change Table OData Binding
			var monday = datetime.getMonday(startDate);
			this.currentWeekNumber = datetime.getWeek(monday);
			this.currentYear = new Date(monday.getTime()).getFullYear();
			this._applyFilters();
		},
		teamBinding: function() {
			var thatControl = this;
			var Filters = [
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU)
			];
			var mParameters = {
				filters: Filters,
				success: function(oData, oResponse) {
					thatControl.buildSuccTeamHeader(oData);
				},
				error: function(oError) {
					thatControl.buildErrTeamHeader(thatControl.userPref);
				}
			};
			this.getView().getModel().read("/TeamSet", mParameters);
		},
		buildSuccTeamHeader: function(data) {
			var oTeamData = {
				data: []
			};
			// 1st Cloumn for Employee
			var idata = {
				ColumnTxt1: this.getResourceBundle().getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: '...',
				ComboVisible: true,
				width: '18.18%',
				cssClass: 'tableColumnE',
				Date: null,
				team: null,
				isByWeekly: false
			};
			oTeamData.data.push(idata);
			// other Cloumns for Team
			for (var i = 0; i < data.results.length; i++) {
				var cData = {
					ColumnTxt1: data.results[i].TeamName,
					ColumnTxt2: data.results[i].TeamDescription,
					width: "auto",
					cssClass: 'tableColumn',
					ComboVisible: false,
					Date: null,
					team: data.results[i].TeamId,
					isByWeekly: false
				};
				oTeamData.data.push(cData);
			}
			var oTeamHeaderrModel = new JSONModel(oTeamData);
			this.setModel(oTeamHeaderrModel, "teamHeader");
		},
		buildErrTeamHeader: function(userPref) {
			var oTeamData = {
				data: []
			};
			// 1st Cloumn for Employee
			var idata = {
				ColumnTxt1: this.getResourceBundle().getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: '...',
				ComboVisible: true,
				width: '18.18%',
				cssClass: 'tableColumnE',
				Date: null,
				team: null,
				isByWeekly: false
			};
			oTeamData.data.push(idata);
			// other Cloumns for Team
			for (var i = 1; i < 8; i++) {
				var localTeamId = userPref.userID + "_" + userPref.defaultBU + "_" + "TEAM" + "_" + i;
				var cData = {
					ColumnTxt1: this.getResourceBundle().getText("tablleColTitleTeam"),
					ColumnTxt2: i,
					width: "auto",
					cssClass: 'tableColumn',
					ComboVisible: false,
					Date: null,
					team: localTeamId,
					isByWeekly: false
				};
				oTeamData.data.push(cData);
			}
			var oTeamHeaderrModel = new JSONModel(oTeamData);
			this.setModel(oTeamHeaderrModel, "teamHeader");
		},
		teamItemBinding: function() {
			var thatControl = this;
			var Filters = [
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU)
			];
			var mParameters = {
				filters: Filters,
				success: function(oData, oResponse) {
					thatControl.buildSuccTeamItem(oData);
				},
				error: function(oError) {
					thatControl.buildErrTeamItem();
				}
			};
			this.getView().getModel().read("/TeamEmployeeSet", mParameters);
		},
		buildSuccTeamItem: function(data) {
			var tableItems = this.byId("table").getItems();
			for (var i = 0; i < tableItems.length; i++) {
				var tableItemCells = tableItems[i].getCells();
				for (var e = 1; e < tableItemCells.length; e++) {
					var localEmpId = tableItemCells[e].data().employee;
					var localTeamId = tableItemCells[e].data().selectedTeam;
					var localBusinessUnit = this.userPref.defaultBU;
					var localUserId = this.userPref.userID;
					var path = "/TeamEmployeeSet(UserId='" + localUserId +
						"',BusinessUnit='" + localBusinessUnit +
						"',TeamId='" + localTeamId + "',EmpId='" + localEmpId + "')";
					try {
						var localTeamAssigned = this.getView().getModel().getProperty(path).TeamAssigned;
					} catch (e) {
						localTeamAssigned = false;
					}
					if (localTeamAssigned === true) {
						tableItemCells[e].setIcon("sap-icon://color-fill");
					} else {
						tableItemCells[e].setIcon("sap-icon://border");
					}
				}
			}
		},
		buildErrTeamItem: function() {
			var tableItems = this.byId("table").getItems();
			for (var i = 0; i < tableItems.length; i++) {
				var tableItemCells = tableItems[i].getCells();
				for (var e = 1; e < tableItemCells.length; e++) {
					tableItemCells[e].setIcon("sap-icon://border");
				}
			}
		},
		_applyFilters: function() {
			var oTable = this.byId("table");
			var Filters = [
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU)
			];
			if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
				Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.userPref.employeeFilter));
			}
			oTable.getBinding("items").filter(Filters, "Application");
		},
		_onObjectMatched: function(oEvent) {
			var argument = oEvent.getParameter("arguments");
			this.refresh = false;
			this.teamsSelected = [];
			this.userPref = this.getView().getModel("userPreference").getData();
			if (this.userPref.defaultPeriod === 1) {
				this.twoWeek = false;
			} else {
				this.twoWeek = true;
			}
			this._calendarBinding(this.userPref.startDate, this.userPref.defaultPeriod);
			this.teamBinding();
			this.employees = this.getView().getModel("employeeDaysSelected").getData();
			if (argument.source === 'Summary') {
				this.refresh = true;
			}
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.TeamManage
		 */
		onPressCancel: function() {

			this.getRouter().navTo("home", {}, true);
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.TeamManage
		 */
		onManageTeamEntry: function(oEvent) {
			if (this.teamsSelected.length === 0) {

			}
			var requestBody = {
				"UserId": this.userPref.userID,
				"BusinessUnit": this.userPref.defaultBU,
				"TeamId": "Team",
				"ProcessingMode": "TIC", // TIC :- Team  Item Create
				"NavTeamEmployees": []
			};
			for (var i = 0; i < this.teamsSelected.length; i++) {
				var locatData = {
					UserId: this.userPref.userID,
					BusinessUnit: this.userPref.defaultBU,
					TeamId: this.teamsSelected[i].selectedTeam,
					EmpId: this.teamsSelected[i].employee,
					TeamAssigned: this.teamsSelected[i].teamAssigned
				};
				requestBody.NavTeamEmployees.push(locatData);
			}
			var that = this;
			this.getView().setBusy(true);
			this.getView().getModel().create("/TeamSet", requestBody, {
				success: function() {
					that.getView().setBusy(false);
					MessageToast.show(that.getResourceBundle().getText("successTeamRegisterPostMsg"));
					//Home Page
					that.getRouter().navTo("home", {}, true);
					that.getView().getModel("userPreference").setProperty("/successTeamSubmit", true);
				},
				error: function() {
					that.getView().setBusy(false);
				}
			});
		},
		onManageTeamName: function(oEvent) {
			this.getRouter().navTo("TeamMaintain", {
				source: 'TeamManage'
			}, true);
		}
	});
});