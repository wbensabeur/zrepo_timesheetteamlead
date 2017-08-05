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
	return BaseController.extend("com.vinci.timesheet.admin.controller.WeeklySummary", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklySummary
		 */
		onInit: function() {
			this.getRouter().getRoute("home").attachPatternMatched(this._onObjectMatched, this);
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			/// Attach Seeting button from Shell
			var setting = sap.ui.getCore().byId("shellSettings");
			if (setting !== null) {
				setting.attachPress(function(oEvent) {
					//alert("Personal Setting");
				});
			}
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
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
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
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt1", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt2", this.getModel("userPreference").getProperty("/defaultBU"));
		},
		/* =========================================================== */
		/* User Event methods                                            */
		/* =========================================================== */
		onPeriodSelect: function(oEvent) {
			var oKey = oEvent.getParameter("key");
			var oData = {PersoValue:''};
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
			
			var url = "/PersonalizationSet(UserId='"+this.getView().getModel("userPreference").getProperty("/userID")+"',PersoId='BW')";
			this.getView().getModel().update(url,oData);
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
		//	var currentBindingPath = oEvent.getSource().getBindingContext().getPath();
			var currentEmp = oEvent.getSource().getCustomData()[2].getValue();
			var currentDate = oEvent.getSource().getCustomData()[3].getValue();
			var oView = this.getView();
			var oDialog = oView.byId("EmpDayCheckDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.vinci.timesheet.admin.view.EmployeeDayDialog", this);
				oView.addDependent(oDialog);
				var oFragment = sap.ui.xmlfragment(this.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", this);
				this.getView().byId('addTimeTab').getContent()[0].addItem(oFragment);
			}
			oDialog.bindElement("/EmployeeSet('" + currentEmp + "')");
			
			var urlStr = "/WorkDaySet(EmployeeId='"+currentEmp + "'," + "WorkDate=" + datetime.getODataDateKey(currentDate) +")";
			oView.byId('EmpDayTotal').bindElement(urlStr);
			oView.byId('EmpDayStatus').bindElement(urlStr);
			oView.byId('EmpDayInfo').bindElement(urlStr);
			
			oDialog.getContent()[0].setVisible(true);
			oDialog.getContent()[1].setVisible(false); // Invisible Add Information Screen
			
			oDialog.open();
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
			oDialog.open();
		},
		onPastPeriodNavPress: function(oEvent) {
			if (this.twoWeek) {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() - 14);
				this._calendarBinding(this.userPref.startDate, 2);
			} else {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() - 7);
				this._calendarBinding(this.userPref.startDate, 1);
			}
			this.getView().getModel("userPreference").setProperty("/startDate", this.userPref.startDate);
		},
		onFuturePeriodNavPress: function(oEvent) {
			if (this.twoWeek) {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() + 14);
				this._calendarBinding(this.userPref.startDate, 2);
			} else {
				this.userPref.startDate.setDate(this.userPref.startDate.getDate() + 7);
				this._calendarBinding(this.userPref.startDate, 1);
			}
			this.getView().getModel("userPreference").setProperty("/startDate", this.userPref.startDate);
		},
		OnCancelEmpDayCheckDialog: function(oEvent) {
			var oDialog = this.getView().byId("EmpDayCheckDialog");
			oDialog.close();
		},
		OnCancelFilterDialog: function(oEvent) {
			var oDialog = this.getView().byId("filterDialog");
			oDialog.close();
		},
		
		////*** Add New Time  **///
		OnAddEmpTime : function(oEvent)
		{
			var oView = this.getView();
			var oDialog = oView.byId("EmpDayCheckDialog");
			
			
			
			
			oDialog.getContent()[0].setVisible(false);
			oDialog.getContent()[1].setVisible(true);
			
			var odata = {
				totalhrs: 0,
				visibleHrs: true,
				visibleDailyAllow: true,
				visibleKM:true,
				visibleAbsence:false,
				visibleEquipment:false,
				visibleSummary:false,
				visibleProjectOptional: false,
				newTime : true
			};
			var oModel = new JSONModel(odata);
			this.getView().setModel(oModel, "AddTime");
			
			var projectdata = {
				worklistTableTitle : this.getResourceBundle().getText("projectSearchHeader")
			};
			
			var oProjectModel = new JSONModel(projectdata);
			this.getView().setModel(oProjectModel, "projectSearch");
		},
		
		OnTimeDelete: function(oEvent) {
			var source = oEvent.getSource();
			//var sourcePanel = source.getParent().getParent();
			var sourcePanel = this._getOwnPanelObject(source);
			this.getView().byId('addTimeTab').getContent()[0].removeItem(sourcePanel);
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var currentTotalhrs = this.getView().getModel('AddTime').getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs - currentValue;
			this.getView().getModel('AddTime').setProperty('/totalhrs', newTotalhrs);

		},
		OnChangeHours: function(oEvent) {
			var source = oEvent.getSource();
			//var sourcePanel = source.getParent().getParent().getParent();
			var sourcePanel = this._getOwnPanelObject(source);
			var newValue = datetime.timeToDecimal(oEvent.getParameter("value"));

			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.getView().getModel('AddTime').getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.getView().getModel('AddTime').setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);

		},
		OnTabSelected: function(oEvent) {
			var key = oEvent.getParameter('key');
			if (key === 'allowance') {
				this.getView().getModel('AddTime').setProperty('/visibleProjectOptional', true);
			} else {
				this.getView().getModel('AddTime').setProperty('/visibleProjectOptional', false);
			}
		},
		OnaddNewHourPress: function(oEvent) {

			var oFragment = sap.ui.xmlfragment(this.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", this);

			this.getView().byId('addTimeTab').getContent()[0].addItem(oFragment);
		},
		OnchangeTimeSelection: function(oEvent) {
			var source = oEvent.getSource();
			var sourcePanel = this._getOwnPanelObject(source);
			var newValue = 0;
			var allDayCombo = this._getOwnAllDayComboBox(source);
			var selecthrsCombo = this._getOwnSelectedHrContent(source);
			if (oEvent.getParameter("selectedIndex") === 1) {
				newValue = 0;
				allDayCombo.setVisible(false);
				selecthrsCombo.setVisible(true);

			} else { // For all day Selection
				allDayCombo.setVisible(true);
				selecthrsCombo.setVisible(false);
			}
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.getView().getModel('AddTime').getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.getView().getModel('AddTime').setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
		},
		OnProjectSelected: function(oEvent) {
			var contextPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			oEvent.getSource().getParent().getCustomData()[0].setValue(contextPath);
			this.currentProjectContext = contextPath;
			//var label = sap.ui.getCore().byId(oEvent.getSource().getParent().getCustomData()[1].getValue());
			//label.bindElement(contextPath);

		},
		OnProjectSearch: function(oEvent) {
			
			

			var ownHBox = oEvent.getSource().getParent();
			var ownLabel = ownHBox.getItems()[0];
			this.ownIntialButton = ownHBox.getItems()[1];
			this.ownRefreshButton = ownHBox.getItems()[2];
			var content = this._getOwnContentObject(ownHBox);
			/*if(content.length < 2)
			{
				var oFragment = sap.ui.xmlfragment(this.getView().getId(), "com.vinci.timesheet.admin.view.SelectProject", this);
				content.push(oFragment);
			}*/
			
			content[0].setVisible(false); // main Frame
			content[1].setVisible(true); // Project SEarch Frame
			content[1].getCustomData()[1].setValue(ownLabel.getId());
			this.currentLabel = ownLabel;
			// Visible = false
			this.getView().byId('MainCancelButton').setVisible(false);
			this.getView().byId('MainAddButton').setVisible(false);

			// Visible = true
			this.getView().byId('ProjectCancelButton').setVisible(true);
			this.getView().byId('ProjectSelectButton').setVisible(true);

		},
		onProjectSearchFinished : function (oEvent) {
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("projectSearchHeaderCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("projectSearchHeader");
			}
			this.getView().getModel("projectSearch").setProperty("/worklistTableTitle", sTitle);
			
		},
		OnProjectRefresh : function(oEvent) {
			var ownHBox = oEvent.getSource().getParent();
			var ownLabel = ownHBox.getItems()[0];
			var content = this._getOwnContentObject(ownHBox);
			
			content[1].getCustomData()[1].setValue(ownLabel.getId());
			this.currentLabel = ownLabel;
			content[0].setVisible(false); // main Frame
			content[1].setVisible(true); // Project SEarch Frame
			// Visible = false
			this.getView().byId('MainCancelButton').setVisible(false);
			this.getView().byId('MainAddButton').setVisible(false);

			// Visible = true
			this.getView().byId('ProjectCancelButton').setVisible(true);
			this.getView().byId('ProjectSelectButton').setVisible(true);

			
		},
		
		_getOwnPanelObject: function(source) {
			var parent = source.getParent();

			while (parent.getCustomData().length === 0) {
				parent = parent.getParent();
			}
			return parent;

		},
		_getOwnContentObject: function(source) {
			var parent = source.getParent();
			while (parent.getMetadata().getName() !== 'sap.m.IconTabFilter') {
				parent = parent.getParent();
			}
			return parent.getContent();
		},
		_getProjectSearchObject: function(source) {

		},
		_getOwnHBox: function(source) {

		},
		_backtoMainScreen: function() {

			var tabItems = this.getView().byId('idIconTabBarMulti').getItems();

			for (var k = 0; k < tabItems.length; k++) {
				var content = tabItems[k].getContent();
				content[0].setVisible(true);
				content[1].setVisible(false);
			}

			// Visible = true
			this.getView().byId('MainCancelButton').setVisible(true);
			this.getView().byId('MainAddButton').setVisible(true);

			// Visible = false
			this.getView().byId('ProjectCancelButton').setVisible(false);
			this.getView().byId('ProjectSelectButton').setVisible(false);
		},
		_getOwnAllDayComboBox: function(radioGroup) {
			var parent = radioGroup.getParent();
			while (parent.getMetadata().getName() !== 'sap.m.HBox') {
				parent = parent.getParent();
			}
			var items = parent.getItems();
			var comboBox = null;
			for (var k = 0; k < items.length; k++) {
				if (items[k].getMetadata().getName() === 'sap.m.ComboBox') {
					comboBox = items[k];
					break;
				}
			}
			return comboBox;
		},
		_getOwnSelectedHrContent: function(radioGroup) {
			return radioGroup.getParent().getParent().getParent().getItems()[3];
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
		//			onAfterRendering: function() {
		//
		//			},
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
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU)
			];
			if (this.userPref.employeeFilter !== null && this.userPref.employeeFilter.length > 0) {
				Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.userPref.employeeFilter));
			}
			
			oTable.getBinding("items").filter(Filters, "Application");
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.WeeklySummary
		 */
		OnTimesheetSelection: function() {
		/*	if (this.twoWeek) {
				MessageBox.alert("Planning is only support for weekly view selection");
			} else {*/
				this.getRouter().navTo("periodSelection", {}, true);
	//		}
		},
		
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.WeeklySummary
		 */
		OnWeeklyReportSelection: function() {
			this.getRouter().navTo("ReportEmployeeSelection", {}, true);
		}
	});
});