sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/vinci/timesheet/admin/utility/jspdf"
], function(BaseController, JSONModel, formatter, datetime, MessageBox, Filter, FilterOperator, jspdfView) {
	"use strict";

	return BaseController.extend("com.vinci.timesheet.admin.controller.WeeklyReport", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklyReport
		 */

		onInit: function() {
			this.getRouter().getRoute("WeeklyReport").attachPatternMatched(this._onObjectMatched, this);
		},
		onPreviousEmployeePress: function(oEvent) {
			if (this.index === 0) {
				this.index = this.noOfEmp - 1;
			} else {
				this.index = this.index - 1;
			}
			this._applyEmployeeBinding(this.employeeSelected.employees[this.index]);
		},
		onNextEmployeePress: function(oEvent) {
			if (this.index === this.noOfEmp - 1) {
				this.index = 0;
			} else {
				this.index = this.index + 1;
			}
			this._applyEmployeeBinding(this.employeeSelected.employees[this.index]);
		},
		onPastPeriodNavPress: function(oEvent) {
			/*	this.userPref.startDate.setDate(this.userPref.startDate.getDate() - 7);
				this._calendarBinding(this.userPref.startDate, 1);
				this.getView().getModel("userPreference").setProperty("/startDate", this.userPref.startDate);*/
		},
		onFuturePeriodNavPress: function(oEvent) {
			
			/*	this.userPref.startDate.setDate(this.userPref.startDate.getDate() + 7);
				this._calendarBinding(this.userPref.startDate, 1);
				this.getView().getModel("userPreference").setProperty("/startDate", this.userPref.startDate);*/
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.vinci.timesheet.admin.view.WeeklyReport
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklyReport
		 */
		//	onAfterRendering: function() {
		//
		//	},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklyReport
		 */
		//	onExit: function() {
		//
		//	}
		_onObjectMatched: function(oEvent) {
			this.employeeSelected = this.getView().getModel("employeeSelected").getData();
			if (this.employeeSelected.employees.length > 0) {
				this._applyEmployeeBinding(this.employeeSelected.employees[0]);
				this.index = 0;
				this.noOfEmp = this.employeeSelected.employees.length;
				/*this.employee = this.employeeSelected.employees[0].getCustomData()[1].getValue();
				this.weeklyContext = this.employeeSelected.employees[0].getBindingContextPath();
				this.getView().byId("userInfo").bindElement("/EmployeeSet('"+this.employee+"')");*/
				var caldenderdata = datetime.getCalenderData(this.employeeSelected.startDate, 1, this.getResourceBundle());
				var oCalendarModel = new JSONModel(caldenderdata);
				this.setModel(oCalendarModel, "calendar");
			} else {
				this.getRouter().navTo("ReportEmployeeSelection", {}, true);
			}
			sap.ui.getCore().byId("shell").setHeaderHiding(true);
		},
		onPressCancel: function() {
			sap.ui.getCore().byId("shell").setHeaderHiding(false);
			this.getRouter().navTo("ReportEmployeeSelection", {}, true);
		},
		_applyEmployeeBinding: function(employee) {
			var oView = this.getView();
			this.employeId = employee.getCustomData()[1].getValue();
			oView.byId("userInfo").bindElement("/EmployeeSet('" + this.employeId + "')");
			oView.byId("WeeklyStatus").bindElement(employee.getBindingContextPath());
			oView.byId("WeeklyAggregation").bindElement(employee.getBindingContextPath());
			oView.byId("WeeklyArregatedFilledData").bindElement(employee.getBindingContextPath());
			oView.byId("WeeklyArregatedTargetData").bindElement(employee.getBindingContextPath());

			//var startDateFilter = new Filter("WorkDate", FilterOperator.GT, oView.getModel().getProperty(employee.getBindingContextPath()).WeekDate1Date);
			//var endDateFilter = new Filter("WorkDate", FilterOperator.LT, oView.getModel().getProperty(employee.getBindingContextPath()).WeekDate7Date);
			//var filter2 = new Filter([startDateFilter,endDateFilter],true);

			var urlFilterParam = "$filter=EmployeeId%20eq%20'" + this.employeId + "'%20and%20WorkDate%20gt%20" + datetime.getODataDateFilter(
				oView.getModel().getProperty(employee.getBindingContextPath()).WeekDate1Date) + "and%20WorkDate%20lt%20" + datetime.getODataDateFilter(
				oView.getModel().getProperty(employee.getBindingContextPath()).WeekDate7Date) + "&$orderby=ProjectID,EntryType";
			var mParameters = {
				urlParameters: urlFilterParam,
				success: function(oData, oResponse) {
					var results = oResponse.data.results;
					var oData1 = [];
					var projectId = null;
					var entryType = null;
					var line = null;
					for (var k = 0; k < results.length; k++) {
						var hrs = formatter.getQuantity(results[k].EntryType,results[k].Hours);
						if (projectId !== results[k].ProjectID || entryType !== results[k].EntryType) /// New Line
						{
							if (line !== null) {
								oData1.push(line);
							}
							line = {
								project: results[k].ProjectID,
								projectName: results[k].ProjectName,
								type: results[k].EntryTypeDesc,
								unit: formatter.getUnit(results[k].EntryType,results[k].ZoneType),
								total:hrs,
								mon: 0,
								tue: 0,
								wed: 0,
								thr: 0,
								fri: 0,
								sat: 0,
								sun: 0
							};
							switch (results[k].WorkDate.getDay()) {
								case 1:
									line.mon = hrs;
								
									break;
								case 2:
									line.tue = hrs;
									break;
								case 3:
									line.wed = hrs;
									break;
								case 4:
									line.thr = hrs;
									break;
								case 5:
									line.fri = hrs;
									break;
								case 6:
									line.sat = hrs;
									break;
								case 7:
									line.sun = hrs;
									break;
								default:

							}

							/*	if (results[k].WorkDate === oView.getModel().getProperty(employee.getBindingContextPath()).WeekDate1Date) {
									line.mon = results[k].Hours;
								} */
						} else /// add
						{
							line.total = line.total + hrs;
							switch (results[k].WorkDate.getDay()) {
								case 1:
									line.mon = line.mon + hrs;
									break;
								case 2:
									line.tue = line.tue + hrs;
									break;
								case 3:
									line.wed = line.wed + hrs;
									break;
								case 4:
									line.thr = line.thr + hrs;
									break;
								case 5:
									line.fri = line.fri + hrs;
									break;
								case 6:
									line.sat = line.sat + hrs;
									break;
								case 7:
									line.sun = line.sun + hrs;
									break;
								default:
							}
						}
					projectId = results[k].ProjectID;
					entryType = results[k].EntryType;
						
					}
					if (line !== null) {
							oData1.push(line);
						}
						var oModel = new JSONModel(oData1);
						oView.setModel(oModel, "itemData");
				},
				error: function(oError) {

				}

			};
			oView.getModel().read("/WorkDayItemSet", mParameters);

			/*	var aggregatedData = [{
				title: "Theoretical hours",
				unit:"H",
				total:40,
				mon:8,
				tue:8,
				wed:8,
				thr:8,
				fri:8,
				sat:0,
				sun:0
			},
			{title: "Total hours",
				unit:"H",
				total:41,
				mon:8,
				tue:9	,
				wed:8,
				thr:8,
				fri:8,
				sat:0,
				sun:0
				
			}];
			var oModel = new JSONModel(aggregatedData);
			oView.setModel(oModel, "aggregatedData");*/
			/*var urlStr = "/WorkDayItemSet?$filter=EmployeeId%20eq%20'" + this.employeId + "'";
			//%20and%20WorkDate%20gt%20"+datetime.getODataDateFilter(this.employeeSelected.startDate)+"%20and%20WorkDate%20lt%20"+datetime.getODataDateFilter(datetime.getLastDay(this.employeeSelected.startDate,1));  //"+empId + "'," + "WorkDate=datetime'" + encodeURIComponent(startDate) + "')";
			//		 var that = this;
			this.getModel().read(urlStr, {
				success: function(data) {
					
					sap.m.MessageToast.show("data");
				},
				error: function(error) {
					//that.getView().getModel("timesheetview").setProperty("/busy",false);
					sap.m.MessageToast.show("Failed");
				}
			});*/
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.WeeklyReport
		 */
		OnTimeSubmit: function() {

			window.html2canvas($("#shell-container-canvas"), {

				onrendered: function(canvas) {

					var img = canvas.toDataURL("image/jpg", 0);
					window.open(img);
					/*var doc = new jsPDF();
					doc.addImage(img, 'JPEG', 600, 400);
					doc.save('test.pdf');*/
				}
			});
		}
	});
});