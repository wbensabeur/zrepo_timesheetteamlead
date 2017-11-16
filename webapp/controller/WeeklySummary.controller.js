sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"com/vinci/timesheet/admin/utility/fragment",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, formatter, datetime, Filter, FilterOperator, MessageBox, fragment, MessageToast) {
	"use strict";
	return BaseController.extend("com.vinci.timesheet.admin.controller.WeeklySummary", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklySummary
		 */
		onInit: function() {
			this.getRouter().getRoute("home").attachPatternMatched(this._onObjectMatched, this);

			this.successPost = false;
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			/// Attach Seeting button from Shell
		/*	var setting = sap.ui.getCore().byId("shellSettings");
			if (setting !== null) {
				setting.attachPress(function(oEvent) {

					MessageBox.information("Version - 2.0.0");
				});
			}*/
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
			// model for Calendar
			// Make sure, busy indication is showing immediately so there is no
			// break after functionthe busy indication for loading the view's meta data is
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

			/*	attachEventOnce("updateStarted", function(){
					var comboId = "#"+this.getView().byId('tableColumnCombo').getId()+'-inner';	
					$(comboId).prop('disabled', true);
				}
					);*/

			$(window).resize(function() {
				var totalH = window.innerHeight - 200;
				that.getView().byId('TableScroll').setHeight(totalH + 'px');
			});
		},
		/* =========================================================== */
		/* UI element event handlers                                              */
		/* =========================================================== */
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.WeeklySummary
		 */
		onUpdateStart: function() {
			/*this.getView().byId("table").mBindingInfos.items.filters[0].oValue1 = currentWeekNumber;
						//WeekNumber
						this.getView().byId("table").mBindingInfos.items.filters[1].oValue1 = currentYear;
						//WeekYear
						this.getView().byId("table").mBindingInfos.items.filters[2].oValue1 = this.isByWeekly;*/ //isByWeekly

			//document.getElementById(comboId).disabled = true;
		},
		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
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

			/*var path = "/ValueHelpSet(ApplicationName='TEAMLEAD',HelpType='BU',FieldValue='" + this.getModel("userPreference").getProperty("/defaultBU") +
				"')";*/
			/*var that = this;
			var currentBU = this.getModel("userPreference").getProperty("/defaultBU");
			var ofilters = [
				new Filter("ApplicationName", FilterOperator.EQ, 'TEAMLEAD'),
				new Filter("HelpType", FilterOperator.EQ, 'BU'),
				new Filter("FieldValue", FilterOperator.EQ, currentBU)
			];

			this.getModel().read('/ValueHelpSet', {
				success: function(data) {
					for (var k = 0; k < data.results.length; k++) {
						if (currentBU === data.results[k].FieldValue) {
							that.getModel("calendar").setProperty("/data/0/ColumnTxt2", data.results[k].FieldDescription);
						}
					}

				},
				filters: ofilters
			});*/

			var status = undefined;
			var tableItems = oTable.getItems();
			for (var j = 0; j < tableItems.length; j++) {
				var oModel = tableItems[j].getBindingContext().getModel();
				var oPath = tableItems[j].getBindingContext().getPath();
				status = oModel.getProperty(oPath).WeekStatus;
				if (status !== 'NE') {
					break;
				}
			}
			// this logic will be enabled later
			/*if (status === 'NE') {
				this.getView().byId("editPlanning").setEnabled(false);
			} else {
				this.getView().byId("editPlanning").setEnabled(true);
			}*/

			if (this.userPref.successMaskEntry) {
				MessageToast.show(this.getResourceBundle().getText("successPostMsg"));
				this.userPref.successMaskEntry = false;
			}
			if (this.userPref.successWeekSubmit) {
				MessageToast.show(this.getResourceBundle().getText("successWeeklyReportPostMsg"));
				this.userPref.successWeekSubmit = false;
			}
		},
		/* =========================================================== */
		/* User Event methods                                            */
		/* =========================================================== */
		onPeriodSelect: function(oEvent) {
			var oKey = oEvent.getParameter("key");
			var oData = {
				PersoValue: ''
			};
			if (oKey === "OneWeek") {
				this.twoWeek = false;
				this.userPref.startDate = new Date();
				this.userPref.defaultPeriod = 1;
			} else {
				this.twoWeek = true;
				this.userPref.startDate = datetime.getLastWeek(new Date());
				this.userPref.defaultPeriod = 2;
				oData.PersoValue = 'X';
			}

			var url = "/PersonalizationSet(ApplicationName='TEAMLEAD',UserId='" + this.getView().getModel("userPreference").getProperty(
				"/userID") + "',PersoId='BW')";
			this.getView().getModel().update(url, oData);
			this.getView().getModel("userPreference").setProperty("/startDate", this.userPref.startDate);
			this.getView().getModel("userPreference").setProperty("/defaultPeriod", this.userPref.defaultPeriod);
			this._calendarBinding(this.userPref.startDate, this.userPref.defaultPeriod);
		},
		onEmployeSearch: function(oEvent) {

			var sQuery = oEvent.getParameter("query");
			this.userPref.employeeFilter = sQuery;
			this.getView().getModel("userPreference").setProperty("/employeeFilter", this.userPref.employeeFilter);
			this._applyFilters();
		},
		OnHourPress: function(oEvent) {
			//var currentBindingPath = oEvent.getSource().getBindingContext().getPath();
			// Edit Enable

			this.currentEmp = oEvent.getSource().data('employee');
			this.currentEmpName = oEvent.getSource().data('employeeName');
			this.currentDate = oEvent.getSource().data('selectedDate'); //getCustomData()[3].getValue();
			var oView = this.getView();
			var oDialog = oView.byId("EmpDayCheckDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.vinci.timesheet.admin.view.EmployeeDayDialog", this);
				oView.addDependent(oDialog);
				var footerData = {
					MainNewScreen: false,
					MainUpdateScreen: false,
					ProjectScreen: false,
					MainPreviousScreen: true
				};
				var oFooterModel = new JSONModel(footerData);
				this.getView().setModel(oFooterModel, "footer");

			}

			oDialog.bindElement("/EmployeeSet('" + this.currentEmp + "')");

			var urlStr = "/WorkDaySet(EmployeeId='" + this.currentEmp + "'," + "WorkDate=" + datetime.getODataDateKey(this.currentDate) + ")";
			oView.byId('EmpDayTotal').bindElement(urlStr);
			oView.byId('EmpDayStatus').bindElement(urlStr);
			oView.byId('EmpDayInfo').bindElement(urlStr);

			var Filters = [
				new Filter("EmployeeId", FilterOperator.EQ, this.currentEmp),
				new Filter("WorkDate", FilterOperator.EQ, this.currentDate)
			];

			/*oDialog.getContent()[0].setVisible(true);
			oDialog.getContent()[1].setVisible(false);*/ // Invisible Add Information Screen
			this.update = false;
			oDialog.open();
			var table = this.getView().byId('tableDayItems');
			table.setModel(this.getView().getModel());
			table.getBinding("items").filter(Filters, "Application");

			var editEnable = oEvent.getSource().data('entryEnable');

			if (editEnable) {
				this.getView().byId('AddNewTimeButton').setEnabled(true);
			} else {
				this.getView().byId('AddNewTimeButton').setEnabled(false);
			}

			var EmpDetail = {
				enable: editEnable
			};
			var oEmpDetailModel = new JSONModel(EmpDetail);
			this.getView().setModel(oEmpDetailModel, "EmpDetail");
		},

		OnskipFilterScreen: function(oEvent) {
			var filterView = this.getView().byId("adminFilter");
			var oTable = this.byId("table");
			filterView.setSize("0%");
			oTable.setBusy(false);
		},
		onFilterPress: function(oEvent) {
			var oView = this.getView();
			var oDialog = oView.byId("filterDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.vinci.timesheet.admin.view.FilterDialog", this);
				oView.addDependent(oDialog);

			}
			oDialog.setModel(this.getView().getModel());
			oDialog.setModel(this.getView().getModel('i18n'), 'i18n');
			oDialog.open();
		},
		OnTableTeamChange : function(oEvent) {
			var oItem = oEvent.getParameter('selectedItem');
			this.userPref.teamFilter = oItem.getKey();
			this.userPref.teamName = oItem.getText(); 
			
			this._applyFilters();
		},
		handleAdvanceSearch: function(oEvent) {
			var mParams = oEvent.getParameters();
			var that = this;
			if (mParams.filterItems.length > 0) {
				jQuery.each(mParams.filterItems, function(i, oItem) {
					//var aSplit = oItem.getKey().split(");
					if (oItem.getParent().getProperty("key") === 'BusinessUnit') {
						that.userPref.defaultBU = oItem.getKey();
						var oData = {
							PersoValue: oItem.getKey()
						};
						var url = "/PersonalizationSet(ApplicationName='TEAMLEAD',UserId='" + that.getView().getModel("userPreference").getProperty(
							"/userID") + "',PersoId='BU')";
						that.getView().getModel().update(url, oData);
					} else if (oItem.getParent().getProperty("key") === 'Team') {
						that.userPref.teamFilter = oItem.getKey();
						that.userPref.teamName = oItem.getText();       
						
						
							
					}
					//var sPath1 = oItem.getParent().getProperty("key");
					//var sOperator = FilterOperator.EQ;
					//var sValue1 = oItem.getKey();
					//var sValue2 = "";
					//	var sValue2 = aSplit[3];
					//var oFilter = new Filter(sPath1, sOperator, sValue1, sValue2);

				});
			} else {
				this.userPref.teamFilter = null;
				this.userPref.teamName = null;
			}
			this._applyFilters();

		},
		onPastPeriodNavPress: function(oEvent) {
			if (this.twoWeek) {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() - 7);
				this._calendarBinding(this.userPref.startDate, 2);
			} else {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() - 7);
				this._calendarBinding(this.userPref.startDate, 1);
			}
			this.getView().getModel("userPreference").setProperty("/startDate", this.userPref.startDate);
		},
		onFuturePeriodNavPress: function(oEvent) {
			if (this.twoWeek) {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() + 7);
				this._calendarBinding(this.userPref.startDate, 2);
			} else {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() + 7);
				this._calendarBinding(this.userPref.startDate, 1);
			}
			this.getView().getModel("userPreference").setProperty("/startDate", this.userPref.startDate);
		},
		OnCancelEmpDayCheckDialog: function(oEvent) {
			var oDialog = this.getView().byId("EmpDayCheckDialog");
			fragment.AddUpdatetime_destroy(this.getView().byId('idIconTabBarMulti'));
			//this.getView().byId('table').getBinding("items").refresh();
			if (this.update) {
				this._applyFilters();
			}
			oDialog.close();
		},
		OnCancelFilterDialog: function(oEvent) {
			var oDialog = this.getView().byId("filterDialog");
			//this.getView().byId('table').getBinding("items").refresh();
			oDialog.close();
		},
		onPressSaveEntries: function(oEvent) {
			var that = this;
			var headerContextPath = this.getView().byId('EmpDayTotal').getBindingContext().getPath();
			var oTable = this.getView().byId('tableDayItems');
			fragment.AddUpdatetime_saveEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));

				that.getView().getModel().read(headerContextPath);
				oTable.getBinding("items").refresh();
				that.update = true;
				MessageToast.show(that.getResourceBundle().getText("successPostMsg"));
			}, this.getView().byId("EmpDayCheckDialog"), oEvent.getSource());

		},
		onPressUpdateEntries : function(oEvent) {
			var that = this;
			var headerContextPath = this.getView().byId('EmpDayTotal').getBindingContext().getPath();
			var dialogContextPath = this.getView().byId('idIconTabBarMulti').getBindingContext().getPath();
			var oTable = this.getView().byId('tableDayItems');
			fragment.AddUpdatetime_updateEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));

				that.getView().getModel().read(headerContextPath);
				oTable.getBinding("items").refresh();
				that.update = true;
				MessageToast.show(that.getResourceBundle().getText("successUpdateMsg"));
			}, this.getView().byId("EmpDayCheckDialog"), oEvent.getSource(),dialogContextPath);

		},

		////*** Add New Time  **///
		OnAddEmpTime: function(oEvent) {
			var oView = this.getView();
			var oDialog = oView.byId("EmpDayCheckDialog");
			this.employees = [{
				employee: this.currentEmp,
				employeeName: this.currentEmpName,
				Days: [this.currentDate]
			}];

			var oModel = fragment.AddUpdatetime_init(this, oDialog.getContent()[0], "New", this.getResourceBundle(), this.employees, this.getView()
				.getModel());

			this.getView().setModel(oModel.AddTime, "AddTime");
			this.getView().setModel(oModel.projectSearch, "projectSearch");
			this.getView().getModel("footer").destroy();
			this.getView().setModel(oModel.footer, "footer");
			this.getView().setModel(oModel.Emps, "Emps");

		},
		/*onPressProjectCancel: function() {
			var projectfragment = fragment.SearchProject_getProjectSearchFragment();
			fragment.SearchProject_destroy(projectfragment);

		},
		onPressProjectSelect: function(oEvent) {
			var projectfragment = fragment.SearchProject_getProjectSearchFragment();
			var projectContext = fragment.SearchProject_getProjectContext(projectfragment); //oEvent.getSource().getCustomData()[0].getValue();
			if (projectContext === null || projectContext === "") {
				MessageBox.alert(this.getResourceBundle().getText("noprojectselectmessage"));
			} else {
			
				fragment.SelectProject_afterSelection(projectContext);
				fragment.SearchProject_destroy(projectfragment);

			}
		},*/
		onPressCancel: function() {
			fragment.AddUpdatetime_destroy(this.getView().byId('idIconTabBarMulti'));

		},

		///////
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.vinci.timesheet.admin.view.WeeklySummary
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklySummary
		 */
		onAfterRendering: function() {
			var totalH = window.innerHeight - 200;
			this.getView().byId('TableScroll').setHeight(totalH + 'px');

		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklySummary
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
		_onObjectMatched: function(oEvent) {

			this.userPref = this.getView().getModel("userPreference").getData();
			var oPeriodbutton = this.getView().byId("periodButton");
			if (this.userPref.defaultPeriod === 1) {
				this.twoWeek = false;
			} else {
				this.twoWeek = true;
				oPeriodbutton.setSelectedKey("twoWeek");
			}
			this._calendarBinding(this.userPref.startDate, this.userPref.defaultPeriod);
		},
		_applyFilters: function() {
			var oTable = this.byId("table");
			var Filters = [
				new Filter("WeekNumber", FilterOperator.EQ, this.currentWeekNumber),
				new Filter("WeekYear", FilterOperator.EQ, this.currentYear),
				new Filter("isByWeekly", FilterOperator.EQ, this.twoWeek),
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU),
				new Filter("TeamID", FilterOperator.EQ, this.userPref.teamFilter)
			];
			if (this.userPref.teamFilter !== null && this.userPref.teamFilter.length > 0) {
				Filters.push(new Filter("TeamID", FilterOperator.EQ, this.userPref.teamFilter));
			}
			if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
				Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.userPref.employeeFilter));
			}
			oTable.getBinding("items").filter(Filters, "Application");
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.WeeklySummary
		 */
		onManageTeamSelection: function() {
			this.getRouter().navTo("TeamManage", {
				source: 'Summary'
			}, true);
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.WeeklySummary
		 */
		OnTimesheetSelection: function() {
			/*	if (this.twoWeek) {
					MessageBox.alert("Planning is only support for weekly view selection");
				} else {*/
			this.getRouter().navTo("periodSelection", {
				source: 'Summary'
			}, true);
			//		}
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.WeeklySummary
		 */
		OnWeeklyReportSelection: function() {
			this.getRouter().navTo("ReportEmployeeSelection", {
				source: 'Summary'
			}, true);
		},
		OnEditEmpDayitem: function(oEvent) {
			//MessageBox.information(this.getResourceBundle().getText("editMessage"));
			var oDialog = this.getView().byId("EmpDayCheckDialog");
			this.employees = [{
				employee: this.currentEmp,
				employeeName: this.currentEmpName,
				Days: [this.currentDate]
			}];

			var oModel = fragment.AddUpdatetime_init(this, oDialog.getContent()[0], "Update", this.getResourceBundle(), this.employees, this.getView()
				.getModel(),oEvent.getSource().getBindingContext().getPath());

			this.getView().setModel(oModel.AddTime, "AddTime");
			this.getView().setModel(oModel.projectSearch, "projectSearch");
			this.getView().getModel("footer").destroy();
			this.getView().setModel(oModel.footer, "footer");
			this.getView().setModel(oModel.Emps, "Emps");

		},
		OnDeleteEmpDayitem: function(oEvent) {
			var binding = oEvent.getSource().getBindingContext().getPath();
			var that = this;
			var contextPath = this.getView().byId('EmpDayTotal').getBindingContext().getPath();

			//this.getView().byId('EmpDayTotal').getBinding('text').refresh();
			//oView.byId('EmpDayStatus').bindElement(urlStr);
			//oView.byId('EmpDayInfo').bindElement(urlStr);
			
			MessageBox.confirm(
			that.getResourceBundle().getText("confirmDeleteMsg"), 
			{
				title: that.getResourceBundle().getText("deletecnfm"),
				onClose: function fnCallbackConfirm(oAction) {
					if (oAction==='OK') {
						that.getView().getModel().remove(binding, {
							success: function() {
								that.getView().getModel().read(contextPath);
								that.update = true;
								MessageToast.show(that.getResourceBundle().getText("successDeleteMsg"));
							}
						});		
					} else {
						return;
					}
				}
			});
		},

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
			fragment.AddUpdatetime_OnTabSelected(oEvent, this.getView());
		},
		OnaddNewHourPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewHourPress(this);
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
		onAbsenceCatChange : function (oEvent) {
			fragment.AddUpdateTime_onAbsenceCatChange(oEvent, this.getView().getModel('AddTime'),this.getView());
		},
		handleAllowanceZoneTypeLoadItems: function(oEvent) {
			fragment.AddUpdatetime_handleAllowanceZoneTypeLoadItems(oEvent);
		},
		handleAbsTypeLoadItems: function(oEvent) {
			fragment.AddUpdatetime_handleAbsTypeLoadItems(oEvent);
		},

		//// **AddUpdateTime Fragment Event End** ///////
		//// **AddKM Fragment Event** ///////
		OnChangeStartTimeKM: function(oEvent) {
			fragment.AddKM_OnChangeStartTimeKM(oEvent);
		},
		OnChangeEndTimeKM: function(oEvent) {
			fragment.AddKM_OnChangeEndTimeKM(oEvent);
		},
		handleKMTypeLoadItems: function(oEvent) {
				fragment.AddKM_handleKMTypeLoadItems(oEvent);
			}
			//// **AddKM Fragment Event End** ///////
	});
});
