sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, formatter, datetime, MessageBox) {
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
		
		onPreviousEmployeePress : function (oEvent) {
			if(this.index === 0)
			{
				this.index = this.noOfEmp - 1;
			}
			else
			{
				this.index = this.index - 1;
			}
			this._applyEmployeeBinding(this.employeeSelected.employees[this.index]);
			
		},
		onNextEmployeePress : function (oEvent) {
			if(this.index === this.noOfEmp - 1)
			{
				this.index = 0;
				
			}
			else
			{
				this.index = this.index + 1;
			}
			this._applyEmployeeBinding(this.employeeSelected.employees[this.index]);
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
			sap.ui.getCore().byId('shell').setHeaderHiding(true);
		},
		onPressCancel: function() {
			sap.ui.getCore().byId('shell').setHeaderHiding(false);
			this.getRouter().navTo("ReportEmployeeSelection", {}, true);
		},
		_applyEmployeeBinding: function(employee) {
			var oView = this.getView();
			this.employeId = employee.getCustomData()[1].getValue();
			oView.byId("userInfo").bindElement("/EmployeeSet('"+this.employeId+"')");
			oView.byId("WeeklyStatus").bindElement(employee.getBindingContextPath());
			oView.byId("WeeklyAggregation").bindElement(employee.getBindingContextPath());
			
			var aggregatedData = [{
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
			oView.setModel(oModel, "aggregatedData");
			
			
			var urlStr = "/WorkDayItemSet?$filter=EmployeeId%20eq%20'" +this.employeId+"'";//%20and%20WorkDate%20gt%20"+datetime.getODataDateFilter(this.employeeSelected.startDate)+"%20and%20WorkDate%20lt%20"+datetime.getODataDateFilter(datetime.getLastDay(this.employeeSelected.startDate,1));  //"+empId + "'," + "WorkDate=datetime'" + encodeURIComponent(startDate) + "')";
	//		 var that = this;
			this.getModel().read(urlStr, {
				success: function(data) {
					/*var selectedDayModel = new JSONModel();
					that.getView().setModel(selectedDayModel,"WorkDayModel");
					selectedDayModel.setData(data);
					that.getView().getModel("timesheetview").setProperty("/busy",false);*/
					sap.m.MessageToast.show("data");
				},
				error: function(error) {
					//that.getView().getModel("timesheetview").setProperty("/busy",false);
					sap.m.MessageToast.show("Failed");
				}
			});
			
			
		}

	});

});