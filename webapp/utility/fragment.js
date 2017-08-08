sap.ui.define(["com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"

], function(datetime, JSONModel, MessageBox) {
	"use strict";

	return {
		SearchProject_init: function(controler, container, selectButton, hideElemnt, visibleElement) {

			var fragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.SearchProject", controler);
			//	controler._setProjectSearchFragment(fragment.getId());
			this.projectSearchFragment = fragment.getId();
			//	fragment.getCustomData()[1].setValue(returnRef.getId()); 

			var hideContainer = container.getItems()[0];
			hideContainer.setVisible(false);
			container.addItem(fragment);

			selectButton.getCustomData()[0].setValue("");

			// Hide Element from previous screen
			this.footerModel.setProperty("/MainNewScreen", false);
			this.footerModel.setProperty("/MainUpdateScreen", false);
			this.footerModel.setProperty("/MainPreviousScreen", false);
			this.footerModel.setProperty("/ProjectScreen", true);
			/*for (var k = 0; k < hideElemnt.length; k++) {
				hideElemnt[k].setVisible(false);
			}*/

			// Visible Element from Project Search
			/*for (var l = 0; l < hideElemnt.length; l++) {
				visibleElement[l].setVisible(true);
			}*/

		},
		SearchProject_destroy: function(fragmentObject) {

			var container = fragmentObject.getParent();
			var hideContainer = container.getItems()[0];
			hideContainer.setVisible(true);
			fragmentObject.destroy(true);

			this.footerModel.setProperty("/MainNewScreen", true);
			this.footerModel.setProperty("/MainUpdateScreen", false);
			this.footerModel.setProperty("/MainPreviousScreen", false);
			this.footerModel.setProperty("/ProjectScreen", false);

		},
		SearchProject_getProjectContext: function(fragmentObject) {
			return fragmentObject.getCustomData()[0].getValue();
		},
		SearchProject_OnProjectFilterchange: function() {

		},
		SearchProject_OnProjectSelected: function(oEvent, selectButton) {
			var contextPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			oEvent.getSource().getParent().getCustomData()[0].setValue(contextPath);
			selectButton.getCustomData()[0].setValue(contextPath);

		},
		SearchProject_OnFavoriteChange: function(oEvent, model) {
			var icon = oEvent.getSource();
			var currentState = model.getProperty(icon.getBindingContext().getPath() + '/Favorite');
			if (currentState) // to become unfav
			{
				model.setProperty(icon.getBindingContext().getPath() + '/Favorite', false);
				model.update(icon.getBindingContext().getPath(), {
					Favorite: false
				});

			} else // to become Fav
			{
				model.setProperty(icon.getBindingContext().getPath() + '/Favorite', true);
				model.update(icon.getBindingContext().getPath(), {
					Favorite: true
				});
			}
		},
		SearchProject_onProjectSearchFinished: function(oEvent) {
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.i18nModel.getText("projectSearchHeaderCount", [iTotalItems]);
			} else {
				sTitle = this.i18nModel.getText("projectSearchHeader");
			}
			this.projectModel.setProperty("/worklistTableTitle", sTitle);
		},

		SearchProject_getProjectSearchFragment: function() {
			var projectfragment = sap.ui.getCore().byId(this.projectSearchFragment);
			return projectfragment;
		},
		SelectProject_afterSelection: function(projectContext) {
			this.selectProjectcontext[0].bindElement(projectContext); // Label
			this.selectProjectcontext[0].setVisible(true); // Label
			this.selectProjectcontext[1].setVisible(false); // ownIntialButton
			this.selectProjectcontext[2].setVisible(true); // ownRefreshButton
		},
		SelectProject_OnProjectSearch: function(oEvent, controler, selectButton) {

			var ownHBox = oEvent.getSource().getParent();
			this.selectProjectcontext = ownHBox.getItems();
			var container = this.AddUpdatetime_getOwnIconTabObject(oEvent.getSource());
			this.SearchProject_init(controler, container, selectButton);
		},
		SelectProject_OnProjectRefresh: function(oEvent, controler, selectButton) {
			var container = this.AddUpdatetime_getOwnIconTabObject(oEvent.getSource());
			this.SearchProject_init(controler, container, selectButton);
		},
		SelectProject_onPressProjectCancel: function() {
			var projectfragment = this.SearchProject_getProjectSearchFragment();
			this.SearchProject_destroy(projectfragment);
		},
		SelectProject_onPressProjectSelect: function() {
			var projectfragment = this.SearchProject_getProjectSearchFragment();
			var projectContext = this.SearchProject_getProjectContext(projectfragment); //oEvent.getSource().getCustomData()[0].getValue();
			if (projectContext === null || projectContext === "") {
				MessageBox.alert(this.i18nModel.getText("noprojectselectmessage"));
			} else {

				this.SelectProject_afterSelection(projectContext);
				this.SearchProject_destroy(projectfragment);

			}
		},

		//////**Add Project Time** ////
		AddProjectTime_init: function(controler, container) {
			var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", controler);
			container.addItem(oFragment);
		},
		AddProjectTime_destroy: function(fragmentObject) {
			fragmentObject.destroy(true);
		},
		AddProjectTime_OnTimeDelete: function(oEvent, container) {
			var source = oEvent.getSource();

			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			container.removeItem(sourcePanel);
			//this.AddProjectTime_destroy(sourcePanel);
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs - currentValue;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);

		},
		AddProjectTime_OnchangeTimeSelection: function(oEvent) {
			var source = oEvent.getSource();
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var newValue = 0;
			var allDayCombo = this.AddProjectTime_getOwnAllDayComboBox(source);
			var selecthrsCombo = source.getParent().getParent().getParent().getItems()[3]; //this._getOwnSelectedHrContent(source);
			if (oEvent.getParameter("selectedIndex") === 1) {
				//newValue = 0;
				var timepicker = selecthrsCombo.getItems()[1].getItems()[0];
				allDayCombo.setVisible(false);
				selecthrsCombo.setVisible(true);
				timepicker.setValue("00:00");

			} else { // For all day Selection
				allDayCombo.setVisible(true);
				selecthrsCombo.setVisible(false);
			}
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
		},
		AddProjectTime_OnChangeHours: function(oEvent) {
			var source = oEvent.getSource();

			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var newValue = datetime.timeToDecimal(oEvent.getParameter("value"));

			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
		},
		AddProjectTime__getOwnFrameObject: function(source) {
			var parent = source.getParent();

			while (parent.getCustomData().length === 0) {
				parent = parent.getParent();
			}
			return parent;
		},
		AddProjectTime_getOwnAllDayComboBox: function(radioGroup) {
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

		//////**Add Update Time** ////
		AddUpdatetime_init: function(controler, container, type, i18nModel) {

			var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddUpdateTime", controler);
			this.AddProjectTime_init(controler, controler.getView().byId('addTimeTab').getItems()[0]); // initialse with single hour
			var items = container.getItems();
			if (items.length > 0) {
				items[0].setVisible(false);
			}
			container.addItem(oFragment);

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
			this.AddUpdatetimeModel = oModel;

			var projectdata = {
				worklistTableTitle: i18nModel.getText("projectSearchHeader")
			};

			this.i18nModel = i18nModel;

			var oProjectModel = new JSONModel(projectdata);
			this.projectModel = oProjectModel;

			var footerData = {
				MainNewScreen: true,
				MainUpdateScreen: false,
				ProjectScreen: false,
				MainPreviousScreen: false
			};
			var oFooterModel = new JSONModel(footerData);
			this.footerModel = oFooterModel;

			var oModelData = {
				AddTime: oModel,
				projectSearch: oProjectModel,
				footer: oFooterModel
			};
			return oModelData;
			//this.AddProjectTime_init(controler, controler.getView().byId('addTimeTab').getItems()[0]);

			/*<core:Fragment fragmentName='com.vinci.timesheet.admin.view.AddUpdateTime' type='XML'/>*/
		},
		AddUpdatetime_destroy: function(fragmentObject) {
			if (fragmentObject !== undefined) {
				this.footerModel.setProperty("/MainNewScreen", false);
				this.footerModel.setProperty("/MainUpdateScreen", false);
				this.footerModel.setProperty("/MainPreviousScreen", true);
				this.footerModel.setProperty("/ProjectScreen", false);

				var parentframe = fragmentObject.getParent();
				fragmentObject.destroy(true);
				var items = parentframe.getItems();

				if (items.length === 1) {
					items[0].setVisible(true);
				}
			}
		},
		AddUpdatetime_OnTabSelected: function(oEvent) {
			var key = oEvent.getParameter('key');
			if (key === 'allowance') {
				this.AddUpdatetimeModel.setProperty('/visibleProjectOptional', true);
			} else {
				this.AddUpdatetimeModel.setProperty('/visibleProjectOptional', false);
			}
		},
		AddUpdatetime_OnaddNewHourPress: function(controller) {
			this.AddProjectTime_init(controller, controller.getView().byId('addTimeTab').getItems()[0]);
		},
		AddUpdatetime_getOwnIconTabObject: function(source) {
			var parent = source.getParent();
			while (parent.getMetadata().getName() !== 'sap.m.IconTabFilter') {
				parent = parent.getParent();
			}
			return parent.getContent()[0];
		}

	};

});