sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime"
], function(BaseController, JSONModel, formatter, datetime) {
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
				totalhrs:0	
			};
			var oModel = new JSONModel(odata);
			this.getView().setModel(oModel, "AddTime");
		
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
		onPressProjectCancel : function () {
			this._backtoMainScreen();	
		
		},
		onPressProjectSelect : function () {
			this.currentLabel.bindElement(this.currentProjectContext);
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
		OnTimeDelete : function(oEvent) {
			var source = oEvent.getSource();
			//var sourcePanel = source.getParent().getParent();
			var sourcePanel = this._getOwnPanelObject(source);
			this.getView().byId('addTimeTab').getContent()[0].removeItem(sourcePanel);
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var currentTotalhrs = this.getView().getModel('AddTime').getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs - currentValue;
			this.getView().getModel('AddTime').setProperty('/totalhrs',newTotalhrs);
			
		},
		OnChangeHours : function(oEvent) {
			var source = oEvent.getSource();
			//var sourcePanel = source.getParent().getParent().getParent();
			var sourcePanel = this._getOwnPanelObject(source);
			var newValue = datetime.timeToDecimal(oEvent.getParameter("value"));
			
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.getView().getModel('AddTime').getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.getView().getModel('AddTime').setProperty('/totalhrs',newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
		
		},
		OnchangeTimeSelection: function(oEvent) {
			var source = oEvent.getSource();
			var sourcePanel = this._getOwnPanelObject(source);
			var newValue = 0;
			if(oEvent.getParameter("selectedIndex") === 1)
			{
				newValue = 8;
			
				
			}
			/*else {
				
			}*/
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.getView().getModel('AddTime').getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.getView().getModel('AddTime').setProperty('/totalhrs',newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
		},
		OnProjectSelected : function (oEvent) {
			var contextPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			oEvent.getSource().getParent().getCustomData()[0].setValue(contextPath);
			this.currentProjectContext = contextPath;
			//var label = sap.ui.getCore().byId(oEvent.getSource().getParent().getCustomData()[1].getValue());
			//label.bindElement(contextPath);
				
		},
		OnProjectSearch : function(oEvent) {
			
			var ownHBox = oEvent.getSource().getParent();
			var ownLabel = ownHBox.getItems()[0]; 
			this.ownIntialButton = ownHBox.getItems()[1];
			this.ownRefreshButton = ownHBox.getItems()[2];
			var content = this._getOwnContentObject(ownHBox);
			
			content[1].getCustomData()[1].setValue(ownLabel.getId());
			this.currentLabel = ownLabel;
			content[0].setVisible(false);  // main Frame
			content[1].setVisible(true);   // Project SEarch Frame
			// Visible = false
			this.getView().byId('MainCancelButton').setVisible(false);
			this.getView().byId('MainAddButton').setVisible(false);
			
			// Visible = true
			this.getView().byId('ProjectCancelButton').setVisible(true);
			this.getView().byId('ProjectSelectButton').setVisible(true);
			
			
		},
		OnFavoriteChange : function(oEvent) {
			alert('test');
		},
		_getOwnPanelObject: function(source){
			var parent = source.getParent();
			
			while (parent.getCustomData().length === 0){
				parent = parent.getParent();
			}
			return parent;
				
		},
		_getOwnContentObject : function(source) {
			 var parent = source.getParent();
			 while (parent.getMetadata().getName() !== 'sap.m.IconTabFilter'){
			 	parent = parent.getParent();
			 }
			 return parent.getContent();
		},
		_getProjectSearchObject : function (source) {
			
		},
		_getOwnHBox : function (source) {
			
		},
		_backtoMainScreen : function () {
			
			var tabItems = this.getView().byId('idIconTabBarMulti').getItems();
			
			for (var k = 0; k < tabItems.length; k++){
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
		}
	});
});