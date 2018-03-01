sap.ui.define(["com/vinci/timesheet/admin/utility/datetime",
	"com/vinci/timesheet/admin/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(datetime, formatter, JSONModel, MessageBox, Filter, FilterOperator) {
	"use strict";

	return {
		SearchProject_init: function(controler, container, selectButton, allProject) {

			var fragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.SearchProject", controler);

			//this.projectSearchFragment = container.getItems()[1].getItems()[0].getId();
			this.projectSearchFragment = fragment.getId();
			this.projectfilter = null;
			this.BUfilter = null;
			this.positionfilter = null;
			this.lastProjectFilter = null;
			//var oView = controler.getView();
			// change for radio focus 
			/*	var buttons = fragment.getItems()[1].getButtons();
				for (var k = 0; k < buttons.length; k++) {
					buttons[k].onAfterRendering = function() {
						oView.byId("ProjectCancelButton").focus();
					};
				}*/
			/*fragment.getItems()[1].onAfterRendering = function () {
				oView.byId("ProjectCancelButton").focus();
			};*/

			//	fragment.getCustomData()[1].setValue(returnRef.getId()); 

			container.getItems()[0].setVisible(false);
			container.getItems()[1].setVisible(true);
			//hideContainer.setVisible(false);
			container.getItems()[1].addItem(fragment);
			fragment.getItems()[2].getItems()[0].onAfterRendering = this._comboKeyboardDisable;
			fragment.getItems()[2].getItems()[2].onAfterRendering = this._comboKeyboardDisable;

			selectButton.getCustomData()[0].setValue("");

			// Hide Element from previous screen
			this.footerModel.setProperty("/MainNewScreen", false);
			this.footerModel.setProperty("/MainUpdateScreen", false);
			this.footerModel.setProperty("/MainPreviousScreen", false);
			this.footerModel.setProperty("/ProjectScreen", true);

			var applicationFilter = null;

			if (this.equipment) {
				applicationFilter = new Filter("ApplicationName", FilterOperator.EQ, "EQUIPEMENT");
			} else {
				applicationFilter = new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD");
			}
			fragment.getItems()[2].getItems()[0].getBinding("items").filter(applicationFilter);
			fragment.getItems()[2].getItems()[2].getBinding("items").filter(applicationFilter);

			if (allProject) {
				this.lastProjectFilter = null;
				fragment.getItems()[0].setVisible(false);
				fragment.getItems()[1].setVisible(false);
				fragment.getItems()[2].setVisible(true);

				var defaultBU = controler.getView().getModel('userPreference').getProperty("/defaultBU");
				var currentBUInFilter = fragment.getItems()[2].getItems()[0].getSelectedKey();
				if (currentBUInFilter !== undefined && currentBUInFilter !== null && currentBUInFilter !== '') {
					defaultBU = currentBUInFilter;
					fragment.getItems()[2].getItems()[0].setPlaceholder("");
				}
				this.BUfilter = new Filter("BusinessUnit", FilterOperator.EQ, defaultBU);

			} else {
				this.lastProjectFilter = [];
				if (this.equipment) {
					var filter0 = new Filter("EmployeeId", FilterOperator.EQ, this.userPrefModel.getProperty('/userID'));
					this.lastProjectFilter.push(filter0);
				} else {
					for (var k = 0; k < this.employees.length; k++) {
						var filter = new Filter("EmployeeId", FilterOperator.EQ, this.employees[k].employee);
						this.lastProjectFilter.push(filter);
					}
				}
				this.lastProjectFilter.push(new Filter("LastUsedProject", FilterOperator.EQ, true));
				this.lastProjectFilter.push(new Filter("Favorite", FilterOperator.EQ, true));
			}
			this.SearchProject_applyFiler();

		},
		SearchProject_destroy: function(fragmentObject) {

			var container = fragmentObject.getParent().getParent();
			container.getItems()[0].setVisible(true);
			container.getItems()[1].setVisible(false);
			//	hideContainer.setVisible(true);
			fragmentObject.destroy(true);
			if (this.type === 'Update') {
				this.footerModel.setProperty("/MainNewScreen", false);
				this.footerModel.setProperty("/MainUpdateScreen", true);
			} else {
				this.footerModel.setProperty("/MainNewScreen", true);
				this.footerModel.setProperty("/MainUpdateScreen", false);
			}
			this.footerModel.setProperty("/MainPreviousScreen", false);
			this.footerModel.setProperty("/ProjectScreen", false);

		},
		SearchProject_getProjectContext: function(fragmentObject) {
			return fragmentObject.getCustomData()[0].getValue();
		},
		SearchProject_OnProjectFilterchange: function(oEvent, oView) {

			var index = oEvent.getParameter('selectedIndex');
			var buttons = oEvent.getSource().getButtons();
			//	var sourceId = button.getId();
			//button.focus(false);

			if (index === 0) // Last + Fav Projects  
			{
				buttons[0].setEnabled(false);
				buttons[1].setEnabled(true);

				this.lastProjectFilter = [];

				if (this.equipment) {
					var filter0 = new Filter("EmployeeId", FilterOperator.EQ, this.userPrefModel.getProperty('/userID'));
					this.lastProjectFilter.push(filter0);
				} else {
					for (var k = 0; k < this.employees.length; k++) {
						var filter = new Filter("EmployeeId", FilterOperator.EQ, this.employees[k].employee);
						this.lastProjectFilter.push(filter);
					}
				}

				this.lastProjectFilter.push(new Filter("LastUsedProject", FilterOperator.EQ, true));
				this.lastProjectFilter.push(new Filter("Favorite", FilterOperator.EQ, true));

				/*this.lastProjectFilter = [new sap.ui.model.Filter([new Filter("LastUsedProject", FilterOperator.EQ, true), new Filter("Favorite",
					FilterOperator.EQ, true)], true)];*/
				oEvent.getSource().getParent().getItems()[2].setVisible(false);

			} else {
				buttons[0].setEnabled(true);
				buttons[1].setEnabled(false);
				this.lastProjectFilter = null;
				oEvent.getSource().getParent().getItems()[2].setVisible(true);
				var defaultBU = oView.getModel('userPreference').getProperty("/defaultBU");
				var currentBUInFilter = oEvent.getSource().getParent().getItems()[2].getItems()[0].getSelectedKey();
				if (currentBUInFilter !== undefined && currentBUInFilter !== null && currentBUInFilter !== '') {
					defaultBU = currentBUInFilter;
					oEvent.getSource().getParent().getItems()[2].getItems()[0].setPlaceholder("");
				}
				this.BUfilter = new Filter("BusinessUnit", FilterOperator.EQ, defaultBU);
				/*setTimeout(function() {
					try {
						var elements = document.getElementsByClassName("SelectCombo"); //
						for (var k = 0; k < elements.length; k++) {
							var eleId = elements[k].id + '-inner';
							document.getElementById(eleId).disabled = true; // .get.("tableColumnCombo")
							//	elements[k].disabled = true;
						}
					} catch (err) {

					}
				}, 500);*/

			}
			this.SearchProject_applyFiler();
			//	var that = oView;

			/*	jQuery.sap.delayedCall(0, this, function() {
					document.getElementById(sourceId).blur();
					//	that.byId("ProjectCancelButton").focus();
				});*/

		},
		SearchProject_OnProjectSelected: function(oEvent, selectButton) {
			var contextPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			oEvent.getSource().getParent().getCustomData()[0].setValue(contextPath);
			selectButton.getCustomData()[0].setValue(contextPath);

		},
		SearchProject_OnFavoriteChange: function(oEvent, model) {
			var icon = oEvent.getSource();
			var currentState = model.getProperty(icon.getBindingContext().getPath() + '/Favorite');
			var projectTable = icon.getParent().getParent();
			if (currentState) // to become unfav
			{
				model.setProperty(icon.getBindingContext().getPath() + '/Favorite', false);
				model.update(icon.getBindingContext().getPath(), {
					Favorite: false
				}, {
					success: function() {
						projectTable.getBinding("items").refresh(true);
					}
				});

			} else // to become Fav
			{
				model.setProperty(icon.getBindingContext().getPath() + '/Favorite', true);
				model.update(icon.getBindingContext().getPath(), {
					Favorite: true
				}, {
					success: function() {
						projectTable.getBinding("items").refresh(true);
					}
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
		SearchProject_onProjectDescriptionSuggest: function(oEvent) {
			var value = oEvent.getParameter("suggestValue");
			var source = oEvent.getSource();
			var filters1 = [];

			if (value.length > 2) {
				var filters = new Filter({
					filters: [new Filter("ProjectDescription", FilterOperator.Contains, value), new Filter("ProjectId", FilterOperator.Contains,
						value)],
					and: true
				});

				if (this.equipment) {
					filters1 = new Filter({
						filters: [filters, new Filter("ApplicationName", FilterOperator.EQ,
							"TEAMLEAD")],
						and: true
					});
				} else {
					filters1 = new Filter({
						filters: [filters, new Filter("ApplicationName", FilterOperator.EQ,
							"TEAMLEAD")],
						and: true
					});
				}
				source.getBinding("suggestionItems").filter(filters1);
				source.getBinding("suggestionItems").attachEventOnce('dataReceived', function() {
					source.suggest();
				});

			}

		},
		SearchProject_onProjectManagerSuggest: function(oEvent) {
			var value = oEvent.getParameter("suggestValue");
			var source = oEvent.getSource();
			var filters1 = [];

			if (value.length > 2) {
				var filters = new Filter("FieldDescription", FilterOperator.Contains, value);

				if (this.equipment) {
					filters1 = new Filter({
						filters: [filters, new Filter("ApplicationName", FilterOperator.EQ,
							"TEAMLEAD")],
						and: true
					});
				} else {
					filters1 = new Filter({
						filters: [filters, new Filter("ApplicationName", FilterOperator.EQ,
							"TEAMLEAD")],
						and: true
					});
				}
				source.getBinding("suggestionItems").filter(filters1);
				source.getBinding("suggestionItems").attachEventOnce('dataReceived', function() {
					source.suggest();
				});

			}

		},
		SearchProject_onProjectDescriptionSearch: function(oEvent) {
			if (oEvent.getParameter("suggestionItem") === undefined) {
				var query = oEvent.getParameter("query");
				if (query !== null && query.length > 0) {
					this.projectfilter = new Filter("ProjectDescription", FilterOperator.Contains, query);
				} else {
					this.projectfilter = null;
				}

			} else {
				this.projectfilter = new Filter("ProjectId", FilterOperator.EQ, oEvent.getParameter("suggestionItem").getKey());
			}
			this.SearchProject_applyFiler();

		},
		SearchProject_onProjectManagerSearch: function(oEvent) {
			if (oEvent.getParameter("suggestionItem") === undefined) {
				var query = oEvent.getParameter("query");
				if (query !== null && query.length > 0) {
					this.projectfilter = new Filter("ResponsiblePMName", FilterOperator.Contains, query);
				} else {
					this.projectfilter = null;
				}

			} else {
				this.projectfilter = new Filter("ResponsiblePM", FilterOperator.EQ, oEvent.getParameter("suggestionItem").getKey());
			}
			this.SearchProject_applyFiler();

		},
		SearchProject_onBUFilterChange: function(oEvent) {
			var BUId = oEvent.getSource().getSelectedKey();
			if (BUId === 'ALL') {
				this.BUfilter = null;
			} else {
				this.BUfilter = new Filter("BusinessUnit", FilterOperator.EQ, BUId);
			}
			this.SearchProject_applyFiler();

		},

		SearchProject_onPositionFilterChange: function(oEvent) {
			var positionId = oEvent.getSource().getSelectedKey();
			if (positionId === 'ALL') {
				this.positionfilter = null;
			} else {
				this.positionfilter = new Filter("Position", FilterOperator.EQ, positionId);
			}
			this.SearchProject_applyFiler();

		},
		SearchProject_applyFiler: function() {
			var Filters = [];
			if (this.lastProjectFilter !== null) {
				Filters = this.lastProjectFilter;
			} else {
				if (this.projectfilter !== null) {
					Filters.push(this.projectfilter);
				}
				if (this.BUfilter !== null) {
					Filters.push(this.BUfilter);
				}
				if (this.positionfilter !== null) {
					Filters.push(this.positionfilter);
				}
			}
			var appFilter = null;
			if (this.equipment) {
				appFilter = new Filter("ApplicationName", FilterOperator.EQ, "EQUIPEMENT");
			} else {
				appFilter = new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD");
			}
			Filters.push(appFilter);
			var projectfragment = sap.ui.getCore().byId(this.projectSearchFragment);
			projectfragment.getItems()[4].getBinding("items").filter(Filters, "Application");

		},
		SelectProject_afterSelection: function(projectContext) {
			this.selectProjectcontext[0].bindElement(projectContext); // Label
			this.selectProjectcontext[0].setVisible(true); // Label
			this.selectProjectcontext[1].setVisible(false); // ownIntialButton
			this.selectProjectcontext[2].setVisible(true); // ownRefreshButton

			if (this.selectProjectcontext.length === 4) {
				this.selectProjectcontext[3].setVisible(true); // ownDeleteButton
			}
		},
		SelectProject_OnProjectSearch: function(oEvent, controler, selectButton, allProject) {
			this.warning = true;

			var ownHBox = oEvent.getSource().getParent();
			this.selectProjectcontext = ownHBox.getItems();
			var container = this.AddUpdatetime_getOwnIconTabObject(oEvent.getSource());
			this.SearchProject_init(controler, container, selectButton, allProject);
		},
		SelectProject_OnProjectRefresh: function(oEvent, controler, selectButton, allProject) {
			this.warning = true;
			var ownHBox = oEvent.getSource().getParent();
			this.selectProjectcontext = ownHBox.getItems();
			var container = this.AddUpdatetime_getOwnIconTabObject(oEvent.getSource());
			this.SearchProject_init(controler, container, selectButton, allProject);
		},
		SelectProject_OnProjectDelete: function(oEvent) {
			var btn = oEvent.getSource();
			btn.getParent().unbindElement();
			var projectContext = btn.getParent().getItems();
			projectContext[0].unbindElement();
			projectContext[0].setVisible(false);
			projectContext[1].setVisible(true); // ownIntialButton
			projectContext[2].setVisible(false); // ownRefreshButton
			btn.setVisible(false); // delete Button

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
		SelectProject_OnDailyHrTypeChange2: function(oEvent) {
			var selectedKey = oEvent.getParameter('selectedItem').getKey();
			this.warning = true;
			oEvent.getSource().setPlaceholder("");
			oEvent.getSource().getParent().getParent().getParent().getItems()[2].getItems()[2].getItems()[1].setSelectedKey(selectedKey);
		},
		SelectProject_OnDailyHrTypeChange1: function(oEvent) {
			var selectedKey = oEvent.getParameter('selectedItem').getKey();
			this.warning = true;
			oEvent.getSource().setPlaceholder("");
			oEvent.getSource().getParent().getParent().getParent().getItems()[3].getItems()[2].getItems()[3].setSelectedKey(selectedKey);
		},
		SelectProject_OnOthAllownaceTypeChange: function(oEvent) {
			var selectedKey = oEvent.getParameter('selectedItem').getKey();
			this.warning = true;
			oEvent.getSource().setPlaceholder("");
			oEvent.getSource().getParent().getParent().getParent().getItems()[0].getItems()[0].getItems()[1].setSelectedKey(selectedKey);
		},
		SelectProject_OnOthAllownaceEntryChange: function(oEvent) {
			if (oEvent.getParameters().value.length > 4) {
				var setText = oEvent.getParameters().value.slice(0, 4);
				oEvent.getSource().setValue(setText);
			}
		},
		//////**Add Project Time** ////
		AddProjectTime_init: function(controler, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", controler);
				container.addItem(oFragment);
				oFragment.getItems()[2].getItems()[2].getItems()[1].onAfterRendering = this._comboKeyboardDisable;
				oFragment.getItems()[3].getItems()[2].getItems()[3].onAfterRendering = this._comboKeyboardDisable;
			}

		},
		AddProjectEquipment_init: function(controler, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectEquipment", controler);
				container.addItem(oFragment);

			}

		},
		AddProjectBonus_init: function(controler, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectBonus", controler);
				container.addItem(oFragment);
				oFragment.getItems()[2].getItems()[0].getItems()[0].getItems()[1].onAfterRendering = this._comboKeyboardDisable;
			}

		},
		_comboKeyboardDisable: function() {
			try {
				var elements = document.getElementsByClassName("SelectCombo"); //
				for (var k = 0; k < elements.length; k++) {
					var eleId = elements[k].id + '-inner';
					document.getElementById(eleId).disabled = true; // .get.("tableColumnCombo")
					//	elements[k].disabled = true;
				}
			} catch (err) {

			}
		},
		AddProjectTime_destroy: function(fragmentObject) {
			fragmentObject.destroy(true);
		},
		AddProjectTime_OnTimeDelete: function(oEvent, container) {
			var source = oEvent.getSource();

			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			container.removeItem(sourcePanel);

			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs - currentValue;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			this.AddProjectTime_destroy(sourcePanel);

		},
		AddProjectTime_OnBonusDelete: function(oEvent, container) {
			var source = oEvent.getSource();
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			container.removeItem(sourcePanel);
			sourcePanel.destroy(true);
		},
		AddProjectTime_OnchangeTimeSelection: function(oEvent) {

			//var index = oEvent.getParameter('selectedIndex');
			var buttons = oEvent.getSource().getButtons();
			this.warning = true;
			//var sourceId = button.getId();

			var source = oEvent.getSource();
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var newValue = 0;
			var allDayCombo = this.AddProjectTime_getOwnAllDayComboBox(source);
			var selecthrsCombo = source.getParent().getParent().getParent().getItems()[3]; //this._getOwnSelectedHrContent(source);
			var timepicker = selecthrsCombo.getItems()[2].getItems()[0];
			//	var timepickerFrom = selecthrsCombo.getItems()[2].getItems()[1];
			var timepickerTo = selecthrsCombo.getItems()[2].getItems()[2];
			/*var durationId = '#' + timepicker.getId();
			$(durationId).on('keydown',function(event){
				sap.ui.getCore().byId(timepicker.getId()).fireChange();
			} );*/
			if (oEvent.getParameter("selectedIndex") === 1) {
				//newValue = 0;
				buttons[0].setEnabled(true);
				buttons[1].setEnabled(false);
				allDayCombo.setVisible(false);
				selecthrsCombo.setVisible(true);
				timepicker.setValue("0.00");
				timepickerTo.setEnabled(false);

			} else { // For all day Selection
				allDayCombo.setVisible(true);
				selecthrsCombo.setVisible(false);
				buttons[0].setEnabled(false);
				buttons[1].setEnabled(true);

			}
			// for IE 
			if (sap.ui.Device.browser.name === sap.ui.Device.browser.BROWSER.INTERNET_EXPLORER) {
				var localComboKey = undefined;
				if (selecthrsCombo.getVisible() === true) {
					try {
						var localComboKey = selecthrsCombo.getItems()[2].getItems()[3].getSelectedKey();
					} catch (e) {
						localComboKey = undefined;
					}
					if (localComboKey !== undefined && localComboKey !== null && localComboKey !== "") {
						selecthrsCombo.getItems()[2].getItems()[3].setPlaceholder("");
					}
				} else if (allDayCombo.getVisible() === true) {
					localComboKey = undefined;
					try {
						localComboKey = allDayCombo.getSelectedKey();
					} catch (e) {
						localComboKey = undefined;
					}
					if (localComboKey !== undefined && localComboKey !== null && localComboKey !== "") {
						allDayCombo.setPlaceholder("");
					}
				}
			}
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
			/*jQuery.sap.delayedCall(0, this, function() {
				document.getElementById(sourceId).blur();
				//	that.byId("ProjectCancelButton").focus();
			});*/
		},
		AddProjectTime_OnChangeHours: function(oEvent) {
			var source = oEvent.getSource();
			this.warning = true;
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var newValue = oEvent.getParameter("value");

			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
		},

		AddProjectTime_OnEquipmentChangeQuanity: function(oEvent) {
			var source = oEvent.getSource();
			this.warning = true;
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var newValue = oEvent.getParameter("value");

			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
		},
		AddProjectTime_OnChangeStartTime: function(oEvent) {
			var source = oEvent.getSource();
			this.warning = true;
			var endTimer = source.getParent().getItems()[2];
			endTimer.setEnabled(true);
			var diffTime = 0;

			if (endTimer.getValue() !== null && endTimer.getValue().length > 0) {
				diffTime = datetime.timeToMilliSec(endTimer.getValue()) - datetime.timeToMilliSec(oEvent.getParameter("value"));
			}
			if (diffTime < 0) {
				source.setValueState("Error");
				this.Common_raiseinputError(source, this.i18nModel.getText("timeValidationErrorMsg"));
				return;
			}
			source.setValueState("None");
			endTimer.setValueState("None");
			var dDate = new Date(diffTime);
			var min = dDate.getUTCMinutes();
			if (min < 10) {
				min = '0' + min;
			}
			var duration = dDate.getUTCHours() + ":" + min;

			var newValue = datetime.timeToDecimal(duration);
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
			source.setDateValue(new Date(datetime.timeToMilliSec(oEvent.getParameter("value"))));
			//endTimer.setValue(source.getValue());

		},
		AddProjectTime_OnChangeEndTime: function(oEvent) {
			var source = oEvent.getSource();
			var startTimer = source.getParent().getItems()[1];
			this.warning = true;
			//	var milliSecond = datetime.timeToMilliSec(oEvent.getParameter("value"));
			var diffTime = datetime.timeToMilliSec(oEvent.getParameter("value")) - datetime.timeToMilliSec(startTimer.getValue());
			if (diffTime < 0) {
				source.setValueState("Error");
				this.Common_raiseinputError(source, this.i18nModel.getText("timeValidationErrorMsg"));
				return;
			}
			source.setValueState("None");
			startTimer.setValueState("None");
			var dDate = new Date(diffTime);
			var min = dDate.getUTCMinutes();
			if (min < 10) {
				min = '0' + min;
			}
			var duration = dDate.getUTCHours() + ":" + min;
			var newValue = datetime.timeToDecimal(duration);
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
			source.setDateValue(new Date(datetime.timeToMilliSec(oEvent.getParameter("value"))));

		},
		AddProjectTime__getOwnFrameObject: function(source) {
			var parent = source.getParent();

			while (parent.getCustomData().length === 0) {
				parent = parent.getParent();
			}
			return parent;
		},
		AddKMTime__getOwnFrameObject: function(source) {
			var parent = source.getParent();

			while (parent.getCustomData().length === 0) {
				parent = parent.getParent();
			}
			return parent;
		},
		AddProjectTime_handleDailyHrsTypeLoadItems: function(oEvent) {
			oEvent.getSource().getBinding("items").resume();
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
		AddKM_init: function(controler, container, addnew) {

			var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddKM", controler);
			container.addItem(oFragment);
			oFragment.getItems()[3].onAfterRendering = this._comboKeyboardDisable;

			if (addnew) {
				var oFragment2 = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddKM", controler);
				container.addItem(oFragment2);
				oFragment2.getItems()[3].onAfterRendering = this._comboKeyboardDisable;
			}

		},
		AddKM_handleKMTypeLoadItems: function(oEvent) {
			oEvent.getSource().getBinding("items").resume();
		},
		AddKM_OnChangeKMHours: function(oEvent) {
			var source = oEvent.getSource();
			this.warning = true;
			var sourcePanel = this.AddKMTime__getOwnFrameObject(source);
			var newValue = oEvent.getParameter("value");
			sourcePanel.getCustomData()[0].setValue(newValue);

		},
		AddKM_OnChangeStartTimeKM: function(oEvent) {
			/*var source = oEvent.getSource();
			this.warning = true;
			var endTimer = source.getParent().getParent().getItems()[1].getItems()[1];
			endTimer.setEnabled(true);
			var diffTime = 0;

			if (endTimer.getValue() !== null && endTimer.getValue().length > 0) {
				diffTime = datetime.timeToMilliSec(oEvent.getParameter("value")) - datetime.timeToMilliSec(endTimer.getValue());
			}
			if (diffTime > 0) {
				source.setValueState("Error");
				this.Common_raiseinputError(source, this.i18nModel.getText("timeValidationErrorMsg"));
				return;
			}
			source.setValueState("None");
			endTimer.setValueState("None");*/

			////
			var source = oEvent.getSource();
			this.warning = true;
			var endTimer = source.getParent().getItems()[2];
			endTimer.setEnabled(true);
			var diffTime = 0;

			if (endTimer.getValue() !== null && endTimer.getValue().length > 0) {
				diffTime = datetime.timeToMilliSec(endTimer.getValue()) - datetime.timeToMilliSec(oEvent.getParameter("value"));
			}
			if (diffTime < 0) {
				source.setValueState("Error");
				this.Common_raiseinputError(source, this.i18nModel.getText("timeValidationErrorMsg"));
				return;
			}
			source.setValueState("None");
			endTimer.setValueState("None");
			var dDate = new Date(diffTime);
			var min = dDate.getUTCMinutes();
			if (min < 10) {
				min = '0' + min;
			}
			var duration = dDate.getUTCHours() + ":" + min;

			var newValue = datetime.timeToDecimal(duration);
			var sourcePanel = this.AddKMTime__getOwnFrameObject(source);
			sourcePanel.getCustomData()[0].setValue(newValue);
			source.setDateValue(new Date(datetime.timeToMilliSec(oEvent.getParameter("value"))));

		},
		AddKM_OnChangeEndTimeKM: function(oEvent) {
			/*this.warning = true;
			var source = oEvent.getSource();
			var startTimer = source.getParent().getParent().getItems()[0].getItems()[1];

			//	var milliSecond = datetime.timeToMilliSec(oEvent.getParameter("value"));
			var diffTime = datetime.timeToMilliSec(oEvent.getParameter("value")) - datetime.timeToMilliSec(startTimer.getValue());
			if (diffTime < 0) {
				source.setValueState("Error");
				this.Common_raiseinputError(source, this.i18nModel.getText("timeValidationErrorMsg"));
				return;
			}
			source.setValueState("None");
			startTimer.setValueState("None");*/
			/////
			var source = oEvent.getSource();
			var startTimer = source.getParent().getItems()[1];
			this.warning = true;
			//	var milliSecond = datetime.timeToMilliSec(oEvent.getParameter("value"));
			var diffTime = datetime.timeToMilliSec(oEvent.getParameter("value")) - datetime.timeToMilliSec(startTimer.getValue());
			if (diffTime < 0) {
				source.setValueState("Error");
				this.Common_raiseinputError(source, this.i18nModel.getText("timeValidationErrorMsg"));
				return;
			}
			source.setValueState("None");
			startTimer.setValueState("None");
			var dDate = new Date(diffTime);
			var min = dDate.getUTCMinutes();
			if (min < 10) {
				min = '0' + min;
			}
			var duration = dDate.getUTCHours() + ":" + min;
			var newValue = datetime.timeToDecimal(duration);
			var sourcePanel = this.AddKMTime__getOwnFrameObject(source);
			sourcePanel.getCustomData()[0].setValue(newValue);
			source.setDateValue(new Date(datetime.timeToMilliSec(oEvent.getParameter("value"))));

		},
		AddUpdatetime_onSelectAbsenceStartDate: function(oEvent, view) {
			var startDate = oEvent.getSource();
			var NoofHrs = view.byId('NoofHrs');
			var endDate = view.byId('AbsEndDate');
			var dayType = view.byId('dayType');
			// To set the default end date
			this.AddUpdatetime_updateView(startDate, NoofHrs, endDate, dayType, 'start');
			/*if (endDate.getDateValue() === null || endDate.getDateValue() === undefined) {
				endDate.setDateValue(startDate.getDateValue());
			}
			this.warning = true;
			if (!(endDate.getDateValue() instanceof Date) || startDate.getDateValue().getTime() < endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(false);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(false);
					dayType.getButtons()[2].setEnabled(false);
				}
			} else if (startDate.getDateValue().getTime() === endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(true);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(true);
					dayType.getButtons()[2].setEnabled(true);
				}
			} else {
				startDate.setValueState("Error");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(false);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(false);
					dayType.getButtons()[2].setEnabled(false);
				}
				this.Common_raiseinputError(startDate, this.i18nModel.getText("dateValidationErrorMsg"));
				return;
			}*/
		},
		AddUpdatetime_updateView: function(startDate, NoofHrs, endDate, dayType, type) {

			if (endDate.getDateValue() === null && startDate.getDateValue() === null) {
				return;
			}
			// To set the default end date
			else if (endDate.getDateValue() === null) {
				endDate.setDateValue(startDate.getDateValue());
			} else if (startDate.getDateValue() === null) {
				startDate.setDateValue(endDate.getDateValue());
			}
			this.warning = true;
			if (startDate.getDateValue().getTime() < endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(false);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(false);
					dayType.getButtons()[2].setEnabled(false);
				}
			} else if (startDate.getDateValue().getTime() === endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(true);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(true);
					dayType.getButtons()[2].setEnabled(true);
				}
			} else {
				if (type === 'start') {
					startDate.setValueState("Error");
					this.Common_raiseinputError(startDate, this.i18nModel.getText("dateValidationErrorMsg"));
				} else if (type === 'end') {
					endDate.setValueState("Error");
					this.Common_raiseinputError(endDate, this.i18nModel.getText("dateValidationErrorMsg"));
				}
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(false);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(false);
					dayType.getButtons()[2].setEnabled(false);
				}

				return;
			}
		},
		AddUpdatetime_onSelectAbsenceEndDate: function(oEvent, view) {
			var startDate = view.byId('AbsStartDate');
			var NoofHrs = view.byId('NoofHrs');
			var dayType = view.byId('dayType');
			NoofHrs.setEnabled(false);
			NoofHrs.setValue("");
			var endDate = oEvent.getSource();
			this.AddUpdatetime_updateView(startDate, NoofHrs, endDate, dayType, 'start');

			/*this.warning = true;
			// To set the default Start date
			if (startDate.getDateValue() === null || startDate.getDateValue() === undefined) {
				startDate.setDateValue(endDate.getDateValue());
			}
			if (!(startDate.getDateValue() instanceof Date) || startDate.getDateValue().getTime() < endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(false);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(false);
					dayType.getButtons()[2].setEnabled(false);
				}
			} else if (startDate.getDateValue().getTime() === endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(true);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(true);
					dayType.getButtons()[2].setEnabled(true);
				}
			} else {
				endDate.setValueState("Error");
				if (NoofHrs.getVisible() === true) {
					NoofHrs.setEnabled(false);
					NoofHrs.setValue("");
				}
				if (dayType.getVisible() === true) {
					dayType.setSelectedIndex(0);
					dayType.getButtons()[1].setEnabled(false);
					dayType.getButtons()[2].setEnabled(false);
				}
				this.Common_raiseinputError(endDate, this.i18nModel.getText("dateValidationErrorMsg"));
				return;
			}*/
		},

		//////**Add Update Time** ////
		AddUpdatetime_init: function(controler, container, type, i18nModel, employees, odataModel, updateKeyPath, isEquipment) {
			if (isEquipment === "Equipment") {
				this.equipment = true;
			} else {
				this.equipment = false;
			}
			var thatPtr = controler;
			this.type = type;
			var odata = null;
			var userPrefModel = controler.getModel('userPreference');
			this.userPrefModel = userPrefModel;

			if (this.equipment) {
				odata = {
					totalhrs: 0,
					visibleHrs: false, //userPrefModel.getProperty('/defaultHours'),
					visibleDailyAllow: false,
					visibleBonus: false,
					visibleKM: false,
					visibleAbsence: false,
					//visibleAbsence: true,
					visibleAbsence1: false,
					visibleAbsence2: false,
					visibleAbsence3: false,
					visibleEquipment: true, //userPrefModel.getProperty('/defaultEquipment'),
					visibleSummary: false,
					visibleProjectOptional: false,
					newTime: true,
					newBonus: true,
					duration: userPrefModel.getProperty('/durationFlag')
				};
			} else {
				odata = {
					totalhrs: 0,
					visibleHrs: true, //userPrefModel.getProperty('/defaultHours'),
					visibleDailyAllow: userPrefModel.getProperty('/defaultIPD'),
					visibleBonus: userPrefModel.getProperty('/defaultBonus'),
					visibleKM: userPrefModel.getProperty('/defaultKM'),
					visibleAbsence: userPrefModel.getProperty('/defaultAbsence'),
					//visibleAbsence: true,
					visibleAbsence1: true,
					visibleAbsence2: false,
					visibleAbsence3: false,
					visibleEquipment: false, //userPrefModel.getProperty('/defaultEquipment'),
					visibleSummary: false,
					visibleProjectOptional: false,
					newTime: true,
					newBonus: true,
					duration: userPrefModel.getProperty('/durationFlag')
				};
			}

			var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddUpdateTime", controler);
			this.AddProjectTime_init(controler, controler.getView().byId('addTimeTab').getItems()[0], true); // initialse with single hour
			if (this.equipment) {
				this.AddProjectEquipment_init(controler, controler.getView().byId('addEquipmentTab').getItems()[0], true); // initialse with single hour
			}

			//this.AddProjectBonus_init(controler, controler.getView().byId('addBonusTab').getItems()[0], true)

			var footerData;
			this.warning = false;
			this.currentView = 'hours';
			//this.AddKM_init(controler, controler.getView().byId('addKM').getItems()[0], odata.newTime);
			var items = container.getItems();
			if (items.length > 0) {
				items[0].setVisible(false);
			}
			container.addItem(oFragment);
			controler.getView().byId('AllowanceZoneType').onAfterRendering = this._comboKeyboardDisable;
			controler.getView().byId('AbsCat').onAfterRendering = this._comboKeyboardDisable;
			this.oDataModel = odataModel;
			this.employees = employees;

			if (type === 'New') {

				this.warning = false;
				this.currentView = 'hours';

				footerData = {
					MainNewScreen: true,
					MainUpdateScreen: false,
					ProjectScreen: false,
					MainPreviousScreen: false
				};

			} else if (type === 'Update') {

				odata.newTime = false;
				odata.newBonus = false;
				odata.visibleHrs = false;
				odata.visibleBonus = false;
				odata.visibleDailyAllow = false;
				odata.visibleKM = false;
				odata.visibleAbsence = false;
				odata.visibleEquipment = false;

				footerData = {
					MainNewScreen: false,
					MainUpdateScreen: true,
					ProjectScreen: false,
					MainPreviousScreen: false
				};
				var updateType = odataModel.getProperty(updateKeyPath).EntryType;
				oFragment.bindElement(updateKeyPath);
				switch (updateType) {
					case 'HOURS':
						odata.visibleHrs = true;

						var source = controler.getView().byId('addTimeTab').getItems()[0].getItems()[1].getItems()[2].getItems()[2].getItems()[0];
						var buttons = source.getButtons();
						var allDayCombo = this.AddProjectTime_getOwnAllDayComboBox(source);
						var selecthrsCombo = source.getParent().getParent().getParent().getItems()[3];

						var projectView = controler.getView().byId('addTimeTab').getItems()[0].getItems()[1].getItems()[2].getItems()[1];
						var projectContext = "/ProjectSet(ProjectId='" + odataModel.getProperty(updateKeyPath).ProjectID + "',ApplicationName='TEAMLEAD')";
						projectView.bindElement(projectContext);

						buttons[0].setEnabled(true);
						buttons[1].setEnabled(false);
						allDayCombo.setVisible(false);
						selecthrsCombo.setVisible(true);

						allDayCombo.setPlaceholder("");
						selecthrsCombo.getItems()[2].getItems()[3].setPlaceholder("");
						break;
					case 'IPD':
						odata.visibleDailyAllow = true;
						controler.getView().byId('AllowanceZoneType').getBinding("items").resume();
						var projectId = odataModel.getProperty(updateKeyPath).ProjectID;
						var projectView = controler.getView().byId('addAllowance').getItems()[0].getItems()[1].getItems()[1];
						if (projectId !== null && projectId !== '' && projectId !== undefined) {
							var projectContext = "/ProjectSet(ProjectId='" + projectId + "',ApplicationName='TEAMLEAD')";
							projectView.bindElement(projectContext);
						} else if (projectId === '') {
							projectView.getItems()[0].setText("");
						}
						controler.getView().byId('AllowanceZoneType').setPlaceholder("");
						var arrParams = [];
						var urlStr = "/ValueHelpSet";
						arrParams.push(new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD"));
						arrParams.push(new Filter("HelpType", FilterOperator.EQ, "ZN"));
						controler.getOwnerComponent().getModel().read(urlStr, {
							filters: arrParams,
							success: function(data) {
								for (var count = 0; count < data.results.length; count++) {
									if (data.results[count].FieldDescription === controler.getView().byId('AllowanceZoneType').getSelectedKey()) {
										if (data.results[count].FieldAdditionalValue === "GD") {
											thatPtr.getView().byId("AllowanceMealIndicator").setVisible(false);
											thatPtr.getView().byId("AllowanceTransportIndicator").setVisible(false);
											thatPtr.getView().byId("AllowanceTravelIndicator").setVisible(false);
											thatPtr.getView().byId("AllowanceMealIndicator").setPressed(false);
											thatPtr.getView().byId("AllowanceTransportIndicator").setPressed(false);
											thatPtr.getView().byId("AllowanceTravelIndicator").setPressed(false);
										} else {
											thatPtr.getView().byId("AllowanceMealIndicator").setVisible(true);
											thatPtr.getView().byId("AllowanceTransportIndicator").setVisible(true);
											thatPtr.getView().byId("AllowanceTravelIndicator").setVisible(true);
										}
										break;
									}
								}
							},
							error: function(error) {
								//sap.m.MessageToast.show("Failed");
							}
						});
						break;
					case 'KM':
						odata.visibleKM = true;
						controler.getView().byId('addKM').getItems()[0].getItems()[2].getItems()[2].getItems()[4].getBinding("items").resume();

						var projectView = controler.getView().byId('addKM').getItems()[0].getItems()[1];
						var projectContext = "/ProjectSet(ProjectId='" + odataModel.getProperty(updateKeyPath).ProjectID +
							"',ApplicationName='TEAMLEAD')";
						projectView.bindElement(projectContext);

						controler.getView().byId('addKM').getItems()[0].getItems()[3].setVisible(false);
						controler.getView().byId('addKM').getItems()[0].getItems()[2].getItems()[2].getItems()[4].setPlaceholder("");
						break;
					case 'ABSENCE':
						odata.visibleAbsence = true;
						break;
					case 'PREMIUM':
						odata.visibleBonus = true;
						//Add the Fragment
						var containerbns = controler.getView().byId("addBonusTab").getItems()[0];
						var header2 = containerbns.getItems()[0];
						containerbns.removeAllItems();
						containerbns.insertItem(header2);
						var oFragmentbns = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectBonus", controler);
						oFragmentbns.bindElement(updateKeyPath);
						containerbns.addItem(oFragmentbns);
						oFragmentbns.getItems()[2].getItems()[0].getItems()[1].getItems()[1].onAfterRendering = this._comboKeyboardDisable;
						// Display the Update details
						containerbns.getItems()[0].getItems()[0].setVisible(false);
						var selectbnsCombo = controler.getView().byId('addBonusTab').getItems()[0].getItems()[1].getItems()[2].getItems()[0].getItems()[0]
							.getItems()[1];
						var selectbnsInput = controler.getView().byId('addBonusTab').getItems()[0].getItems()[1].getItems()[2].getItems()[0].getItems()[1]
							.getItems()[1];
						projectView = controler.getView().byId('addBonusTab').getItems()[0].getItems()[1].getItems()[2].getItems()[2];
						projectContext = "/ProjectSet(ProjectId='" + odataModel.getProperty(updateKeyPath).ProjectID + "',ApplicationName='TEAMLEAD')";
						projectView.bindElement(projectContext);
						selectbnsCombo.getBinding("items").resume();
						var localHours = formatter.getNumber(odataModel.getProperty(updateKeyPath).Hours);
						selectbnsInput.setValue(localHours);
						selectbnsCombo.setPlaceholder("");
						break;
					case 'Equipment':
						odata.visibleEquipment = true;
				}

			}

			var oModel = new JSONModel(odata);
			oModel.setDefaultBindingMode("OneWay");
			this.AddUpdatetimeModel = oModel;

			var projectdata = {
				worklistTableTitle: i18nModel.getText("projectSearchHeader")
			};

			this.i18nModel = i18nModel;

			var oProjectModel = new JSONModel(projectdata);
			this.projectModel = oProjectModel;

			var oFooterModel = new JSONModel(footerData);
			this.footerModel = oFooterModel;

			var empsData = [];
			for (var l = 0; l < this.employees.length; l++) {
				var empData = {
					empId: this.employees[l].employee,
					empName: this.employees[l].employeeName
				};
				empsData.push(empData);
			}
			if (empsData.length > 1) {
				var empData2 = {
					empId: 'ALL',
					empName: i18nModel.getText("all")
				};
				empsData.push(empData2);
			}
			var oEmpsModel = new JSONModel(empsData);
			this.oEmpsModel = oEmpsModel;

			var oModelData = {
				AddTime: oModel,
				projectSearch: oProjectModel,
				footer: oFooterModel,
				Emps: oEmpsModel
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
		AddUpdatetime_OnTabSelected: function(oEvent, oView, controler) {
			var key = oEvent.getParameter('key');
			var source = oEvent.getSource();
			var that = this;
			if (this.warning) {

				MessageBox.confirm(this.i18nModel.getText("maskEntryWarningMsg"), {
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that.currentView = key;
							that.warning = false;
						}
						if (oAction === sap.m.MessageBox.Action.CANCEL) {
							source.setSelectedKey(that.currentView);
							that.warning = true;
						}
					}
				});

			} else {
				this.currentView = key;
				this.warning = false;
			}

			if (key === 'allowance') {
				//this.AddUpdatetimeModel.setProperty('/visibleProjectOptional', true);
				oView.byId('AllowanceZoneType').setSelectedKey(null);
				oView.byId('AllowanceMealIndicator').setPressed(false);
				oView.byId('AllowanceTransportIndicator').setPressed(false);
				oView.byId('AllowanceTravelIndicator').setPressed(false);

				oView.byId('AllowanceProject').getItems()[1].getItems()[0].unbindElement();
				oView.byId('AllowanceProject').getItems()[1].getItems()[0].setVisible(false); // Label
				oView.byId('AllowanceProject').getItems()[1].getItems()[1].setVisible(true); // ownIntialButton
				oView.byId('AllowanceProject').getItems()[1].getItems()[2].setVisible(false);
				oView.byId('AllowanceProject').getItems()[1].getItems()[3].setVisible(false);
				if (oView.byId('AllowanceZoneType').getSelectedKey() === "GD" || oView.byId('AllowanceZoneType').getSelectedKey() === '') {
					oView.byId("AllowanceMealIndicator").setVisible(false);
					oView.byId("AllowanceTransportIndicator").setVisible(false);
					oView.byId("AllowanceTravelIndicator").setVisible(false);
					oView.byId("AllowanceMealIndicator").setPressed(false);
					oView.byId("AllowanceTransportIndicator").setPressed(false);
					oView.byId("AllowanceTravelIndicator").setPressed(false);
				} else {
					oView.byId("AllowanceMealIndicator").setVisible(true);
					oView.byId("AllowanceTransportIndicator").setVisible(true);
					oView.byId("AllowanceTravelIndicator").setVisible(true);
				}

			}
			/*else {
				this.AddUpdatetimeModel.setProperty('/visibleProjectOptional', false);
			}*/
			else if (key === 'absence') {
				if (this.oEmpsModel.getData().length === 1) {
					oView.byId('AbsEmployee').setEnabled(false);
				} else {
					oView.byId('AbsEmployee').setEnabled(true);
				}

				oView.byId('AbsCat').setSelectedKey(null);
				oView.byId('AbsStartDate').setValue(null);
				oView.byId('AbsEndDate').setValue(null);
				oView.byId('NoofHrs').setValue(null);
				oView.byId('AbsComment').setValue(null);
			} else if (key === 'hours') {
				var header = oView.byId('addTimeTab').getItems()[0].getItems()[0];
				oView.getModel('AddTime').setProperty('/totalhrs', 0);
				oView.byId('addTimeTab').getItems()[0].removeAllItems();
				oView.byId('addTimeTab').getItems()[0].insertItem(header);
				var addNew = this.AddUpdatetimeModel.getData().newTime;
				this.AddProjectTime_init(controler, oView.byId('addTimeTab').getItems()[0], addNew);
			} else if (key === 'bonus') {
				//	if(oView.byId("addBonusTab").getItems()[0].getItems().length === 1) {
				var container = oView.byId("addBonusTab").getItems()[0];
				var header2 = container.getItems()[0];
				container.removeAllItems();
				container.insertItem(header2);
				var oFragment = sap.ui.xmlfragment(oView.getId(), "com.vinci.timesheet.admin.view.AddProjectBonus", controler);
				container.addItem(oFragment);
				oFragment.getItems()[2].getItems()[0].getItems()[0].getItems()[1].onAfterRendering = this._comboKeyboardDisable;
				//	}
			} else if (key === 'KM') {
				// project refresh
				oView.byId('addKM').getItems()[0].getItems()[1].getItems()[0].unbindElement();
				oView.byId('addKM').getItems()[0].getItems()[1].getItems()[0].setVisible(false); // Label
				oView.byId('addKM').getItems()[0].getItems()[1].getItems()[1].setVisible(true); // ownIntialButton
				oView.byId('addKM').getItems()[0].getItems()[1].getItems()[2].setVisible(false);

				for (var i = 2; i < oView.byId('addKM').getItems()[0].getItems().length; i++) {
					var kmContainer = oView.byId('addKM').getItems()[0].getItems()[i];
					kmContainer.getItems()[2].getItems()[0].setValue(0);
					kmContainer.getItems()[2].getItems()[1].setValue(null);
					kmContainer.getItems()[2].getItems()[2].setValue(null);
					kmContainer.getItems()[2].getItems()[3].setValue(null);
					kmContainer.getItems()[2].getItems()[4].setSelectedKey(null);
				}

			}
		},
		AddUpdatetime_onAllowanceIndicator: function(oEvent) {
			this.warning = true;

		},
		AddUpdatetime_OnaddNewHourPress: function(controller) {
			var addNew = this.AddUpdatetimeModel.getData().newTime;
			this.AddProjectTime_init(controller, controller.getView().byId('addTimeTab').getItems()[0], addNew);
		},
		AddUpdatetime_OnaddNewEquipmentPress: function(controller) {
			var addNew = this.AddUpdatetimeModel.getData().newTime;
			this.AddProjectEquipment_init(controller, controller.getView().byId('addEquipmentTab').getItems()[0], addNew);
		},
		AddUpdatetime_OnaddNewBonusPress: function(controller) {
			var addNew = this.AddUpdatetimeModel.getData().newBonus;
			this.AddProjectBonus_init(controller, controller.getView().byId('addBonusTab').getItems()[0], addNew);
		},
		AddUpdatetime_getOwnIconTabObject: function(source) {
			var parent = source.getParent();
			while (parent.getMetadata().getName() !== 'sap.m.IconTabFilter') {
				parent = parent.getParent();
			}
			return parent.getContent()[0];
		},
		AddUpdatetime_handleAllowanceZoneTypeLoadItems: function(oEvent) {
			oEvent.getSource().getBinding("items").resume();
		},
		AddUpdatetime_onAllowanceIndicatorData: function(oEvent, that) {
			var selectedIPD = oEvent.getSource().getSelectedItem().getAdditionalText();
			if (selectedIPD === "GD") {
				that.getView().byId("AllowanceMealIndicator").setVisible(false);
				that.getView().byId("AllowanceTransportIndicator").setVisible(false);
				that.getView().byId("AllowanceTravelIndicator").setVisible(false);
				that.getView().byId("AllowanceMealIndicator").setPressed(false);
				that.getView().byId("AllowanceTransportIndicator").setPressed(false);
				that.getView().byId("AllowanceTravelIndicator").setPressed(false);
			} else {
				that.getView().byId("AllowanceMealIndicator").setVisible(true);
				that.getView().byId("AllowanceTransportIndicator").setVisible(true);
				that.getView().byId("AllowanceTravelIndicator").setVisible(true);
			}
		},
		AddUpdatetime_handleAbsTypeLoadItems: function(oEvent) {
			oEvent.getSource().getBinding("items").resume();
		},
		AddUpdateTime_onAbsenceCatChange: function(oEvent, AddUpdatetimeModel, view) {
			var absCat = oEvent.getSource().getSelectedItem();
			var absViewType = absCat.getAdditionalText();
			switch (absViewType) {
				case 'J':
					AddUpdatetimeModel.setProperty("/visibleAbsence1", true);
					AddUpdatetimeModel.setProperty("/visibleAbsence2", false);
					AddUpdatetimeModel.setProperty("/visibleAbsence3", false);
					break;
				case 'D':
					AddUpdatetimeModel.setProperty("/visibleAbsence1", false);
					AddUpdatetimeModel.setProperty("/visibleAbsence2", true);
					AddUpdatetimeModel.setProperty("/visibleAbsence3", false);
					break;
				case 'H':
					AddUpdatetimeModel.setProperty("/visibleAbsence1", false);
					AddUpdatetimeModel.setProperty("/visibleAbsence2", false);
					AddUpdatetimeModel.setProperty("/visibleAbsence3", true);
					break;
				default:

			}
			var startDate = view.byId('AbsStartDate');;
			var NoofHrs = view.byId('NoofHrs');
			var endDate = view.byId('AbsEndDate');
			var dayType = view.byId('dayType');
			// To set the default end date
			this.AddUpdatetime_updateView(startDate, NoofHrs, endDate, dayType);
		},
		AddUpdatetime_updateEntries: function(oView, savepostFuction, ctype, rButton, bindingPath) {
			rButton.setEnabled(false);
			this.employees[0].Days = [];
			this.employees[0].Days.push(oView.getModel().getProperty(bindingPath).WorkDate);
			var selectedTab = oView.byId('idIconTabBarMulti').getSelectedKey();
			var workDayItem;
			if (selectedTab === 'hours') {
				var tab = oView.byId('addTimeTab').getItems()[0].getItems()[1];
				var startTime = '00:00';
				var endTime = '00:00';
				var projectID;
				try {

					var hrType = tab.getItems()[2].getItems()[2].getItems()[1].getSelectedKey();
					var projectBindingPath = tab.getItems()[2].getItems()[1].getItems()[0].getBindingContext().getPath();
					var fullDayindex = tab.getItems()[2].getItems()[2].getItems()[0].getSelectedIndex();
					if (this.AddUpdatetimeModel.getData().duration) {
						startTime = tab.getItems()[3].getItems()[2].getItems()[1].getValue();
						endTime = tab.getItems()[3].getItems()[2].getItems()[2].getValue();

					}
					var fullDay = false;
					if (fullDayindex === 0) {
						fullDay = true;
					}
					projectID = oView.getModel().getProperty(projectBindingPath).ProjectId;
				} catch (err) {

					//MessageBox.alert("All Items are not selected");
					MessageBox.alert(this.i18nModel.getText("allItemsAreNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					return;

				}

				workDayItem = {
					"ProjectID": projectID,
					"EntryType": "HOURS",
					"Hours": tab.getCustomData()[0].getValue().toString(),
					"EntryTypeCatId": hrType,
					"StartTime": startTime,
					"EndTime": endTime,
					"FullDay": fullDay

				};
			} else if (selectedTab === 'allowance') {
				var meal = oView.byId('AllowanceMealIndicator').getPressed();
				var transport = oView.byId('AllowanceTransportIndicator').getPressed();
				var travel = oView.byId('AllowanceTravelIndicator').getPressed();
				//if (meal || transport || travel) {
				var zonetype = oView.byId('AllowanceZoneType').getSelectedKey();
				var zoneName = oView.byId('AllowanceZoneType').getValue();
				if (zoneName === undefined || zoneName === "" || zoneName === null) {
					//MessageBox.alert("Zone type is not selected");
					MessageBox.alert(this.i18nModel.getText("zoneTypeIsNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					return;
				}
				var allwProjectID = null;
				try {
					var allwProject = oView.byId('AllowanceProject').getItems()[1].getItems()[0].getBindingContext().getPath();
					allwProjectID = oView.getModel().getProperty(allwProject).ProjectId;
				} catch (err) {
					allwProjectID = "";
				}
				if (allwProjectID === undefined || allwProjectID === null) {
					allwProjectID = "";
				}
				workDayItem = {
					"ProjectID": allwProjectID,
					"EntryType": "IPD",
					"ZoneType": zonetype,
					"ZoneName": zoneName,
					"MealIndicator": meal,
					"JourneyIndicator": transport,
					"TransportIndicator": travel

				};
			} else if (selectedTab === 'bonus') {
				var bnstab = oView.byId('addBonusTab').getItems()[0].getItems()[1];
				var bnsType = bnstab.getItems()[2].getItems()[0].getItems()[0].getItems()[1].getSelectedKey();
				var bnsDesc = bnstab.getItems()[2].getItems()[0].getItems()[0].getItems()[1]._getSelectedItemText();
				var bnsQty = bnstab.getItems()[2].getItems()[0].getItems()[1].getItems()[1].getValue();
				var bnsProjectBindingPath = bnstab.getItems()[2].getItems()[2].getItems()[0].getBindingContext().getPath();
				var bnsProjectID = oView.getModel().getProperty(bnsProjectBindingPath).ProjectId;
				workDayItem = {
					"ProjectID": bnsProjectID,
					"Hours": bnsQty.toString(),
					"EntryTypeCatId": bnsType,
					"AllowancesName": bnsDesc
				};
			} else if (selectedTab === 'KM') {
				var kmtab = oView.byId('addKM').getItems()[0].getItems()[2];
				var startTime = '000000';
				var endTime = '000000';
				if (this.AddUpdatetimeModel.getData().duration) {
					startTime = kmtab.getItems()[2].getItems()[1].getValue();
					endTime = kmtab.getItems()[2].getItems()[2].getValue();
				}
				var KMNumber = kmtab.getItems()[2].getItems()[3].getValue();
				var kmhrType = kmtab.getItems()[2].getItems()[4].getSelectedKey();
				var kmprojectBindingPath = oView.byId('addKM').getItems()[0].getItems()[1].getItems()[0].getBindingContext().getPath();
				var kmprojectID = oView.getModel().getProperty(kmprojectBindingPath).ProjectId;

				workDayItem = {
					"ProjectID": kmprojectID,
					"Hours": kmtab.data('hrs').toString(),
					"EntryTypeCatId": kmhrType,
					"KMNumber": KMNumber,
					"StartTime": startTime,
					"EndTime": endTime
				};

			}

			///Update Model

			var that = this;

			ctype.setBusy(true);
			this.oDataModel.update(bindingPath, workDayItem, {
				success: function() {
					ctype.setBusy(false);
					rButton.setEnabled(true);
					savepostFuction(that);
					that.refresh_workdaySet(that.employees, oView);
				},
				error: function() {
					ctype.setBusy(false);
					rButton.setEnabled(true);
				}
			});

		},
		AddUpdatetime_saveEntries: function(oView, savepostFuction, ctype, rButton) {
			/// Get Item Data from view for Daily hour
			//ctype.setBusy(true);
			rButton.setEnabled(false);
			var selectedTab = oView.byId('idIconTabBarMulti').getSelectedKey();
			var workDayItems = [];
			if (selectedTab === 'Equipment') {
				var data = {
					"UserId": oView.getModel('userPreference').getProperty("/userID"),
					"ProcessingMode": "C",
					"NavEquipmentAction": []
				};
				for (var l = 0; l < this.employees.length; l++) {
					var empId = this.employees[l].employee;
					for (var j = 0; j < this.employees[l].Days.length; j++) {
						var tab = oView.byId('addEquipmentTab').getItems()[0].getItems();
						for (var k = 1; k < tab.length; k++) {
							var projectID = undefined;
							//var filledHrs = tab[k].getItems()[2].getItems()[2].getItems()[1].getSelectedKey();
							var projectBindingPath = tab[k].getItems()[2].getItems()[1].getItems()[0].getBindingContext().getPath();
							//var fullDayindex = tab[k].getItems()[2].getItems()[2].getItems()[0].getSelectedIndex();
							projectID = oView.getModel().getProperty(projectBindingPath).ProjectId;
							if (projectID === undefined) {
								MessageBox.alert(this.i18nModel.getText("projectNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
							var localHours = tab[k].getCustomData()[0].getValue();
							if (localHours !== null && localHours !== undefined) {
								var localHoursText = localHours.toString();
							} else {
								localHoursText = localHours;
							}
							if (localHoursText === null || localHoursText === undefined || localHoursText === "0") {
								MessageBox.alert(this.i18nModel.getText("noOfQuantityNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
							var workDayItem = {
								"EquipmentId": empId,
								"ProjectID": projectID,
								"WorkDate": this.employees[l].Days[j],
								"FilledHours": localHoursText,
								"ApplicationName": "TEAMLEAD"
							};
							data.NavEquipmentAction.push(workDayItem);
						}
					}
				}
				var that = this;
				ctype.setBusy(true);
				this.oDataModel.create("/EquipmentActionSet", data, {
					success: function() {
						ctype.setBusy(false);
						rButton.setEnabled(true);
						savepostFuction(that);
						oView.getModel().refresh();
						//that.refresh_workdaySetforAdd(that.employees, oView);
					},
					error: function() {
						ctype.setBusy(false);
						rButton.setEnabled(true);
					}
				});
				return;
			}

			data = {
				"EmployeeId": this.employees[0].employee,
				"WorkDate": this.employees[0].Days[0],
				"ApplicationName": oView.getModel('userPreference').getProperty("/application"),
				"Status": null,
				"NavWorkDayTimeItems": []
			};

			//// Absence ///
			if (selectedTab === 'absence') {
				data.Status = 'ABSCENCE';
				var empId = oView.byId('AbsEmployee').getSelectedKey();
				var absType = oView.byId('AbsCat').getSelectedKey();
				if (absType === '' || absType === null || absType === undefined) {
					MessageBox.alert(this.i18nModel.getText("absenceCatNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					return;
				}
				var startDate = oView.byId('AbsStartDate').getDateValue();
				if (startDate === '' || startDate === null || startDate === undefined) {
					MessageBox.alert(this.i18nModel.getText("startTimeNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					return;
				}
				var endDate = oView.byId('AbsEndDate').getDateValue();
				if (endDate === '' || endDate === null || endDate === undefined) {
					MessageBox.alert(this.i18nModel.getText("endTimeNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					return;
				}
				var Comments = oView.byId('AbsComment').getValue();
				var dayType = null,
					localDayType = null;
				var noOfHrs = null;
				try {
					if (oView.byId('dayType').getVisible() === true) {
						dayType = oView.byId('dayType').getSelectedIndex().toString();
						if (dayType === '' || dayType === null || dayType === undefined) {
							MessageBox.alert(this.i18nModel.getText("dayTypeNotSelected"));
							ctype.setBusy(false);
							rButton.setEnabled(true);
							return;
						} else {
							if (dayType === '0') {
								localDayType = 'FULL';
							} else if (dayType === '1') {
								localDayType = 'AM';
							} else if (dayType === '2') {
								localDayType = 'PM';
							}
						}
					}
				} catch (err) {}
				try {
					if (oView.byId('NoofHrs').getVisible() === true && oView.byId('NoofHrs').getEnabled() === true) {
						noOfHrs = oView.byId('NoofHrs').getValue().toString();
						if (noOfHrs === '' || noOfHrs === null || noOfHrs === undefined) {
							MessageBox.alert(this.i18nModel.getText("noOfHrsNotSelected"));
							ctype.setBusy(false);
							rButton.setEnabled(true);
							return;
						}
					}
				} catch (err) {}
				//Handle StartDate and EndDate
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				// get the daylight saving active / inactive
				var dlsactive = false;
				var today = new Date();
				Date.prototype.stdTimezoneOffset = function() {
					var jan = new Date(this.getFullYear(), 0, 1);
					var jul = new Date(this.getFullYear(), 6, 1);
					return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
				};
				Date.prototype.dst = function() {
					return this.getTimezoneOffset() < this.stdTimezoneOffset();
				};
				Date.prototype.dstdifference = function() {
					return this.getTimezoneOffset() - this.stdTimezoneOffset();
				};
				if (today.dst()) {
					dlsactive = true;
				}
				if (dlsactive === true) {
					var dlsTZOffsetMs = today.dstdifference() * 60 * 1000;
				} else {
					dlsTZOffsetMs = 0;
				}
				// if (TZOffsetMs < 0) {
				var localStartDate = new Date(startDate.getTime() - TZOffsetMs - dlsTZOffsetMs);
				var localEndDate = new Date(endDate.getTime() - TZOffsetMs - dlsTZOffsetMs);
				// } else if (TZOffsetMs > 0) {
				// 	var localStartDate = new Date(startDate.getTime() + TZOffsetMs);
				// 	var localEndDate = new Date(endDate.getTime() + TZOffsetMs);
				// }

				if (empId === 'ALL') {
					for (var l = 0; l < this.employees.length; l++) {
						var empId2 = this.employees[l].employee;
						var workDayAllowanceItem = {
							"EmployeeId": empId2,
							"WorkDate": this.employees[0].Days[0], //new Date(),
							"Counter": "0",
							"ProjectID": "",
							"ProjectName": "",
							"EntryType": "ABSENCE",
							"EntryTypeCatId": absType,
							"EntryTypeDesc": "",
							"Hours": noOfHrs,
							"KMNumber": null,
							"HourUnit": localDayType,
							"StartDate": localStartDate,
							"EndDate": localEndDate,
							"StartTime": "000000",
							"EndTime": "000000",
							"FullDay": false,
							"Status": "D",
							"ZoneType": null,
							"ZoneName": null,
							"MealIndicator": null,
							"JourneyIndicator": null,
							"TransportIndicator": null,
							"CreatedBy": "",
							"CreatedOn": new Date(),
							"ReleaseOn": null,
							"ApprovedOn": null,
							"Reason": "",
							"AllowancesType": "",
							"AllowancesName": "",
							"Comment": Comments,
							"ApplicationName": "TEAMLEAD"
						};
						data.NavWorkDayTimeItems.push(workDayAllowanceItem);

					}

				} else {

					var workDayAllowanceItem = {
						"EmployeeId": empId,
						"WorkDate": new Date(),
						"Counter": "0",
						"ProjectID": "",
						"ProjectName": "",
						"EntryType": "ABSENCE",
						"EntryTypeCatId": absType,
						"EntryTypeDesc": "",
						"Hours": noOfHrs,
						"KMNumber": null,
						"HourUnit": localDayType,
						"StartTime": "000000",
						"EndTime": "000000",
						"FullDay": false,
						"Status": "D",
						"ZoneType": null,
						"ZoneName": null,
						"MealIndicator": null,
						"JourneyIndicator": null,
						"TransportIndicator": null,
						"CreatedBy": "",
						"CreatedOn": new Date(),
						"ReleaseOn": null,
						"ApprovedOn": null,
						"Reason": "",
						"AllowancesType": "",
						"AllowancesName": "",
						"StartDate": localStartDate,
						"EndDate": localEndDate,
						"Comment": Comments,
						"ApplicationName": "TEAMLEAD"
					};
					data.NavWorkDayTimeItems.push(workDayAllowanceItem);
				}
			} else {

				if (selectedTab === 'hours') {
					var tab = oView.byId('addTimeTab').getItems()[0].getItems();
					for (var k = 1; k < tab.length; k++) {
						var startTime = '000000';
						var endTime = '000000';
						try {
							var projectID = undefined;
							var hrType = tab[k].getItems()[2].getItems()[2].getItems()[1].getSelectedKey();
							var projectBindingPath = tab[k].getItems()[2].getItems()[1].getItems()[0].getBindingContext().getPath();
							var fullDayindex = tab[k].getItems()[2].getItems()[2].getItems()[0].getSelectedIndex();
							if (this.AddUpdatetimeModel.getData().duration) {
								startTime = tab[k].getItems()[3].getItems()[2].getItems()[1].getValue();
								endTime = tab[k].getItems()[3].getItems()[2].getItems()[2].getValue();
								if (fullDayindex !== 0) {
									if (startTime === '' || endTime === '') {
										if (startTime === '')
											MessageBox.alert(this.i18nModel.getText("startTimeNotSelected"));
										else if (endTime === '')
											MessageBox.alert(this.i18nModel.getText("endTimeNotSelected"));
										ctype.setBusy(false);
										rButton.setEnabled(true);
										return;
									}
								}
							}
							var fullDay = false;
							if (fullDayindex === 0) {
								fullDay = true;
							}
							projectID = oView.getModel().getProperty(projectBindingPath).ProjectId;
						} catch (err) {
							if (projectID === undefined && hrType === "") {
								continue;
							} else {
								//MessageBox.alert("All Items are not selected");
								if (hrType === "")
									MessageBox.alert(this.i18nModel.getText("hrTypeNotSelected"));
								else if (projectID === undefined)
									MessageBox.alert(this.i18nModel.getText("projectNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
						}
						if (projectID === undefined && hrType === "") {
							continue;
						} else if (projectID === undefined || hrType === "") {
							//MessageBox.alert("All Items are not selected");
							if (hrType === "")
								MessageBox.alert(this.i18nModel.getText("hrTypeNotSelected"));
							else if (projectID === undefined)
								MessageBox.alert(this.i18nModel.getText("projectNotSelected"));
							ctype.setBusy(false);
							rButton.setEnabled(true);
							return;
						}
						var localHours = tab[k].getCustomData()[0].getValue();
						if (localHours !== null && localHours !== undefined) {
							var localHoursText = localHours.toString();
						} else {
							localHoursText = localHours;
						}
						var workDayItem = {
							"ProjectID": projectID,
							"EntryType": "HOURS",
							"Hours": localHoursText,
							"EntryTypeCatId": hrType,
							"StartTime": startTime,
							"EndTime": endTime,
							"FullDay": fullDay,
							"AllowancesName": "",
							"ZoneType": "",
							"ZoneName": "",
							"MealIndicator": false,
							"JourneyIndicator": false,
							"TransportIndicator": false,
							"StartDate": null,
							"EndDate": null,
							"Comment": null

						};

						workDayItems.push(workDayItem);

					}
				} else if (selectedTab === 'KM') {
					/// Get Item Data from view for KM Hours
					var kmtab = oView.byId('addKM').getItems()[0].getItems();
					for (var km = 2; km < kmtab.length; km++) {
						var startTime = '000000';
						var endTime = '000000';
						try {
							var kmprojectID = undefined;
							var kmhrType = undefined;

							if (this.AddUpdatetimeModel.getData().duration) {
								startTime = kmtab[km].getItems()[2].getItems()[1].getValue();
								endTime = kmtab[km].getItems()[2].getItems()[2].getValue();
							}

							//	var StartTime = kmtab[km].getItems()[0].getItems()[1].getValue();
							//	var EndTime = kmtab[km].getItems()[1].getItems()[1].getValue();
							var KMNumber = kmtab[km].getItems()[2].getItems()[3].getValue();
							kmhrType = kmtab[km].getItems()[2].getItems()[4].getSelectedKey();
							var kmprojectBindingPath = oView.byId('addKM').getItems()[0].getItems()[1].getItems()[0].getBindingContext().getPath();
							kmprojectID = oView.getModel().getProperty(kmprojectBindingPath).ProjectId;
							if ((kmprojectID === "" || kmprojectID === undefined || kmprojectID === null) &&
								(kmhrType === "" || kmhrType === undefined || kmhrType === null) &&
								(startTime === "" || startTime === undefined || startTime === null) &&
								(endTime === "" || endTime === undefined || endTime === null) &&
								(KMNumber === "" || KMNumber === undefined || KMNumber === null)) {
								continue;
							} else if (kmprojectID === "" || kmprojectID === undefined || kmprojectID === null) {
								//MessageBox.alert("Project is not selected");
								if (km === 3) {
									continue;
								}
								MessageBox.alert(this.i18nModel.getText("projectIsNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							} else if (kmhrType === "" || kmhrType === undefined || kmhrType === null) {
								//MessageBox.alert("Kilometer Type is not selected");
								if (km === 3) {
									continue;
								}
								MessageBox.alert(this.i18nModel.getText("kmTypeIsNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
						} catch (err) {
							if ((kmprojectID === "" || kmprojectID === undefined || kmprojectID === null) &&
								(kmhrType === "" || kmhrType === undefined || kmhrType === null)) {
								continue;
							} else {
								//MessageBox.alert("All Items are not selected");
								if (km === 3) {
									continue;
								}
								if (kmprojectID === "" || kmprojectID === undefined || kmprojectID === null)
									MessageBox.alert(this.i18nModel.getText("projectIsNotSelected"));
								else if (kmhrType === "" || kmhrType === undefined || kmhrType === null)
									MessageBox.alert(this.i18nModel.getText("kmTypeIsNotSelected"));

								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
						}
						workDayItem = {
							"ProjectID": kmprojectID,
							"EntryType": "KM",
							"Hours": kmtab[km].data('hrs').toString(),
							"EntryTypeCatId": kmhrType,
							"KMNumber": KMNumber,
							"StartTime": startTime,
							"EndTime": endTime,
							"FullDay": false,
							"AllowancesName": "",
							"ZoneType": "",
							"ZoneName": "",
							"MealIndicator": false,
							"JourneyIndicator": false,
							"TransportIndicator": false,
							"StartDate": null,
							"EndDate": null,
							"Comment": null

						};
						workDayItems.push(workDayItem);
					}
				} else if (selectedTab === 'bonus') {
					var tabBns = oView.byId('addBonusTab').getItems()[0].getItems();

					for (var k = 1; k < tabBns.length; k++) {
						try {
							var bnsType = tabBns[k].getItems()[2].getItems()[0].getItems()[0].getItems()[1].getSelectedKey();
							var bnsDesc = tabBns[k].getItems()[2].getItems()[0].getItems()[0].getItems()[1]._getSelectedItemText();
							var bnsQty = tabBns[k].getItems()[2].getItems()[0].getItems()[1].getItems()[1].getValue();
							var bnsProjectBindingPath = tabBns[k].getItems()[2].getItems()[2].getItems()[0].getBindingContext().getPath();
							var bnsProjectID = oView.getModel().getProperty(bnsProjectBindingPath).ProjectId;
						} catch (err) {
							if (bnsProjectID === undefined && bnsType === "") {
								continue;
							} else {
								//MessageBox.alert("All Items are not selected");
								if (bnsType === "")
									MessageBox.alert(this.i18nModel.getText("bnsTypeNotSelected"));
								else if (bnsProjectID === undefined)
									MessageBox.alert(this.i18nModel.getText("projectNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
						}
						if (bnsProjectID === undefined && bnsType === "") {
							continue;
						} else {
							//MessageBox.alert("All Items are not selected");
							var localreturn = false;
							if (bnsType === "") {
								MessageBox.alert(this.i18nModel.getText("bnsTypeNotSelected"));
								localreturn = true;
							} else if (bnsProjectID === undefined) {
								MessageBox.alert(this.i18nModel.getText("projectNotSelected"));
								localreturn = true;
							}
							if (localreturn === true) {
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
						}
						// bonus quanitity
						if (bnsQty !== null && bnsQty !== undefined && bnsQty !== "") {
							var bnsQtyText = bnsQty.toString();
						} else {
							bnsQtyText = bnsQty;
							MessageBox.alert(this.i18nModel.getText("bnsQtyNotEntered"));
							ctype.setBusy(false);
							rButton.setEnabled(true);
							return;
						}
						workDayItem = {
							"ProjectID": bnsProjectID,
							"EntryType": "PREMIUM",
							"Hours": bnsQtyText,
							"EntryTypeCatId": bnsType,
							"StartTime": "000000",
							"EndTime": "000000",
							"FullDay": false,
							"AllowancesName": bnsDesc,
							"ZoneType": "",
							"ZoneName": "",
							"MealIndicator": false,
							"JourneyIndicator": false,
							"TransportIndicator": false,
							"StartDate": null,
							"EndDate": null,
							"Comment": null
						};
						workDayItems.push(workDayItem);
					}
				} else if (selectedTab === 'allowance') {
					/// Get Item Data from view for Daily Allowances
					var meal = oView.byId('AllowanceMealIndicator').getPressed();
					var transport = oView.byId('AllowanceTransportIndicator').getPressed();
					var travel = oView.byId('AllowanceTravelIndicator').getPressed();
					//if (meal || transport || travel) {
					var zonetype = oView.byId('AllowanceZoneType').getSelectedKey();
					var zoneName = oView.byId('AllowanceZoneType').getValue();
					if (zoneName === undefined || zoneName === "" || zoneName === null) {
						//MessageBox.alert("Zone type is not selected");
						MessageBox.alert(this.i18nModel.getText("zoneTypeIsNotSelected"));
						ctype.setBusy(false);
						rButton.setEnabled(true);
						return;
					}
					var allwProjectID = null;
					try {
						var allwProject = oView.byId('AllowanceProject').getItems()[1].getItems()[0].getBindingContext().getPath();
						allwProjectID = oView.getModel().getProperty(allwProject).ProjectId;
					} catch (err) {
						allwProjectID = "";
					}

					var workDayAllowanceItem = {
						"ProjectID": allwProjectID,
						"EntryType": "IPD",
						"EntryTypeCatId": null,
						"Hours": "1",
						"StartTime": "000000",
						"EndTime": "000000",
						"FullDay": false,
						"AllowancesName": "",
						"ZoneType": zonetype,
						"ZoneName": zoneName,
						"MealIndicator": meal,
						"JourneyIndicator": transport,
						"TransportIndicator": travel,
						"StartDate": null,
						"EndDate": null,
						"Comment": null
					};
					workDayItems.push(workDayAllowanceItem);
					//	}
				}
				////

				if (workDayItems.length <= 0) {
					ctype.setBusy(false);
					rButton.setEnabled(true);
					return;
				}
				Date.prototype.getWeek = function() {
					var onejan = new Date(this.getFullYear(), 0, 1);
					return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
				};

				for (var l = 0; l < this.employees.length; l++) {
					var empId = this.employees[l].employee;

					for (var j = 0; j < this.employees[l].Days.length; j++) {
						for (var i = 0; i < workDayItems.length; i++) {
							var item = {
								"EmployeeId": empId,
								"WorkDate": this.employees[l].Days[j],
								"Counter": "0",
								"ProjectID": workDayItems[i].ProjectID,
								"ProjectName": "",
								"EntryType": workDayItems[i].EntryType,
								"EntryTypeCatId": workDayItems[i].EntryTypeCatId,
								"EntryTypeDesc": "",
								"Hours": workDayItems[i].Hours,
								"KMNumber": workDayItems[i].KMNumber,
								"StartTime": workDayItems[i].StartTime,
								"EndTime": workDayItems[i].EndTime,
								"FullDay": workDayItems[i].FullDay,
								"StartDate": workDayItems[i].StartDate,
								"EndDate": workDayItems[i].EndDate,
								"Status": "D",
								"Comment": workDayItems[i].Comment,
								"CreatedBy": "",
								"CreatedOn": new Date(),
								"ReleaseOn": null,
								"ApprovedOn": null,
								"Reason": "",
								"AllowancesType": "",
								"AllowancesName": workDayItems[i].AllowancesName,
								"ZoneType": workDayItems[i].ZoneType,
								"ZoneName": workDayItems[i].ZoneName,
								"MealIndicator": workDayItems[i].MealIndicator,
								"JourneyIndicator": workDayItems[i].JourneyIndicator,
								"TransportIndicator": workDayItems[i].TransportIndicator,
								"ApplicationName": oView.getModel('userPreference').getProperty("/application"),
								"ApplicationVersion": oView.getModel('userPreference').getProperty("/applicationVersion")
							};
							data.NavWorkDayTimeItems.push(item);
						}

					}
				}
			}

			var that = this;
			ctype.setBusy(true);
			this.oDataModel.create("/WorkDaySet", data, {
				success: function() {
					ctype.setBusy(false);
					rButton.setEnabled(true);
					savepostFuction(that);
					that.refresh_workdaySetforAdd(that.employees, oView);
				},
				error: function() {
					ctype.setBusy(false);
					rButton.setEnabled(true);
				}
			});
		},

		refresh_workdaySet: function(employees, oView) {
			var userPref = oView.getModel("userPreference").getData();
			var datFilter = '';
			for (var k = 0; k < employees[0].Days.length - 1; k++) {
				datFilter = datFilter + "%20WorkDate%20eq%20" + datetime.getODataDateFilter(employees[0].Days[0]) + "%20or%20";
			}

			datFilter = datFilter + "%20WorkDate%20eq%20" + datetime.getODataDateFilter(employees[0].Days[k]) + "%20";
			var urlFilterParam = "$filter=EmployeeId%20eq%20'" + employees[0].employee + "'and%20" + datFilter +
				"and%20ApplicationName%20eq%20%27" + userPref
				.application + "%27%20and%20ApplicationVersion%20eq%20%27" + userPref.applicationVersion + "%27%20";
			oView.getModel().read('/WorkDaySet', {
				urlParameters: urlFilterParam
			});
		},

		refresh_workdaySetforAdd: function(employees, oView) {
			var userPref = oView.getModel("userPreference").getData();
			if (employees[0].Days.length === 1) {
				var urlFilterParam = "$filter=EmployeeId%20eq%20'" + employees[0].employee + "'and%20WorkDate%20eq%20" +
					datetime.getODataDateFilter(employees[0].Days[0]) + "and%20ApplicationName%20eq%20%27" + userPref
					.application + "%27%20and%20ApplicationVersion%20eq%20%27" + userPref.applicationVersion + "%27%20";
			} else {
				var fromDay = employees[0].Days[0];
				var toDay = employees[0].Days[employees[0].Days.length - 1];
				urlFilterParam = "$filter=EmployeeId%20eq%20'" + employees[0].employee + "'and%20WorkDate%20ge%20" +
					datetime.getODataDateFilter(fromDay) + "and%20WorkDate%20le%20" + datetime.getODataDateFilter(toDay) +
					"and%20ApplicationName%20eq%20%27" + userPref.application + "%27%20and%20ApplicationVersion%20eq%20%27" + userPref.applicationVersion +
					"%27%20";
			}
			oView.getModel().read('/WorkDaySet', {
				urlParameters: urlFilterParam
			});
		},

		Common_raiseinputError: function(source, text) {
			source.setValueStateText(text);
			source.setShowValueStateMessage(true);
			source.openValueStateMessage();
			source.focus();
		}

	};

});