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
			var timepicker = selecthrsCombo.getItems()[2].getItems()[0];
			var timepickerFrom = selecthrsCombo.getItems()[2].getItems()[1];
			var timepickerTo = selecthrsCombo.getItems()[2].getItems()[2];
			if (oEvent.getParameter("selectedIndex") === 1) {
				//newValue = 0;

				allDayCombo.setVisible(false);
				selecthrsCombo.setVisible(true);
				timepicker.setValue("00:00");
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
		AddUpdatetime_init: function(controler, container, type, i18nModel,employees,odataModel) {

			var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddUpdateTime", controler);
			this.AddProjectTime_init(controler, controler.getView().byId('addTimeTab').getItems()[0]); // initialse with single hour
			var items = container.getItems();
			if (items.length > 0) {
				items[0].setVisible(false);
			}
			container.addItem(oFragment);
			this.oDataModel = odataModel;
			this.employees = employees;
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
		},
		AddUpdatetime_saveEntries: function () {
			var data = {"EmployeeId":this.employees[0].employee,"WorkDate":this.employees[0].Days[0], "NavWorkDayTimeItems":[]};
			for (var k = 0; k < this.employees.length; k++){
				var empId = this.employees[k].employee;
				for( var j = 0; j < this.employees[k].Days.length; j++) {
					var item = {
						"EmployeeId": empId,
                        "WorkDate": this.employees[k].Days[j],
                        "Counter": "0",
                        /*"ProjectID": "P0100981101",
                        "EntryType": "HOURS",
                        "Hours": "5.00 ",
                        "StartTime": "000000",
                        "EndTime": "000000",
                        "Status": "D",
                        "Comment": "",
                        "CreatedBy": "",
                        "CreatedOn": null,
                        "AllowancesType": "",
                        "AllowancesName": "",
                        "ZoneType": "",
                        "MealIndicator": false*/
                       
                                                                                                                                "ProjectID": "P0100981101",
                                                                                                                                "ProjectName": "",
                                                                                                                                "EntryType": "HOURS",
                                                                                                                                "Hours": "5.00 ",
                                                                                                                                "StartTime": "000000",
                                                                                                                                "EndTime": "000000",
                                                                                                                                "Status": "V",
                                                                                                                                "Comment": "",
                                                                                                                                "CreatedBy": "",
                                                                                                                                "CreatedOn": null,
                                                                                                                                "ReleaseOn": null,
                                                                                                                                "ApprovedOn": null,
                                                                                                                                "Reason": "",
                                                                                                                                "AllowancesType": "",
                                                                                                                                "AllowancesName": "",
                                                                                                                                "ZoneType": "",
                                                                                                                                "MealIndicator": false
                                

					};
					data.NavWorkDayTimeItems.push(item);
				}
				
			}
			this.oDataModel.create("/WorkDaySet",data);
		},
		Common_raiseinputError: function(source, text) {
			source.setValueStateText(text);
			source.setShowValueStateMessage(true);
			source.openValueStateMessage();
			source.focus();
		}

	};

});