sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"com/vinci/timesheet/admin/utility/fragment",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, formatter, datetime,fragment,MessageBox) {
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
			this.getView().byId('addTimeTab').getContent()[0].addItem(oFragment);

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
			this._backtoMainScreen();

		},
		onPressProjectSelect: function(oEvent) {
			var projectContext = oEvent.getSource().getCustomData()[0].getValue();
			if(projectContext === null || projectContext === "")
			{
				MessageBox.alert(this.getResourceBundle().getText("noprojectselectmessage"));
			}
			this.currentLabel.bindElement(projectContext);
			this.currentLabel.setVisible(true);
			this.ownIntialButton.setVisible(false);
			this.ownRefreshButton.setVisible(true);
			this._backtoMainScreen();
		},
		/**
		 *@memberOf com.vinci.timesheet.admin.controller.AddTimesheet
		 */
		OnaddNewHourPress: function(oEvent) {

			var oFragment = sap.ui.xmlfragment(this.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", this);

			this.getView().byId('addTimeTab').getContent()[0].addItem(oFragment);
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
		
		//// **Project Fragment Event** ///////
		OnProjectSelected: function(oEvent) {
			var selectButton = this.getView().byId('ProjectSelectButton');
			fragment.SearchProject_OnProjectSelected(oEvent, selectButton);
			/*var contextPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			oEvent.getSource().getParent().getCustomData()[0].setValue(contextPath);
			this.currentProjectContext = contextPath;*/
			//var label = sap.ui.getCore().byId(oEvent.getSource().getParent().getCustomData()[1].getValue());
			//label.bindElement(contextPath);

		},
		
		////****Project Fragment Event End******//////////
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
			this.getModel("projectSearch").setProperty("/worklistTableTitle", sTitle);
			
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
		OnTabSelected: function(oEvent) {
			var key = oEvent.getParameter('key');
			if (key === 'allowance') {
				this.getView().getModel('AddTime').setProperty('/visibleProjectOptional', true);
			} else {
				this.getView().getModel('AddTime').setProperty('/visibleProjectOptional', false);
			}
		},
		OnFavoriteChange: function(oEvent) {
			var icon = oEvent.getSource();
			var currentState = this.getView().getModel().getProperty(icon.getBindingContext().getPath()+'/Favorite');
			if(currentState) // to become unfav
			{
				this.getView().getModel().setProperty(icon.getBindingContext().getPath()+'/Favorite',false);
				
				this.getView().getModel().update(icon.getBindingContext().getPath(),{Favorite:false});
			
			}
			else // to become Fav
			{
				this.getView().getModel().setProperty(icon.getBindingContext().getPath()+'/Favorite',true);
				this.getView().getModel().update(icon.getBindingContext().getPath(),{Favorite:true});
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
		}
	});
});