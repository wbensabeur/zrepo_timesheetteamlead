sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"com/vinci/timesheet/admin/utility/fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, formatter, datetime, fragment, MessageBox, MessageToast) {
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

			var data = [{
				ProjectDescription: "test1"
			}, {
				ProjectDescription: "test2"
			}, {
				ProjectDescription: "test5"
			}];
			var model = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(model, "test");

			this.getView().byId('PageContent').onAfterRendering = function(oEvent) {
				try {
					var elements = document.getElementsByClassName("SelectCombo"); //
					for (var k = 0; k < elements.length; k++) {
						var eleId = elements[k].id + '-inner';
						document.getElementById(eleId).disabled = true; // .get.("tableColumnCombo")
						//	elements[k].disabled = true;
					}
				} catch (err) {

				}

			};

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
		onAfterRendering: function() {
			var that = this;
			jQuery.sap.delayedCall(200, this, function() {
				that.getView().byId("MainAddButton").focus();
			});

			//	MainAddButton
		},
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

				var oModel = fragment.AddUpdatetime_init(this, this.getView().byId('PageContent'), "New", this.getResourceBundle(), this.employees,
					this.getView().getModel());

				this.getView().setModel(oModel.AddTime, "AddTime");
				this.getView().setModel(oModel.projectSearch, "projectSearch");
				this.getView().setModel(oModel.footer, "footer");
				this.getView().setModel(oModel.Emps, "Emps");
				
			} else {
				this.getRouter().navTo("periodSelection", {
					source: 'Summary'
				}, true);
			}

		},
		onPressCancel: function() {
			fragment.AddUpdatetime_destroy(this.getView().byId('idIconTabBarMulti'));
			this.getRouter().navTo("periodSelection", {
				source: 'AddTime'
			}, true);

		},
		onPressOnlySaveEntries: function (oEvent){
			var that = this;
			fragment.AddUpdatetime_saveEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));
				var oModel = fragment.AddUpdatetime_init(that, that.getView().byId('PageContent'), "New", that.getResourceBundle(), that.employees,
					that.getView().getModel());

				that.getView().setModel(oModel.AddTime, "AddTime");
				that.getView().setModel(oModel.projectSearch, "projectSearch");
				that.getView().setModel(oModel.footer, "footer");
				that.getView().setModel(oModel.Emps, "Emps");
				
				MessageToast.show(that.getResourceBundle().getText("successPostMsg"));	 
			}, this.getView(), oEvent.getSource());
		},
		onPressSaveEntries: function(oEvent) {
			var that = this;
			fragment.AddUpdatetime_saveEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));
				that.getRouter().navTo("home", {}, true);
				that.getView().getModel("userPreference").setProperty("/successMaskEntry", true);
				//MessageToast.show(that.getResourceBundle().getText("successPostMsg"),{duration:10000});	 
			}, this.getView(), oEvent.getSource());
		},

		handleLoadItems: function(oEvent) {
			oEvent.getSource().getBinding("items").resume();
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
		onProjectDescriptionSuggest: function(oEvent) {
			fragment.SearchProject_onProjectDescriptionSuggest(oEvent);
		},

		onProjectDescriptionSearch: function(oEvent) {
			fragment.SearchProject_onProjectDescriptionSearch(oEvent);
		},
		onProjectManagerSuggest: function(oEvent) {
			fragment.SearchProject_onProjectManagerSuggest(oEvent);
		},
		onProjectManagerSearch: function(oEvent) {
			fragment.SearchProject_onProjectManagerSearch(oEvent);
		},
		onBUFilterChange: function(oEvent) {
			fragment.SearchProject_onBUFilterChange(oEvent);
		},
		onPositionFilterChange: function(oEvent) {
			fragment.SearchProject_onPositionFilterChange(oEvent);
		},
		OnProjectFilterchange: function(oEvent) {
			fragment.SearchProject_OnProjectFilterchange(oEvent, this.getView());
		},

		////****SearchProject Fragment Event End******//////////

		//// **SelectProject Fragment Event** ///////
		OnProjectSearch: function(oEvent) {
			fragment.SelectProject_OnProjectSearch(oEvent, this, this.getView().byId('ProjectSelectButton'));
		},
		OnProjectRefresh: function(oEvent) {
			fragment.SelectProject_OnProjectRefresh(oEvent, this, this.getView().byId('ProjectSelectButton'));
		},
		OnProjectDelete: function(oEvent) {
			fragment.SelectProject_OnProjectDelete(oEvent);
		},
		OnDailyHrTypeChange2: function(oEvent) {
			fragment.SelectProject_OnDailyHrTypeChange2(oEvent);
		},
		OnDailyHrTypeChange1: function(oEvent) {
			fragment.SelectProject_OnDailyHrTypeChange1(oEvent);
		},
		//// **SelectProject Fragment Event End** ///////

		//// **AddProjectTime Fragment Event** ///////
		OnTimeDelete: function(oEvent) {
			/*var that = this;
			MessageBox.confirm(
			that.getResourceBundle().getText("confirmDeleteMsg"), 
			{
				title: that.getResourceBundle().getText("deletecnfm"),
				onClose: function fnCallbackConfirm(oAction) {
					if (oAction==='OK') {
						//var timeModel = this.getView().getModel('AddTime');
						var container = that.getView().byId('addTimeTab').getItems()[0];
						fragment.AddProjectTime_OnTimeDelete(oEvent, container);	
					} else {
						return;
					}
				}
			});*/
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
		OnChangeStartTime: function(oEvent) {
			//		var timeModel = this.getView().getModel('AddTime');
			fragment.AddProjectTime_OnChangeStartTime(oEvent);

		},
		handleDailyHrsTypeLoadItems: function(oEvent) {
			fragment.AddProjectTime_handleDailyHrsTypeLoadItems(oEvent);
		},
		OnChangeEndTime: function(oEvent) {
			//		var timeModel = this.getView().getModel('AddTime');
			fragment.AddProjectTime_OnChangeEndTime(oEvent);

		},
		//// **AddProjectTime Fragment Event End** ///////

		//// **AddUpdateTime Fragment Event** ///////
		OnTabSelected: function(oEvent) {
			//	var addTimeModel = this.getView().getModel('AddTime');
			fragment.AddUpdatetime_OnTabSelected(oEvent,this.getView());
		},
		OnaddNewHourPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewHourPress(this);
		},
		OnaddNewBonusPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewBonusPress(this);
		},
		onSelectAbsenceStartDate: function(oEvent) {
			fragment.AddUpdatetime_onSelectAbsenceStartDate(oEvent, this.getView());
		},
		onSelectAbsenceEndDate: function(oEvent) {
			fragment.AddUpdatetime_onSelectAbsenceEndDate(oEvent, this.getView());
		},
		onAllowanceIndicator: function(oEvent) {
			fragment.AddUpdatetime_onAllowanceIndicator(oEvent);
		},
		handleAllowanceZoneTypeLoadItems: function(oEvent) {
			fragment.AddUpdatetime_handleAllowanceZoneTypeLoadItems(oEvent);
		},
		handleAbsTypeLoadItems : function (oEvent){
			fragment.AddUpdatetime_handleAbsTypeLoadItems(oEvent);
		},
		onAbsenceCatChange : function (oEvent) {
			fragment.AddUpdateTime_onAbsenceCatChange(oEvent, this.getView().getModel('AddTime'),this.getView());
		},
		//// **AddUpdateTime Fragment Event End** ///////

		//// **AddKM Fragment Event** ///////
		OnChangeStartTimeKM: function(oEvent) {
			fragment.AddKM_OnChangeStartTimeKM(oEvent);
		},
		OnChangeKMHours: function(oEvent) {
			fragment.AddKM_OnChangeKMHours(oEvent);
		},
		OnChangeEndTimeKM: function(oEvent) {
			fragment.AddKM_OnChangeEndTimeKM(oEvent);
		},
		handleKMTypeLoadItems: function(oEvent) {
				fragment.AddKM_handleKMTypeLoadItems(oEvent);
			}
			//// **AddKM Fragment Event End** ///////

		/*	_getOwnContentObject: function(source) {
				var parent = source.getParent();
				while (parent.getMetadata().getName() !== 'sap.m.IconTabFilter') {
					parent = parent.getParent();
				}
				return parent.getContent();
			}*/

	});
});