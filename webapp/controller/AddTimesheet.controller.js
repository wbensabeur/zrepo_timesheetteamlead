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
			var oFragment = sap.ui.xmlfragment(this.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", this);
			this.getView().byId('addTimeTab').getItems()[0].addItem(oFragment);

			var odata = {
				totalhrs: 0,
				visibleHrs: true,
				visibleDailyAllow: true,
				visibleKM: true,
				visibleAbsence: false,
				visibleEquipment: false,
				visibleSummary: false,
				visibleProjectOptional: false,
				newTime: true
			};
			var oModel = new JSONModel(odata);
			this.getView().setModel(oModel, "AddTime");

			var projectdata = {
				worklistTableTitle: this.getResourceBundle().getText("projectSearchHeader")
			};

			var oProjectModel = new JSONModel(projectdata);
			this.getView().setModel(oProjectModel, "projectSearch");

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
			this.userPref = this.getView().getModel("userPreference").getData();
			var caldenderdata = datetime.getCalenderData(this.userPref.startDate, this.userPref.defaultPeriod, this.getResourceBundle());
			var oCalendarModel = new JSONModel(caldenderdata);
			this.setModel(oCalendarModel, "calendar");
		},
		onPressCancel: function() {
			this.getRouter().navTo("periodSelection", {}, true);
		},
		onPressProjectCancel: function() {
			var projectfragment = this._getProjectSearchFragment();
			var visible = [this.getView().byId('MainCancelButton'),this.getView().byId('MainAddButton')];
			var hide = [this.getView().byId('ProjectCancelButton'),this.getView().byId('ProjectSelectButton')];
			fragment.SearchProject_destroy(projectfragment,hide,visible);

		},
		onPressProjectSelect: function(oEvent) {
			var projectfragment = this._getProjectSearchFragment();
			var projectContext = fragment.SearchProject_getProjectContext(projectfragment); //oEvent.getSource().getCustomData()[0].getValue();
			if (projectContext === null || projectContext === "") {
				MessageBox.alert(this.getResourceBundle().getText("noprojectselectmessage"));
			} else {
				var visible = [this.getView().byId('MainCancelButton'),this.getView().byId('MainAddButton')];
				var hide = [this.getView().byId('ProjectCancelButton'),this.getView().byId('ProjectSelectButton')];
				
				fragment.SelectProject_afterSelection(projectContext);
				fragment.SearchProject_destroy(projectfragment,hide,visible);

			}
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.AddTimesheet
		 */
		OnaddNewHourPress: function(oEvent) {

			var oFragment = sap.ui.xmlfragment(this.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", this);

			this.getView().byId('addTimeTab').getItems()[0].addItem(oFragment);
		},
		OnTimeDelete: function(oEvent) {
			var source = oEvent.getSource();
			//var sourcePanel = source.getParent().getParent();
			var sourcePanel = this._getOwnPanelObject(source);
			this.getView().byId('addTimeTab').getItems()[0].removeItem(sourcePanel);
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

		//// **SearchProject Fragment Event** ///////
		OnProjectSelected: function(oEvent) {
			var selectButton = this.getView().byId('ProjectSelectButton');
			fragment.SearchProject_OnProjectSelected(oEvent, selectButton);
		},
		OnFavoriteChange: function(oEvent) {
			fragment.SearchProject_OnFavoriteChange(oEvent, this.getView().getModel());
		},
		onProjectSearchFinished: function(oEvent) {
			fragment.SearchProject_onProjectSearchFinished(oEvent, this.getModel("projectSearch"), this.getResourceBundle()) ;
		},

		////****SearchProject Fragment Event End******//////////
		
		//// **SelectProject Fragment Event** ///////
		OnProjectSearch: function(oEvent) {

			var ownHBox = oEvent.getSource().getParent();
			var ownLabel = ownHBox.getItems()[0];
			this.ownIntialButton = ownHBox.getItems()[1];
			this.ownRefreshButton = ownHBox.getItems()[2];
			var content = this._getOwnContentObject(ownHBox);
			
			this.currentLabel = ownLabel;
			// Visible = false
			var hide = [this.getView().byId('MainCancelButton'),this.getView().byId('MainAddButton')];
			//this.getView().byId('MainCancelButton').setVisible(false);
			//this.getView().byId('MainAddButton').setVisible(false);

			// Visible = true
			var visible = [this.getView().byId('ProjectCancelButton'),this.getView().byId('ProjectSelectButton')];
			//this.getView().byId('ProjectCancelButton').setVisible(true);
			//this.getView().byId('ProjectSelectButton').setVisible(true);
		fragment.SelectProject_OnProjectSearch(oEvent, this, content[0], this.getView().byId('ProjectSelectButton'), hide, visible);	
		//fragment.SearchProject_init(this , content[0],ownLabel,this.getView().byId('ProjectSelectButton'), hide, visible);
			//fragment.SearchProject_init(fragment, content[0], ownLabel, this.getView().byId('ProjectSelectButton'), hide, visible);

		},
		OnProjectRefresh: function(oEvent) {
			var ownHBox = oEvent.getSource().getParent();
			var ownLabel = ownHBox.getItems()[0];
			var content = this._getOwnContentObject(ownHBox);

			//content[1].getCustomData()[1].setValue(ownLabel.getId());
			this.currentLabel = ownLabel;
			//content[0].setVisible(false); // main Frame
			//content[1].setVisible(true); // Project SEarch Frame
			// Visible = false
			var hide = [this.getView().byId('MainCancelButton'),this.getView().byId('MainAddButton')];
			//this.getView().byId('MainCancelButton').setVisible(false);
			//this.getView().byId('MainAddButton').setVisible(false);

			// Visible = true
			//this.getView().byId('ProjectCancelButton').setVisible(true);
			//this.getView().byId('ProjectSelectButton').setVisible(true);
			var visible = [this.getView().byId('ProjectCancelButton'),this.getView().byId('ProjectSelectButton')];
			
			fragment.SelectProject_OnProjectRefresh(oEvent, this, content[0], this.getView().byId('ProjectSelectButton'), hide, visible);	

		},
		//// **SelectProject Fragment Event End** ///////
		
		
		
		OnTabSelected: function(oEvent) {
			var key = oEvent.getParameter('key');
			if (key === 'allowance') {
				this.getView().getModel('AddTime').setProperty('/visibleProjectOptional', true);
			} else {
				this.getView().getModel('AddTime').setProperty('/visibleProjectOptional', false);
			}
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
		/*_backtoMainScreen: function() {

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
		},*/
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
		_setProjectSearchFragment:function (frameid) {
			this.projectSearchFragment = frameid;
		},
		_getProjectSearchFragment:function(){
			var projectfragment = sap.ui.getCore().byId(this.projectSearchFragment);
			return projectfragment;
		}/*,
		_setSelectProjectContext: function (data){
			this.SelectProjectContext = data;
		},
		_getSelectProjectContext: function(){
			return this.SelectProjectContext;
		}*/
	});
});