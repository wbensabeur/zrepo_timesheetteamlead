sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"com/vinci/timesheet/admin/utility/fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, formatter, datetime, fragment, Filter, FilterOperator, MessageBox, MessageToast) {
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
				try {
					if (this.employees[0].equipment === 'X') {
						this.sourcenavto = "periodEqmtSelection";
						this.isEquipment = "Equipment";
					} else {
						this.sourcenavto = "periodSelection";
						this.isEquipment = "";
					}
				} catch (e) {
					this.sourcenavto = "periodSelection";
					this.isEquipment = "";
				}
				this.userPref = this.getView().getModel("userPreference").getData();
				var caldenderdata = datetime.getCalenderData(this.userPref.startDate, this.userPref.defaultPeriod, this.getResourceBundle());
				var oCalendarModel = new JSONModel(caldenderdata);
				this.setModel(oCalendarModel, "calendar");

				var oModel = fragment.AddUpdatetime_init(this, this.getView().byId('PageContent'), "New", this.getResourceBundle(), this.employees,
					this.getView().getModel(), '', this.isEquipment);

				this.getView().setModel(oModel.AddTime, "AddTime");
				this.getView().setModel(oModel.projectSearch, "projectSearch");
				this.getView().setModel(oModel.footer, "footer");
				this.getView().setModel(oModel.Emps, "Emps");

			} else {
				this.getRouter().navTo("Summary", {
					source: 'AddTime'
				}, true);
			}

		},
		onAllowanceIndicatorData: function(oEvent) {
			fragment.AddUpdatetime_onAllowanceIndicatorData(oEvent, this);
		},
		onPressCancel: function() {
			fragment.AddUpdatetime_destroy(this.getView().byId('idIconTabBarMulti'));
			this.getRouter().navTo(this.sourcenavto, {
				source: 'AddTime'
			}, true);
		},
		onUpdateStart: function(oEvent) {
			this.byId(this.ChkSelectionDialog_tableCS).setBusy(true);
		},
		onUpdateFinished: function(oEvent) {
			var that = this;
			// update the worklist's object counter after the table update
			this.byId(this.ChkSelectionDialog_tableCS).setBusy(false);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt2", this.getModel("userPreference").getProperty("/defaultBUT"));
			var oTable = this.byId(this.ChkSelectionDialog_tableCS);
			var oItems = oTable.getItems();
			for (var i = 0; i < oItems.length; i++) {
				var cells = oItems[i].getCells();
				for (var c = 1; c < cells.length; c++) {
					try {
						if (this.isEquipment === "Equipment") {
							if (this.currentEmplSelection[cells[c].data("employee") + cells[c].data("AnalyticalUnit") + cells[c].data("selectedDate").toString()] === 'X') {
								cells[c].getCustomData()[0].setValue('S');
							} else {
								cells[c].getCustomData()[0].setValue('');
							}
						} else {
							if (this.currentEmplSelection[cells[c].data("employee") + cells[c].data("selectedDate").toString()] === 'X') {
								cells[c].getCustomData()[0].setValue('S');
							} else {
								cells[c].getCustomData()[0].setValue('');
							}
						}
					} catch (error) {
						cells[c].getCustomData()[0].setValue('');
					}
				}
			}
		},
		_applyFiltersCS: function() {
			var that = this;
			this.userPref = this.getView().getModel("userPreference").getData();
			if (this.userPref.defaultPeriod === 1) {
				this.twoWeek = false;
			} else {
				this.twoWeek = true;
			}

			var startDate = this.userPref.startDate;
			var noOfWeek = this.userPref.defaultPeriod;
			var caldenderdata = datetime.getCalenderData(startDate, noOfWeek, this.getResourceBundle());
			var oCalendarModel = new JSONModel(caldenderdata);
			this.setModel(oCalendarModel, "calendar");
			// Change Table OData Binding
			var monday = datetime.getMonday(startDate);
			this.currentWeekNumber = datetime.getWeek(monday);
			this.currentYear = new Date(monday.getTime()).getFullYear();

			this.employees = this.getView().getModel("employeeDaysSelected").getData();

			var oTable = this.byId(this.ChkSelectionDialog_tableCS);
			var Filters = [
				new Filter("WeekNumber", FilterOperator.EQ, this.currentWeekNumber),
				new Filter("WeekYear", FilterOperator.EQ, this.currentYear),
				new Filter("isByWeekly", FilterOperator.EQ, this.twoWeek),
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU),
				new Filter("ApplicationName", FilterOperator.EQ, this.userPref.application),
				new Filter("ApplicationVersion", FilterOperator.EQ, this.userPref.applicationVersion)
			];
			if (this.isEquipment === "Equipment") {
				if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
					Filters.push(new Filter("EquipmentName", FilterOperator.Contains, this.userPref.employeeFilter));
				}
				if (this.employees.length > 0) {
					for (var e = 0; e < this.employees.length; e++) {
						Filters.push(new Filter("EquipmentId", FilterOperator.EQ, this.employees[e].employee));
						Filters.push(new Filter("AnalyticalUnit", FilterOperator.EQ, this.employees[e].analyticalUnit));
					}
				}
			} else {
				if (this.userPref.teamFilter !== null && this.userPref.teamFilter.length > 0) {
					Filters.push(new Filter("TeamID", FilterOperator.EQ, this.userPref.teamFilter));
				}
				if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
					Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.userPref.employeeFilter));
				}
				if (this.employees.length > 0) {
					for (e = 0; e < this.employees.length; e++) {
						Filters.push(new Filter("EmployeeId", FilterOperator.EQ, this.employees[e].employee));
					}
				}
			}
			oTable.getBinding("items").filter(Filters, "Application");
		},
		onPressChkSelection: function(oEvent) {
			var that = this;
			var oView = this.getView();
			if (this.isEquipment === "Equipment") {
				this.ChkSelectionDialog = "ChkEquipSelectionDialog";
				this.frgChkSelectionDialog = "com.vinci.timesheet.admin.view.ChkEquipSelectionDialog";
				this.ChkSelectionDialog_tableCS = "tableEquipCS";
				this.ChkSelectionDialog_tableHeaderCS = "tableHeaderEquipCS";
			} else {
				this.ChkSelectionDialog = "ChkSelectionDialog";
				this.frgChkSelectionDialog = "com.vinci.timesheet.admin.view.ChkSelectionDialog";
				this.ChkSelectionDialog_tableCS = "tableCS";
				this.ChkSelectionDialog_tableHeaderCS = "tableHeaderCS";
			}
			var oDialog = oView.byId(this.ChkSelectionDialog);
			// oDialog = oView.byId("ChkEquipSelectionDialog");
			this.currentEmplSelection = [];
			if (this.isEquipment === "Equipment") {
				for (var k = 0; k < this.employees.length; k++) {
					for (var j = 0; j < this.employees[k].Days.length; j++) {
						this.currentEmplSelection[this.employees[k].employee + this.employees[k].analyticalUnit + this.employees[k].Days[j].toString()] =
							'X';
					}
				}
			} else {
				for (k = 0; k < this.employees.length; k++) {
					for (j = 0; j < this.employees[k].Days.length; j++) {
						this.currentEmplSelection[this.employees[k].employee + this.employees[k].Days[j].toString()] = 'X';
					}
				}
			}
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), this.frgChkSelectionDialog, this);
				oView.addDependent(oDialog);
				var oTable = this.getView().byId(this.ChkSelectionDialog_tableCS);

				var iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				this.getView().byId(this.ChkSelectionDialog_tableHeaderCS).onAfterRendering = function(oEvent) {
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
				// var totalH = window.innerHeight - 86;
				// that.getView().byId('TableScrollCS').setHeight(totalH + 'px');
				// $(window).resize(function() {
				// 	totalH = window.innerHeight - 86;
				// 	that.getView().byId('TableScrollCS').setHeight(totalH + 'px');
				// });
			}
			this._applyFiltersCS();
			oDialog.open();
		},
		OnCloseChkSelctionDialog: function() {
			var oDialog = this.getView().byId(this.ChkSelectionDialog);
			oDialog.close();
		},
		onPressOnlySaveEntries: function(oEvent) {
			var that = this;
			fragment.AddUpdatetime_saveEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));
				var oModel = fragment.AddUpdatetime_init(that, that.getView().byId('PageContent'), "New", that.getResourceBundle(), that.employees,
					that.getView().getModel(),null,that.isEquipment);

				that.getView().setModel(oModel.AddTime, "AddTime");
				that.getView().setModel(oModel.projectSearch, "projectSearch");
				that.getView().setModel(oModel.footer, "footer");
				that.getView().setModel(oModel.Emps, "Emps");

				MessageToast.show(that.getResourceBundle().getText("successPostMsg"));
			}, this.getView(), oEvent.getSource());
		},
		onPressSaveWREntries: function(oEvent) {
			var that = this;
			fragment.AddUpdatetime_saveEntries(this.getView(), function() {
				MessageToast.show(that.getResourceBundle().getText("successPostMsg"));
				that.getRouter().navTo("ReportEmployeeSelection", {
				source: 'AddTime'
			}, true);
			}, this.getView(), oEvent.getSource());
		},
		onPressSaveEntries: function(oEvent) {
			var that = this;
			var localNavTo = "Summary";
			if (this.isEquipment === "Equipment") {
				localNavTo = "WSEquipment";
			}
			fragment.AddUpdatetime_saveEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));
				that.getRouter().navTo(localNavTo, {}, true);
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
		OnDailyHrTypeChange: function(oEvent) {
			fragment.SelectProject_OnDailyHrTypeChange(oEvent);
		},
		OnOthAllownaceTypeChange: function(oEvent) {
			fragment.SelectProject_OnOthAllownaceTypeChange(oEvent);
		},
		OnOthAllownaceEntryChange: function(oEvent) {
			fragment.SelectProject_OnOthAllownaceEntryChange(oEvent);
		},
		//// **SelectProject Fragment Event End** ///////

		//// **AddProjectTime Fragment Event** ///////
		OnEquipmentDelete: function(oEvent) {
			var container = this.getView().byId('addEquipmentTab').getItems()[0];
			fragment.AddProjectTime_OnTimeDelete(oEvent, container);
		},
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
		OnBonusDelete: function(oEvent) {
			var container = this.getView().byId('addBonusTab').getItems()[0];
			fragment.AddProjectTime_OnBonusDelete(oEvent, container);
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
			fragment.AddUpdatetime_OnTabSelected(oEvent, this.getView(), this);
		},
		OnaddNewHourPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewHourPress(this);
		},
		OnaddNewEquipmentPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewEquipmentPress(this);
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
		handleAbsTypeLoadItems: function(oEvent) {
			fragment.AddUpdatetime_handleAbsTypeLoadItems(oEvent);
		},
		onAbsenceCatChange: function(oEvent) {
			fragment.AddUpdateTime_onAbsenceCatChange(oEvent, this.getView().getModel('AddTime'), this.getView());
		},
		//// **AddUpdateTime Fragment Event End** ///////

		//// **AddKM Fragment Event** ///////
		OnEquipmentChangeQuanity: function(oEvent) {
			fragment.AddProjectTime_OnEquipmentChangeQuanity(oEvent);
		},
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