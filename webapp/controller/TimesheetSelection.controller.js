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
			this.selectedBox = [];
			this.daySelected = [];
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
			this.getView().byId('tableHeader').onAfterRendering = function(oEvent) {
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

			};

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
				if(this.userPref.teamName === null) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				}
				else {
					sTitle = "(" + iTotalItems + ") " + this.userPref.teamName; 
				}
			} else {
				if(this.userPref.teamName === null) {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				else {
					sTitle = this.userPref.teamName ;
				}
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt1", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt2", this.getModel("userPreference").getProperty("/defaultBUT"));

			if (this.refresh) {
				for (var k = 0; k < this.selectedBox.length; k++) {
					if (this.selectedBox[k].getCustomData().length > 0) {
						this.selectedBox[k].getCustomData()[0].setValue("");
					}
				}
				this.selectedBox = [];
				this.employees = [];
				this.getView().getModel("employeeDaysSelected").setData(this.employees);
				this.refresh = false;
				this.daySelected = [];
			} else {
				for (var l = 0; l < this.daySelected.length; l++) {
					var source = this.daySelected[l];
					var headerSeq = source.getParent().getParent().getInitialOrder();
					source.data('background'); //getCustomData()[0].setValue("S");
					source.getParent().data('background'); //.getCustomData()[0].setValue("S");
					var Items = this.getView().byId('table').getItems();
					for (var k1 = 0; k1 < Items.length; k1++) {
						var button = Items[k1].getCells()[headerSeq];
						if (button.getEnabled()) {
							button.getCustomData()[0].setValue("S");
						}
					}
				}
			}
			this.storeAllEmployee();

			/*var col1 = oTable.getColumns()[0].getWidth();
			alert(col1);*/

		},
		OnHourPress: function(oEvent) {
			var button = oEvent.getSource();
			if (button.data('status') === "") { // getCustomData()[0].getValue()
				button.getCustomData()[0].setValue("S");
				this.selectedBox.push(button);
				var empId = button.data('employee'); //.getCustomData()[2].getValue();
				var empName = button.data('employeeName');
				var sDay = button.data('selectedDate'); //.getCustomData()[3].getValue();
				var index = this._EmployeeIndexInArray(empId); //this.employees.indexOf(empId);
				if (index === -1) {
					var data = {
						employee: empId,
						employeeName: empName,
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
				var empId2 = button.data('employee'); //.getCustomData()[2].getValue();
				var sDay2 = button.data('selectedDate'); //.getCustomData()[3].getValue();
				var empIndex = this._EmployeeIndexInArray(empId2);
				var index2 = this.employees[empIndex].Days.indexOf(sDay2);
				this.employees[empIndex].Days.splice(index2, 1);
				var boxindex = this.selectedBox.indexOf(button);
				this.selectedBox.splice(boxindex, 1);
				if (this.employees[empIndex].Days.length === 0) {

					this.employees.splice(empIndex, 1);

				}
			}
		},
		OnDatePress: function(oEvent) {
			var source = oEvent.getSource();
			var headerSeq = source.getParent().getParent().getInitialOrder();
			//	var Items = source.getParent().getParent().getParent().getItems();
			var Items = this.getView().byId('table').getItems();
			if (source.getCustomData()[0].getValue() === "") {
				source.getCustomData()[0].setValue("S");
				this.daySelected.push(source);
				//	this.days.push(source.getCustomData()[1].getValue());
				source.getParent().getCustomData()[0].setValue("S");
				for (var k = 0; k < Items.length; k++) {
					var button = Items[k].getCells()[headerSeq];
					if (button.getEnabled()) {
						button.getCustomData()[0].setValue("S");
						this.selectedBox.push(button);
						var sDay = button.getCustomData()[3].getValue();
						/*var empId = button.getCustomData()[2].getValue();
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
						}*/

					}
				}
				if (this.allEmps !== null) {
					for (var m = 0; m < this.allEmps.length; m++)

					{
						var empId = this.allEmps[m].EmployeeId;
						var empName = this.allEmps[m].FullName;

						var index = this._EmployeeIndexInArray(empId); //this.employees.indexOf(empId);
						if (index === -1) {
							var data = {
								employee: empId,
								employeeName : empName,
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
				var index2 = this.daySelected.indexOf(source);
				this.daySelected.splice(index2, 1);

				source.getParent().getCustomData()[0].setValue("");
				//var index2 = this.days.indexOf(source.getCustomData()[1].getValue());
				//this.days.splice(index2, 1);

				for (var j = 0; j < Items.length; j++) {
					var button1 = Items[j].getCells()[headerSeq];
					if (button1.getEnabled()) {
						button1.getCustomData()[0].setValue("");
						var boxindex = this.selectedBox.indexOf(button1);
						this.selectedBox.splice(boxindex, 1);
						var sDay2 = button1.getCustomData()[3].getValue();

						/*var empId2 = button1.getCustomData()[2].getValue();
						var sDay2 = button1.getCustomData()[3].getValue();
						var empIndex = this._EmployeeIndexInArray(empId2);
						var index2 = this.employees[empIndex].Days.indexOf(sDay2);
						this.employees[empIndex].Days.splice(index2, 1);
						if (this.employees[empIndex].Days.length === 0) {

							this.employees.splice(empIndex, 1);

						}*/

					}
				}
				if (this.allEmps !== null) {
					for (var n = 0; n < this.allEmps.length; n++) {
						var empId2 = this.allEmps[n].EmployeeId;

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
			var empId = empBox.data('employee') ; //.getCustomData()[1].getValue();
			var empName = empBox.data('employeeName');
			if (empBox.getCustomData()[0].getValue() === "") {
				empBox.getCustomData()[0].setValue("S");
				this.selectedBox.push(empBox);
				empBox.getParent().getCustomData()[0].setValue("S");
				this.selectedBox.push(empBox.getParent());
				var index = this._EmployeeIndexInArray(empId);
				if (index === -1) {
					var data = {
						employee: empId,
						employeeName: empName,
						Days: []
					};
					this.employees.push(data);
				}
				var emphours = empBox.getParent().getParent().getCells();
				var sDate = [];
				for (var k = 1; k < 6; k++) {

					var button = emphours[k];
					if (button.getCustomData()[1].getValue() !== "L") {
						button.getCustomData()[0].setValue("S");
						this.selectedBox.push(button);
						sDate.push(button.getCustomData()[3].getValue());
					}
				}
				if (this.twoWeek) {
					for (var k = 8; k < 15; k++) {

						var button = emphours[k];
						if (button.getCustomData()[1].getValue() !== "L") {
							button.getCustomData()[0].setValue("S");
							this.selectedBox.push(button);
							sDate.push(button.getCustomData()[3].getValue());
						}
					}
				}

				var index3 = this._EmployeeIndexInArray(empId);
				this.employees[index3].Days = sDate;
			} else {
				empBox.getCustomData()[0].setValue("");
				var empindex1 = this.selectedBox.indexOf(empBox);
				this.selectedBox.splice(empindex1, 1);
				empBox.getParent().getCustomData()[0].setValue("");
				var empindex2 = this.selectedBox.indexOf(empBox.getParent());
				this.selectedBox.splice(empindex2, 1);
				var index2 = this._EmployeeIndexInArray(empId);
				this.employees.splice(index2, 1);
				var emphours1 = empBox.getParent().getParent().getCells();
				for (var k1 = 1; k1 < 15; k1++) {
					var button1 = emphours1[k1];
					if (button1.getCustomData()[1].getValue() !== "L") {
						var boxindex = this.selectedBox.indexOf(button1);
						this.selectedBox.splice(boxindex, 1);
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
		onAfterRendering: function() {
			var totalH = window.innerHeight - 200;
			this.getView().byId('TableScroll').setHeight(totalH + 'px');

		},
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
			if (this.userPref.teamFilter !== null && this.userPref.teamFilter.length > 0) {
				Filters.push(new Filter("TeamID", FilterOperator.EQ, this.userPref.teamFilter));
			}
			if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
				Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.userPref.employeeFilter));
			}
			oTable.getBinding("items").filter(Filters, "Application");
		},
		_onObjectMatched: function(oEvent) {
			var argument = oEvent.getParameter("arguments");
			this.refresh = false;
			this.allEmps = null;
			this.userPref = this.getView().getModel("userPreference").getData();
			if (this.userPref.defaultPeriod === 1) {
				this.twoWeek = false;
			} else {
				this.twoWeek = true;
			}
			this._calendarBinding(this.userPref.startDate, this.userPref.defaultPeriod);
			this.employees = this.getView().getModel("employeeDaysSelected").getData();
			if (argument.source === 'Summary') {

				this.refresh = true;

			}

			/*this.employees = [];
			this.byId("table").getBinding("items").refresh();*/

		},
		storeAllEmployee: function() {
			if (this.allEmps === null) {
				var Filters = [new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU),
					new Filter("IsTimeEntryEnable", FilterOperator.EQ, true)
				];

				if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
					Filters.push(new Filter("FullName", FilterOperator.Contains, this.userPref.employeeFilter));
				}
				var that = this;
				this.getModel().read("/EmployeeSet", {
					filters: Filters,
					urlParameters: {
						"$select": 'EmployeeId,FullName'
					},
					success: function(odata) {
						that.allEmps = odata.results;
						/*if (that.totalEmp !== odata.results.length)
							MessageBox.alert(that.getResourceBundle().getText("alertNotAllEmp"));*/
					}

				});
			}
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.TimesheetSelection
		 */
		onPressCancel: function() {

			this.getRouter().navTo("home", {}, true);
		},
		OnTableTeamChange : function(oEvent) {
			var oItem = oEvent.getParameter('selectedItem');
			this.userPref.teamFilter = oItem.getKey();
			this.userPref.teamName = oItem.getText(); 
			
			this._applyFilters();
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.TimesheetSelection
		 */
		OnAddTimesheet: function() {
			if (this.employees.length > 0) {
				this.getView().getModel("employeeDaysSelected").setData(this.employees);
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