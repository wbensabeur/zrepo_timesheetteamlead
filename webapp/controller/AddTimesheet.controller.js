sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"com/vinci/timesheet/admin/utility/fragment",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, formatter, datetime, fragment, MessageBox) {
	"use strict";
	return BaseController.extend("com.vinci.timesheet.admin.controller.AddTimesheet", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.AddTimesheet
		 */
		onInit: function() {
			this.getRouter().getRoute("AddTimesheet").attachPatternMatched(this._onObjectMatched, this);
			
			var data=[{ProjectDescription:"test1"},{ProjectDescription:"test2"},{ProjectDescription:"test5"}];
			var model = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(model,"test");

		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.vinci.timesheet.admin.view.AddTimesheet
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.vinci.timesheet.admin.view.AddTimesheet
		 */
		//	onAfterRendering: function() {
		//
		//	},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.vinci.timesheet.admin.view.AddTimesheet
		 */
		//	onExit: function() {
		//
		//	}
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.AddTimesheet
		 */
		_onObjectMatched: function(oEvent) {

			this.employees = this.getView().getModel("employeeDaysSelected").getData();
			if (this.employees.length > 0) {
				this.userPref = this.getView().getModel("userPreference").getData();
				var caldenderdata = datetime.getCalenderData(this.userPref.startDate, this.userPref.defaultPeriod, this.getResourceBundle());
				var oCalendarModel = new JSONModel(caldenderdata);
				this.setModel(oCalendarModel, "calendar");

				var oModel = fragment.AddUpdatetime_init(this, this.getView().byId('PageContent'), "New", this.getResourceBundle(),this.employees,this.getView().getModel());

				this.getView().setModel(oModel.AddTime, "AddTime");
				this.getView().setModel(oModel.projectSearch, "projectSearch");
				this.getView().setModel(oModel.footer, "footer");
			} else {
				this.getRouter().navTo("periodSelection", {}, true);
			}

		},
		onPressCancel: function() {
			fragment.AddUpdatetime_destroy(this.getView().byId('idIconTabBarMulti'));
			this.getRouter().navTo("periodSelection", {}, true);

		},

		/**
		 *@memberOf com.vinci.timesheet.admin.controller.AddTimesheet
		 */

		//// **SearchProject Fragment Event** ///////
		OnProjectSelected: function(oEvent) {
			var selectButton = this.getView().byId('ProjectSelectButton');
			fragment.SearchProject_OnProjectSelected(oEvent, selectButton);
		},
		OnFavoriteChange: function(oEvent) {
			fragment.SearchProject_OnFavoriteChange(oEvent, this.getView().getModel());
		},
		onProjectSearchFinished: function(oEvent) {
			fragment.SearchProject_onProjectSearchFinished(oEvent);
		},
		onPressProjectCancel: function() {
			fragment.SelectProject_onPressProjectCancel();

		},
		onPressProjectSelect: function(oEvent) {
			fragment.SelectProject_onPressProjectSelect();
		},
		onProjectDescriptionSuggest:function(oEvent) {
			fragment.SearchProject_onProjectDescriptionSuggest(oEvent);
		},

		////****SearchProject Fragment Event End******//////////

		//// **SelectProject Fragment Event** ///////
		OnProjectSearch: function(oEvent) {
			fragment.SelectProject_OnProjectSearch(oEvent, this, this.getView().byId('ProjectSelectButton'));
		},
		OnProjectRefresh: function(oEvent) {
			fragment.SelectProject_OnProjectRefresh(oEvent, this, this.getView().byId('ProjectSelectButton'));
		},
		//// **SelectProject Fragment Event End** ///////

		//// **AddProjectTime Fragment Event** ///////
		OnTimeDelete: function(oEvent) {
			//var timeModel = this.getView().getModel('AddTime');
			var container = this.getView().byId('addTimeTab').getItems()[0];
			fragment.AddProjectTime_OnTimeDelete(oEvent, container);

		},
		OnchangeTimeSelection: function(oEvent) {
			//	var timeModel = this.getView().getModel('AddTime');
			fragment.AddProjectTime_OnchangeTimeSelection(oEvent);
		},
		OnChangeHours: function(oEvent) {
			//		var timeModel = this.getView().getModel('AddTime');
			fragment.AddProjectTime_OnChangeHours(oEvent);

		},
		OnChangeStartTime :function(oEvent) {
			//		var timeModel = this.getView().getModel('AddTime');
			fragment.AddProjectTime_OnChangeStartTime(oEvent);

		},
		OnChangeEndTime : function(oEvent) {
			//		var timeModel = this.getView().getModel('AddTime');
			fragment.AddProjectTime_OnChangeEndTime(oEvent);

		},
		//// **AddProjectTime Fragment Event End** ///////

		//// **AddUpdateTime Fragment Event** ///////
		OnTabSelected: function(oEvent) {
			//	var addTimeModel = this.getView().getModel('AddTime');
			fragment.AddUpdatetime_OnTabSelected(oEvent);
		},
		OnaddNewHourPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewHourPress(this);
		},
		onSelectAbsenceStartDate: function (oEvent) {
			fragment.AddUpdatetime_onSelectAbsenceStartDate(oEvent,this.getView());
		},
		onSelectAbsenceEndDate: function (oEvent) {
			fragment.AddUpdatetime_onSelectAbsenceEndDate(oEvent,this.getView());
		}

		//// **AddUpdateTime Fragment Event End** ///////

		/*	_getOwnContentObject: function(source) {
				var parent = source.getParent();
				while (parent.getMetadata().getName() !== 'sap.m.IconTabFilter') {
					parent = parent.getParent();
				}
				return parent.getContent();
			}*/

	});
});