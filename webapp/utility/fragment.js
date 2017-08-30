sap.ui.define(["com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function(datetime, JSONModel, MessageBox, Filter, FilterOperator) {
	"use strict";

	return {
		SearchProject_init: function(controler, container, selectButton) {

			//var fragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.SearchProject", controler);
			//	controler._setProjectSearchFragment(fragment.getId());
			this.projectSearchFragment = container.getItems()[1].getItems()[0].getId();
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
			//	container.getItems()[1].addItem(fragment);

			selectButton.getCustomData()[0].setValue("");

			// Hide Element from previous screen
			this.footerModel.setProperty("/MainNewScreen", false);
			this.footerModel.setProperty("/MainUpdateScreen", false);
			this.footerModel.setProperty("/MainPreviousScreen", false);
			this.footerModel.setProperty("/ProjectScreen", true);

		},
		SearchProject_destroy: function(fragmentObject) {

			var container = fragmentObject.getParent().getParent();
			container.getItems()[0].setVisible(true);
			container.getItems()[1].setVisible(false);
			//	hideContainer.setVisible(true);
			//fragmentObject.destroy(true);

			this.footerModel.setProperty("/MainNewScreen", true);
			this.footerModel.setProperty("/MainUpdateScreen", false);
			this.footerModel.setProperty("/MainPreviousScreen", false);
			this.footerModel.setProperty("/ProjectScreen", false);

		},
		SearchProject_getProjectContext: function(fragmentObject) {
			return fragmentObject.getCustomData()[0].getValue();
		},
		SearchProject_OnProjectFilterchange: function(oEvent, oView) {

			var index = oEvent.getParameter('selectedIndex');
			var button = oEvent.getSource().getButtons()[index];
			var sourceId = button.getId();
			//button.focus(false);
			if (index === 0) // Last + Fav Projects  
			{
				this.lastProjectFilter = [];
				for (var k = 0; k < this.employees.length; k++) {
					var filter = new Filter("EmployeeId", FilterOperator.EQ, this.employees[k].employee);
					this.lastProjectFilter.push(filter);
				}
				this.lastProjectFilter.push(new Filter("LastUsedProject", FilterOperator.EQ, true));
				this.lastProjectFilter.push(new Filter("Favorite", FilterOperator.EQ, true));

				/*this.lastProjectFilter = [new sap.ui.model.Filter([new Filter("LastUsedProject", FilterOperator.EQ, true), new Filter("Favorite",
					FilterOperator.EQ, true)], true)];*/
				oEvent.getSource().getParent().getItems()[2].setVisible(false);

			} else {
				this.lastProjectFilter = null;
				oEvent.getSource().getParent().getItems()[2].setVisible(true);
			}
			this.SearchProject_applyFiler();
			var that = oView;

			jQuery.sap.delayedCall(0, this, function() {
				document.getElementById(sourceId).blur();
				//	that.byId("ProjectCancelButton").focus();
			});

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
		SearchProject_onProjectDescriptionSuggest: function(oEvent) {
			var value = oEvent.getParameter("suggestValue");
			var source = oEvent.getSource();
			var filters = [];

			if (value.length > 2) {
				filters = new Filter({
					filters: [new Filter("ProjectDescription", FilterOperator.Contains, value), new Filter("ProjectId", FilterOperator.Contains,
						value)],
					and: true
				});
				source.getBinding("suggestionItems").filter(filters);
				source.getBinding("suggestionItems").attachEventOnce('dataReceived', function() {
					source.suggest();
				});

			}

		},
		SearchProject_onProjectManagerSuggest: function(oEvent) {
			var value = oEvent.getParameter("suggestValue");
			var source = oEvent.getSource();
			var filters = [];

			if (value.length > 2) {
				filters = [new Filter("FieldDescription", FilterOperator.Contains, value)];
				source.getBinding("suggestionItems").filter(filters);
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
			if (BUId === 'ALL')
			{
				this.BUfilter = null;
			}
			else
			{
			this.BUfilter = new Filter("BusinessUnit", FilterOperator.EQ, BUId);
			}
			this.SearchProject_applyFiler();

		},

		SearchProject_onPositionFilterChange: function(oEvent) {
			var positionId = oEvent.getSource().getSelectedKey();
			if (positionId === 'ALL')
			{
				this.positionfilter = null;
			}
			else {
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
			var projectfragment = sap.ui.getCore().byId(this.projectSearchFragment);
			projectfragment.getItems()[4].getBinding("items").filter(Filters, "Application");

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
		SelectProject_OnDailyHrTypeChange2: function(oEvent) {
			var selectedKey = oEvent.getParameter('selectedItem').getKey();
			oEvent.getSource().getParent().getParent().getParent().getItems()[2].getItems()[2].getItems()[1].setSelectedKey(selectedKey);
		},
		SelectProject_OnDailyHrTypeChange1: function(oEvent) {
			var selectedKey = oEvent.getParameter('selectedItem').getKey();
			oEvent.getSource().getParent().getParent().getParent().getItems()[3].getItems()[2].getItems()[3].setSelectedKey(selectedKey);
		},

		//////**Add Project Time** ////
		AddProjectTime_init: function(controler, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", controler);
				container.addItem(oFragment);
			}

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

			var index = oEvent.getParameter('selectedIndex');
			var button = oEvent.getSource().getButtons()[index];
			var sourceId = button.getId();

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

				allDayCombo.setVisible(false);
				selecthrsCombo.setVisible(true);
				timepicker.setValue("0.00");
				timepickerTo.setEnabled(false);

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
			jQuery.sap.delayedCall(0, this, function() {
				document.getElementById(sourceId).blur();
				//	that.byId("ProjectCancelButton").focus();
			});
		},
		AddProjectTime_OnChangeHours: function(oEvent) {
			var source = oEvent.getSource();

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

			var endTimer = source.getParent().getItems()[2];
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
			endTimer.setValueState("None");
			var dDate = new Date(diffTime);
			var duration = dDate.getUTCHours() + ":" + dDate.getUTCMinutes();
			var newValue = datetime.timeToDecimal(duration);
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			sourcePanel.getCustomData()[0].setValue(newValue);
			//endTimer.setValue(source.getValue());

		},
		AddProjectTime_OnChangeEndTime: function(oEvent) {
			var source = oEvent.getSource();
			var startTimer = source.getParent().getItems()[1];

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
			var duration = dDate.getUTCHours() + ":" + dDate.getUTCMinutes();
			var newValue = datetime.timeToDecimal(duration);
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
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
		AddKM_init: function(controler, container, addnew) {

			var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddKM", controler);
			container.addItem(oFragment);

			if (addnew) {
				var oFragment2 = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddKM", controler);
				container.addItem(oFragment2);
			}

		},
		AddKM_OnChangeStartTimeKM: function(oEvent) {
			var source = oEvent.getSource();

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
			endTimer.setValueState("None");
		},
		AddKM_OnChangeEndTimeKM: function(oEvent) {
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
			startTimer.setValueState("None");
		},
		AddUpdatetime_onSelectAbsenceStartDate: function(oEvent, view) {
			var startDate = oEvent.getSource();
			var endDate = view.byId('AbsEndDate');

			if (!(endDate.getDateValue() instanceof Date) || startDate.getDateValue().getTime() < endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
			} else {
				startDate.setValueState("Error");
				this.Common_raiseinputError(startDate, this.i18nModel.getText("dateValidationErrorMsg"));
				return;
			}

		},
		AddUpdatetime_onSelectAbsenceEndDate: function(oEvent, view) {

			var startDate = view.byId('AbsStartDate');
			var endDate = oEvent.getSource();

			if (!(startDate.getDateValue() instanceof Date) || startDate.getDateValue().getTime() < endDate.getDateValue().getTime()) {
				startDate.setValueState("None");
				endDate.setValueState("None");
			} else {
				endDate.setValueState("Error");
				this.Common_raiseinputError(endDate, this.i18nModel.getText("dateValidationErrorMsg"));
				return;
			}
		},

		//////**Add Update Time** ////
		AddUpdatetime_init: function(controler, container, type, i18nModel, employees, odataModel) {

			var odata = {
				totalhrs: 0,
				visibleHrs: true,
				visibleDailyAllow: true,
				visibleKM: true,
				visibleAbsence: true,
				visibleAbsence1: true,
				visibleAbsence2: false,
				visibleAbsence3: false,
				visibleEquipment: false,
				visibleSummary: false,
				visibleProjectOptional: false,
				newTime: true,
				duration: true
			};

			var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddUpdateTime", controler);
			this.AddProjectTime_init(controler, controler.getView().byId('addTimeTab').getItems()[0], true); // initialse with single hour
			//this.AddKM_init(controler, controler.getView().byId('addKM').getItems()[0], odata.newTime);
			var items = container.getItems();
			if (items.length > 0) {
				items[0].setVisible(false);
			}
			container.addItem(oFragment);
			this.oDataModel = odataModel;
			this.employees = employees;

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
			var addNew = this.AddUpdatetimeModel.getData().newTime;
			this.AddProjectTime_init(controller, controller.getView().byId('addTimeTab').getItems()[0], addNew);
		},
		AddUpdatetime_getOwnIconTabObject: function(source) {
			var parent = source.getParent();
			while (parent.getMetadata().getName() !== 'sap.m.IconTabFilter') {
				parent = parent.getParent();
			}
			return parent.getContent()[0];
		},
		AddUpdatetime_saveEntries: function(oView, savepostFuction) {
			/// Get Item Data from view for Daily hour
			var tab = oView.byId('addTimeTab').getItems()[0].getItems();
			var workDayItems = [];
			for (var k = 1; k < tab.length; k++) {
				try {

					var hrType = tab[k].getItems()[2].getItems()[2].getItems()[1].getSelectedKey();
					var projectBindingPath = tab[k].getItems()[2].getItems()[1].getItems()[0].getBindingContext().getPath();
					var fullDayindex = tab[k].getItems()[2].getItems()[2].getItems()[0].getSelectedIndex();
					var fullDay = false;
					if (fullDayindex === 0) {
						fullDay = true;
					}
					var projectID = oView.getModel().getProperty(projectBindingPath).ProjectId;

				} catch (err) {
					if (projectID === undefined && hrType === "") {
						continue;
					} else {
						MessageBox.alert("All Items are not selected");
						return;
					}
				}
				if (projectID === undefined && hrType === "") {
					continue;
				} else if (projectID === undefined || hrType === "") {
					MessageBox.alert("All Items are not selected");
					return;
				}

				var workDayItem = {
					"ProjectID": projectID,
					"EntryType": "HOURS",
					"Hours": tab[k].getCustomData()[0].getValue().toString(),
					"EntryTypeCatId": hrType,
					"StartTime": "000000",
					"EndTime": "000000",
					"FullDay": fullDay,
					"ZoneType": "",
					"ZoneName":"",
					"MealIndicator": false,
					"JourneyIndicator": false,
					"TransportIndicator": false

				};

				workDayItems.push(workDayItem);

			}

			var meal = oView.byId('AllowanceMealIndicator').getPressed();
			var transport = oView.byId('AllowanceTransportIndicator').getPressed();
			var travel = oView.byId('AllowanceTravelIndicator').getPressed();
			if (meal || transport || travel) {
				var zonetype = oView.byId('AllowanceZoneType').getSelectedKey();
				var zoneName = oView.byId('AllowanceZoneType').getValue();
				if (zoneName === undefined) {
					MessageBox.alert("All Items are not selected");
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
					"ZoneType": zonetype,
					"ZoneName": zoneName,
					"MealIndicator": meal,
					"JourneyIndicator": transport,
					"TransportIndicator": travel
				};

				workDayItems.push(workDayAllowanceItem);

			}

			////
			var data = {
				"EmployeeId": this.employees[0].employee,
				"WorkDate": this.employees[0].Days[0],
				"NavWorkDayTimeItems": []
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
							"KMNumber": "",
							"StartTime": workDayItems[i].StartTime,
							"EndTime": workDayItems[i].EndTime,
							"FullDay": workDayItems[i].FullDay,
							"Status": "D",
							"Comment": "",
							"CreatedBy": "",
							"CreatedOn": new Date(),
							"ReleaseOn": null,
							"ApprovedOn": null,
							"Reason": "",
							"AllowancesType": "",
							"AllowancesName": "",
							"ZoneType": workDayItems[i].ZoneType,
							"ZoneName": workDayItems[i].ZoneName,
							"MealIndicator": workDayItems[i].MealIndicator,
							"JourneyIndicator": workDayItems[i].JourneyIndicator,
							"TransportIndicator": workDayItems[i].TransportIndicator,
							"ApplicationName": "TEAMLEAD"
						};
						data.NavWorkDayTimeItems.push(item);
					}

				}

			}
			this.oDataModel.create("/WorkDaySet", data, {
				success: savepostFuction
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