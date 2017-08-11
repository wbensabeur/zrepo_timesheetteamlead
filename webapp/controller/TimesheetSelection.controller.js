sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, formatter, datetime, Filter, FilterOperator,MessageBox) {
	"use strict";
	return BaseController.extend("com.vinci.timesheet.admin.controller.TimesheetSelection", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.TimesheetSelection
		 */
		onInit: function() {
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			this.getRouter().getRoute("periodSelection").attachPatternMatched(this._onObjectMatched, this);
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
		onUpdateStart: function(oEvent) {

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
		OnHourPress: function(oEvent) {
			var button = oEvent.getSource();
			if (button.getCustomData()[0].getValue() === "") {
				button.getCustomData()[0].setValue("S");
				var empId = button.getCustomData()[2].getValue();
				var sDay = button.getCustomData()[3].getValue();
				var index = this._EmployeeIndexInArray(empId); //this.employees.indexOf(empId);
				if (index === -1) {
					var data = {
						employee: empId,
						Days: [sDay]
					};
					this.employees.push(data);
				} else {
					if (this.employees[index].Days.indexOf(sDay) === -1) {
						this.employees[index].Days.push(sDay);
					}
				}

			} else {
				button.getCustomData()[0].setValue("");
				var empId2 = button.getCustomData()[2].getValue();
				var sDay2 = button.getCustomData()[3].getValue();
				var empIndex = this._EmployeeIndexInArray(empId2);
				var index2 = this.employees[empIndex].Days.indexOf(sDay2);
				this.employees[empIndex].Days.splice(index2, 1);
				if (this.employees[empIndex].Days.length === 0) {

					this.employees.splice(empIndex, 1);

				}
			}
		},
		OnDatePress: function(oEvent) {
			var source = oEvent.getSource();
			var headerSeq = source.getParent().getParent().getInitialOrder();
			var Items = source.getParent().getParent().getParent().getItems();
			if (source.getCustomData()[0].getValue() === "") {
				source.getCustomData()[0].setValue("S");
				//	this.days.push(source.getCustomData()[1].getValue());
				source.getParent().getCustomData()[0].setValue("S");
				for (var k = 0; k < Items.length; k++) {
					var button = oEvent.getSource().getParent().getParent().getParent().getItems()[k].getCells()[headerSeq];
					if (button.getEnabled()) {
						button.getCustomData()[0].setValue("S");
						var empId = button.getCustomData()[2].getValue();
						var sDay = button.getCustomData()[3].getValue();
						var index = this._EmployeeIndexInArray(empId); //this.employees.indexOf(empId);
						if (index === -1) {
							var data = {
								employee: empId,
								Days: [sDay]
							};
							this.employees.push(data);

						} else {
							if (this.employees[index].Days.indexOf(sDay) === -1) {
								this.employees[index].Days.push(sDay);
							}
						}

					}
				}
			} else {
				source.getCustomData()[0].setValue("");
				source.getParent().getCustomData()[0].setValue("");
				//var index2 = this.days.indexOf(source.getCustomData()[1].getValue());
				//this.days.splice(index2, 1);

				for (var j = 0; j < Items.length; j++) {
					var button1 = oEvent.getSource().getParent().getParent().getParent().getItems()[j].getCells()[headerSeq];
					if (button1.getEnabled()) {
						button1.getCustomData()[0].setValue("");
						var empId2 = button1.getCustomData()[2].getValue();
						var sDay2 = button1.getCustomData()[3].getValue();
						var empIndex = this._EmployeeIndexInArray(empId2);
						var index2 = this.employees[empIndex].Days.indexOf(sDay2);
						this.employees[empIndex].Days.splice(index2, 1);
						if (this.employees[empIndex].Days.length === 0) {

							this.employees.splice(empIndex, 1);

						}

					}
				}
			}
		},
		OnEmployeePress: function(oEvent) {
			var empBox = oEvent.getSource();
			var empId = empBox.getCustomData()[1].getValue();
			if (empBox.getCustomData()[0].getValue() === "") {
				empBox.getCustomData()[0].setValue("S");
				empBox.getParent().getCustomData()[0].setValue("S");
				var index = this._EmployeeIndexInArray(empId);
				if (index === -1) {
					var data = {
						employee: empId,
						Days: []
					};
					this.employees.push(data);
				}
				var emphours = empBox.getParent().getParent().getCells();
				var sDate = [];
				for (var k = 1; k < 15; k++) {

					var button = emphours[k];
					if (button.getCustomData()[1].getValue() !== "L") {
						button.getCustomData()[0].setValue("S");
						sDate.push(button.getCustomData()[3].getValue());
					}
				}
				var index3 = this._EmployeeIndexInArray(empId);
				this.employees[index3].Days = sDate;
			} else {
				empBox.getCustomData()[0].setValue("");
				empBox.getParent().getCustomData()[0].setValue("");
				var index2 = this._EmployeeIndexInArray(empId);
				this.employees.splice(index2, 1);
				var emphours1 = empBox.getParent().getParent().getCells();
				for (var k1 = 1; k1 < 15; k1++) {
					var button1 = emphours1[k1];
					if (button1.getCustomData()[1].getValue() !== "L") {
						button1.getCustomData()[0].setValue("");
					}
				}
			}
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.vinci.timesheet.admin.view.TimesheetSelection
		 */
		//		onBeforeRendering: function() {
		//		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.vinci.timesheet.admin.view.TimesheetSelection
		 */
		//		onAfterRendering: function() {

		//		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.vinci.timesheet.admin.view.TimesheetSelection
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
				new Filter("isByWeekly", FilterOperator.EQ, this.twoWeek),
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU)
			];
			if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
				Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.userPref.employeeFilter));
			}
			oTable.getBinding("items").filter(Filters, "Application");
		},
		_onObjectMatched: function(oEvent) {
			this.userPref = this.getView().getModel("userPreference").getData();
			if (this.userPref.defaultPeriod === 1) {
				this.twoWeek = false;
			} else {
				this.twoWeek = true;
			}
			this._calendarBinding(this.userPref.startDate, this.userPref.defaultPeriod);
			this.employees = this.getView().getModel("employeeDaysSelected").getData();
			/*this.employees = [];
			this.byId("table").getBinding("items").refresh();*/

		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.TimesheetSelection
		 */
		onPressCancel: function() {
			this.getRouter().navTo("home", {}, true);
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.TimesheetSelection
		 */
		OnAddTimesheet: function() {
				if (this.employees.length > 0) {
				this.getRouter().navTo("AddTimesheet", {}, true);
			} else {
				MessageBox.alert(this.getResourceBundle().getText("msgNoEmployeeDaySelected"));
			}
			
			
		},
		_EmployeeIndexInArray: function(empId) {
			for (var k = 0; k < this.employees.length; k++) {
				if (this.employees[k].employee === empId)
					return k;
			}
			return -1;
		}

	});
});