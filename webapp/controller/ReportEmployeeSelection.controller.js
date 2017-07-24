sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, formatter, datetime, Filter, FilterOperator, MessageBox) {
	"use strict";
	return BaseController.extend("com.vinci.timesheet.admin.controller.ReportEmployeeSelection", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.ReportEmployeeSelection
		 */
		onInit: function() {
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			this.getRouter().getRoute("ReportEmployeeSelection").attachPatternMatched(this._onObjectMatched, this);
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._oTableSearchState = [];
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
		},
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt1", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt2", this.getModel("userPreference").getProperty("/defaultBU"));
			/*var col1 = oTable.getColumns()[0].getWidth();
							alert(col1);*/
		},
		OnEmployeePress: function(oEvent) {
			var empBox = oEvent.getSource();
			//var empID = empBox.getCustomData()[1].getValue();
			if (empBox.getCustomData()[0].getValue() === "") {
				empBox.getCustomData()[0].setValue("S");
				empBox.getParent().getCustomData()[0].setValue("S");
				this.employeeSelected.employees.push(empBox);
				// employee ID
				
			} else {
				empBox.getCustomData()[0].setValue("");
				empBox.getParent().getCustomData()[0].setValue("");
				var index = this.employeeSelected.employees.indexOf(empBox);
				this.employeeSelected.employees.splice(index, 1);
				
			}
		},
		onPressCancel: function() {
			this.getRouter().navTo("home", {}, true);
			var boxes = this.employeeSelected.employees;
			for (var k = 0;k < boxes.length; k++ ){
				boxes[k].getCustomData()[0].setValue("");
				boxes[k].getParent().getCustomData()[0].setValue("");
			}
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.vinci.timesheet.admin.view.ReportEmployeeSelection
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.vinci.timesheet.admin.view.ReportEmployeeSelection
		 */
		//	onAfterRendering: function() {
		//
		//	},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.vinci.timesheet.admin.view.ReportEmployeeSelection
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
		_applyFilters: function() {
			var oTable = this.byId("table");
			var Filters = [
				new Filter("WeekNumber", FilterOperator.EQ, this.currentWeekNumber),
				new Filter("WeekYear", FilterOperator.EQ, this.currentYear),
				new Filter("isByWeekly", FilterOperator.EQ, this.twoWeek)
			];
			if (this.userPref.employeeFilter != null && this.userPref.employeeFilter.length > 0) {
				Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.userPref.employeeFilter));
			}
			oTable.getBinding("items").filter(Filters, "Application");
		},
		_onObjectMatched: function(oEvent) {
			this.userPref = $.extend({}, this.getView().getModel("userPreference").getData());
			this.employeeSelected = this.getView().getModel("employeeSelected").getData();
			this.employeeSelected.startDate = this.userPref.startDate;
			if (this.userPref.defaultPeriod === 1) {
				this.twoWeek = false;
			} else {
				this.twoWeek = false;
				this.userPref.defaultPeriod = 1;
				this.userPref.startDate = datetime.getNextWeek(this.userPref.startDate);
			}
			this._calendarBinding(this.userPref.startDate, this.userPref.defaultPeriod);
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.ReportEmployeeSelection
		 */
		OnWeeklyReportPress: function() {
			if (this.employeeSelected.employees.length > 0) {
				this.getRouter().navTo("WeeklyReport", {}, true);
			} else {
				MessageBox.alert("Planning is only support for weekly view selection");
			}
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.ReportEmployeeSelection
		 */
		OnSelectionReSet: function() {
			var boxes = this.employeeSelected.employees;
			for (var k = 0;k < boxes.length; k++ ){
				boxes[k].getCustomData()[0].setValue("");
				boxes[k].getParent().getCustomData()[0].setValue("");
			}
		}
	});
});