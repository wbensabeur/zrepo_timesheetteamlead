sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/vinci/timesheet/admin/utility/jspdf"
], function(BaseController, JSONModel, formatter, datetime, MessageBox, MessageToast, Filter, FilterOperator, jspdfView) {
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
			this.getView().byId("SignatureFrame").setVisible(false);
			this.getView().byId("signBtn").setVisible(true);
			this.getView().byId("timeSubmitBtn").setVisible(false);
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
			this.getView().byId("SignatureFrame").setVisible(false);
			this.getView().byId("signBtn").setVisible(true);
			this.getView().byId("timeSubmitBtn").setVisible(false);
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
			this.EmplWeekContext = [];
			var that = this;
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
						var uri = results[k].__metadata.uri;
						var contextBinding = uri.substring((uri.indexOf('WorkDayItemSet') - 1));
						that.EmplWeekContext.push(contextBinding);
						var hrs = formatter.getQuantity(results[k].EntryType, results[k].Hours);
						if (projectId !== results[k].ProjectID || entryType !== results[k].EntryType) /// New Line
						{
							if (line !== null) {
								oData1.push(line);
							}
							line = {
								project: results[k].ProjectID,
								projectName: results[k].ProjectName,
								type: results[k].EntryTypeDesc,
								unit: formatter.getUnit(results[k].EntryType, results[k].ZoneType),
								total: hrs,
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
		onPressSignature: function() {
			this.dialogPressSignature.close();
			var srcImg = sap.ui.getCore().getControl("mySignaturePad").save();
			this.getView().byId("imageSignature").setSrc(srcImg);
			this.getView().byId("SignatureFrame").setVisible(true);
			this.getView().byId("signBtn").setVisible(false);
			this.getView().byId("timeSubmitBtn").setVisible(true);
		},
		onPressClear: function() {
			sap.ui.getCore().getControl("mySignaturePad").clear();
		},
		OnTimeSignature: function() {

			if (!this.dialogPressSignature) {
				this.dialogPressSignature = sap.ui.xmlfragment("com.vinci.timesheet.admin.view.Signature", this);
				this.dialogPressSignature.setModel(this.getView().getModel());
			}
			//jQuery.sap.syncStyleClass("sapUISizeCompact", this.getView(), this.dialogPressSignature);
			this.getView().addDependent(this.dialogPressSignature);
			this.dialogPressSignature.open();

		},
		OnTimeSubmit: function() {

			//////

			var requestBody = {
				"EmployeeId": this.employeId,
				"WorkDate": new Date(),
				"Status": "RELEASE",
				"NavWorkDayTimeItems": []
			};
			//	for (var i = 1; i < 8; i++) {
			//var listWKDidLocal = "listWKD" + i;
			//var listWKDidLocalModel = this.getView().byId(listWKDidLocal).getModel();
			//var listWKDidLocalItems = this.getView().byId(listWKDidLocal).getItems();
			for (var j = 0; j < this.EmplWeekContext.length; j++) {
				var listWKDidLocalItemData = this.getView().getModel().getProperty(this.EmplWeekContext[j]);
				var locatData = {
					EmployeeId: listWKDidLocalItemData.EmployeeId,
					WorkDate: listWKDidLocalItemData.WorkDate,
					Counter: listWKDidLocalItemData.Counter,
					ProjectID: listWKDidLocalItemData.ProjectID,
					ProjectName: listWKDidLocalItemData.ProjectName,
					EntryType: listWKDidLocalItemData.EntryType,
					EntryTypeCatId: listWKDidLocalItemData.EntryTypeCatId,
					EntryTypeDesc: listWKDidLocalItemData.EntryTypeDesc,
					Hours: listWKDidLocalItemData.Hours,
					HourUnit: listWKDidLocalItemData.HourUnit,
					KMNumber: listWKDidLocalItemData.KMNumber,
					StartTime: listWKDidLocalItemData.StartTime,
					EndTime: listWKDidLocalItemData.EndTime,
					FullDay: listWKDidLocalItemData.FullDay,
					Status: listWKDidLocalItemData.Status,
					Comment: listWKDidLocalItemData.Comment,
					CreatedBy: listWKDidLocalItemData.CreatedBy,
					CreatedOn: listWKDidLocalItemData.CreatedOn,
					ReleaseOn: listWKDidLocalItemData.ReleaseOn,
					ApprovedOn: listWKDidLocalItemData.ApprovedOn,
					Reason: listWKDidLocalItemData.Reason,
					AllowancesType: listWKDidLocalItemData.AllowancesType,
					AllowancesName: listWKDidLocalItemData.AllowancesName,
					ZoneType: listWKDidLocalItemData.ZoneType,
					ZoneName: listWKDidLocalItemData.ZoneName,
					MealIndicator: listWKDidLocalItemData.MealIndicator,
					JourneyIndicator: listWKDidLocalItemData.JourneyIndicator,
					TransportIndicator: listWKDidLocalItemData.TransportIndicator,
					ApplicationName: 'TEAMLEAD'
				};
				requestBody.NavWorkDayTimeItems.push(locatData);
				//	}
			}
			var that = this;
			this.getView().getModel().create("/WorkDaySet", requestBody, {
				success: function() {
					window.html2canvas($("#shell-container-canvas"), {

						onrendered: function(canvas) {

							//var img = canvas.toDataURL("image/jpg", 0);
							MessageToast.show(that.getResourceBundle().getText("successWeeklyReportPostMsg"));
							that.onNextEmployeePress();
							//window.open(img);
						}

					});

				}
			});

			//////

			/*var batchChanges = [];

			for (var k = 0; k < this.EmplWeekContext.length; k++) {
				
				this.getView().getModel().update(this.EmplWeekContext[k], {
					"Status": "W"
				});
			}*/

			/*this.getView().getModel().addBatchChangeOperations(batchChanges);*/

			/*this.getView().getModel().submitBatch(function(data) {*/

			/*}, function(err) {

			});*/

		}
	});
});