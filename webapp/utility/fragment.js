sap.ui.define(["com/vinci/timesheet/admin/utility/datetime",
	"com/vinci/timesheet/admin/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/NumberFormat"
], function(datetime, formatter, JSONModel, MessageBox, Filter, FilterOperator, NumberFormat) {
	"use strict";

	return {
		SearchProject_init: function(controler, container, selectButton, allProject) {

			var fragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.SearchProject", controler);

			this.projectSearchFragment = fragment.getId();
			this.projectfilter = null;
			this.BUfilter = null;
			this.positionfilter = null;
			this.lastProjectFilter = null;

			container.getItems()[0].setVisible(false);
			// Fragment for project search and display of search results is inserted in 2nd VBox of main VBox in icon tab filter
			container.getItems()[1].setVisible(true);
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
				// applicationFilter = new Filter("ApplicationName", FilterOperator.EQ, "EQUIPEMENT");
				applicationFilter = new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD_E");
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
					var filter0 = new Filter("EmployeeId", FilterOperator.EQ, this.userPrefModel.getProperty('/EmployeeID'));
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
					var filter0 = new Filter("EmployeeId", FilterOperator.EQ, this.userPrefModel.getProperty('/EmployeeID'));
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

				filters1.push(filters);

				if (this.BUfilter !== null) {
					filters1.push(this.BUfilter);
				}

				if (this.equipment) {
					filters1.push(new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD_E"));
				} else {
					filters1.push(new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD"));
				}

				var appFilter = new Filter({
					filters: filters1,
					and: true
				});
				source.getBinding("suggestionItems").filter(appFilter);
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
							"TEAMLEAD_E")],
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
					this.projectfilter = new Filter({
						filters: [new Filter("ProjectDescription", FilterOperator.Contains, query), new Filter("ProjectId", FilterOperator.Contains,
							query)],
						and: true
					});
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
				// appFilter = new Filter("ApplicationName", FilterOperator.EQ, "EQUIPEMENT");
				appFilter = new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD_E");
			} else {
				appFilter = new Filter("ApplicationName", FilterOperator.EQ, "TEAMLEAD");
			}
			Filters.push(appFilter);
			var projectfragment = sap.ui.getCore().byId(this.projectSearchFragment);
			projectfragment.getItems()[4].getBinding("items").filter(Filters, "Application");

		},
		SelectProject_afterSelection: function(projectContext, sTabKey) {
			this.selectProjectcontext[0].bindElement(projectContext); // Label
			this.selectProjectcontext[0].setVisible(true); // Label
			this.selectProjectcontext[1].setVisible(false); // ownIntialButton
			this.selectProjectcontext[2].setVisible(true); // ownRefreshButton

			if (this.selectProjectcontext.length === 4) {
				this.selectProjectcontext[3].setVisible(true); // ownDeleteButton
			}

			if (this.selectProjectcontext.length === 5 && (sTabKey === "overnight" || sTabKey === "KM" || sTabKey === "bonus")) {
				this.selectProjectcontext[0].setVisible(true); // Label
				this.selectProjectcontext[1].setVisible(false); // ownIntialButton
				this.selectProjectcontext[2].setVisible(true); // ownRefreshButton
				this.selectProjectcontext[3].setVisible(true); // ownDeleteButton
				this.selectProjectcontext[4].setVisible(false); // ownText
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
		SelectProject_onPressProjectSelect: function(oController) {
			var projectfragment = this.SearchProject_getProjectSearchFragment();
			var oIcnTabBar = oController.byId('idIconTabBarMulti');
			var sKey = "";
			if (oIcnTabBar) {
				sKey = oIcnTabBar.getSelectedKey();
			}
			var projectContext = this.SearchProject_getProjectContext(projectfragment); //oEvent.getSource().getCustomData()[0].getValue();
			if (projectContext === null || projectContext === "") {
				MessageBox.alert(this.i18nModel.getText("noprojectselectmessage"));
			} else {

				this.SelectProject_afterSelection(projectContext, sKey);
				this.SearchProject_destroy(projectfragment);

			}
		},
		SelectProject_OnDailyHrTypeChange: function(oEvent) {
			var selectedKey = oEvent.getParameter('selectedItem').getKey();
			this.warning = true;
			//oEvent.getSource().setPlaceholder("");
			
			//AMU_US6 Ergonomie du Masque de saisies des heures
			//oEvent.getSource().getParent().getParent().getItems()[4].getItems()[0].setSelectedKey(selectedKey);
			oEvent.getSource().getParent().getParent().getItems()[3].getItems()[0].setSelectedKey(selectedKey);
			//AMU_US6 Ergonomie du Masque de saisies des heures
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
			// if (oEvent.getParameters().value.length > 4) {
			// 	var setText = oEvent.getParameters().value.slice(0, 4);
			// 	oEvent.getSource().setValue(setText);
			// }
			var setText = oEvent.getParameters().value;
			// Find the first seperator used "," / "."
			if (setText.search(",") !== -1) {
				var sep = ",";
			} else if (setText.search(".") !== -1) {
				sep = ".";
			} else {
				sep = ".";
			}
			// Logic to evaluate
			if (sep === ",") {
				var localSetText = setText.replace(/[^\d,]/g, '');
				var arr = localSetText.split(",");
				var ans = arr.splice(0, 2).join(',') + arr.join('');
				var localarr = ans.split(",");
				if (localarr.length > 1) {
					var loaclFinalStr = localarr[0].slice(0, 4) + "," + localarr[1].slice(0, 2);
				} else {
					loaclFinalStr = ans.slice(0, 4);
				}
			} else {
				localSetText = setText.replace(/[^\d.]/g, '');
				arr = localSetText.split(".");
				ans = arr.splice(0, 2).join('.') + arr.join('');
				localarr = ans.split(".");
				if (localarr.length > 1) {
					loaclFinalStr = localarr[0].slice(0, 4) + "." + localarr[1].slice(0, 2);
				} else {
					loaclFinalStr = ans.slice(0, 4);
				}
			}
			oEvent.getSource().setValue(loaclFinalStr);
		},
		//////**Add Project Time** ////
		AddProjectTime_init: function(controler, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectTime", controler);
				// Attaching change event on input field of custom step input control 
				//AMU_US6 Ergonomie du Masque de saisies des heures
				//var oInputField = oFragment.getItems()[3].getItems()[2].getItems()[0].getItems()[1].getItems()[0];
				var oInputField = oFragment.getItems()[2].getItems()[2].getItems()[0].getItems()[1].getItems()[0];
				//AMU_US6 Ergonomie du Masque de saisies des heures
				oInputField.attachChange(controler.OnChangeHours, controler);
				oInputField.onfocusout = function(oEvent) {
					controler.formatDuration(oInputField);
				};
				container.addItem(oFragment);
				// oFragment.getItems()[2].getItems()[2].getItems()[1].onAfterRendering = this._comboKeyboardDisable;
				// oFragment.getItems()[3].getItems()[2].getItems()[3].onAfterRendering = this._comboKeyboardDisable;
				
				//AMU_US6 Ergonomie du Masque de saisies des heures
				//oFragment.getItems()[4].getItems()[0].onAfterRendering = this._comboKeyboardDisable;
				oFragment.getItems()[3].getItems()[0].onAfterRendering = this._comboKeyboardDisable;
				//AMU_US6 Ergonomie du Masque de saisies des heures
				
				//ERA_US1
				var sKey = "hours";
				var position = controler.getView().byId('addTimeTab').getItems()[0].getItems().length - 1;

				if (position >= 1) {
					var oSelectFilters = this.getValueHelpParams(controler.employees);
					this.setSelectTypeBinding(sKey, oSelectFilters, controler, position);
				}
				//ERA_US1

			}

		},
		AddProjectEquipment_init: function(controler, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectEquipment", controler);
				container.addItem(oFragment);
				// Attaching change event on input field of custom step input control 
				var oInputField = oFragment.getItems()[2].getItems()[3].getItems()[1].getItems()[0];
				oInputField.attachChange(controler.OnEquipmentChangeQuanity, controler);
				oInputField.onfocusout = function(oEvent) {
					controler.formatDuration(oInputField);
				};

			}

		},
		AddProjectBonus_init: function(controler, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectBonus", controler);
				container.addItem(oFragment);
				oFragment.getItems()[2].getItems()[0].getItems()[0].getItems()[1].onAfterRendering = this._comboKeyboardDisable;
			}
			//ERA_US1
			var sKey = "bonus";
			var position = controler.getView().byId('addBonusTab').getItems()[0].getItems().length - 1;

			if (position >= 1) {
				var oSelectFilters = this.getValueHelpParams(controler.employees);
				this.setSelectTypeBinding(sKey, oSelectFilters, controler, position);
			}
			//ERA_US1
		},

		AddProjectKm_init: function(controller, container, addNew) {
			if (addNew) {
				var oFragment = sap.ui.xmlfragment(controller.getView().getId(), "com.vinci.timesheet.admin.view.AddProjectKM", controller);
				container.addItem(oFragment);
				var oAddKMFrgmt = container.getItems()[0].getItems()[2].getItems()[2].getItems()[0];
				var oComboBox = oAddKMFrgmt.getItems()[1].getItems()[4];
				oComboBox.onAfterRendering = this._comboKeyboardDisable;

				// Attaching change event on input field of custom step input control 
				var oInputField = oFragment.getItems()[2].getItems()[2].getItems()[0].getItems()[1].getItems()[0].getItems()[1].getItems()[0];
				oInputField.attachChange(controller.OnChangeKMHours, controller);
				oInputField.onfocusout = function(oEvent) {
					controller.formatDuration(oInputField);
				};
				//ERA_US1
				var sKey = "KM";
				var position = controller.getView().byId('addKM').getItems()[0].getItems().length - 1;

				if (position >= 1) {
					var oSelectFilters = this.getValueHelpParams(controller.employees);
					this.setSelectTypeBinding(sKey, oSelectFilters, controller, position);
				}
				//ERA_US1

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
			//+ERA_PRD24-Change the decimal place before calculation
			var sep = "";
			if (currentTotalhrs) {
				if (currentTotalhrs.toString().indexOf(",") !== -1) {
					sep = ",";
					currentTotalhrs = currentTotalhrs.toString().replace(/[,]/g, '.');
				} else {
					sep = ".";
				}
			}
			//+ERA_PRD24
			var newTotalhrs = currentTotalhrs - currentValue;
			//+ERA_PRD24 - change value of total hours to put the correct seperator
			//this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			if (sep === ",") {
				newTotalhrs = newTotalhrs.toString().replace(/[.]/g, ',');
			}
			//Change back to the correct decimal place to display
			this.AddUpdatetimeModel.setProperty("/totalhrs", formatter.formatHourEquip(newTotalhrs));
			//+ERA_PRD24			
			this.AddProjectTime_destroy(sourcePanel);

			if (container.getItems().length === 1) {
				container.getItems()[0].getItems()[2].getItems()[0].setVisible(true);
			} else {
				container.getItems()[0].getItems()[2].getItems()[0].setVisible(false);
			}
		},
		AddProjectTime_OnBonusDelete: function(oEvent, container) {
			var source = oEvent.getSource();
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			container.removeItem(sourcePanel);
			sourcePanel.destroy(true);
			if (container.getItems().length === 1) {
				container.getItems()[0].getItems()[1].getItems()[0].setVisible(true);
			} else {
				container.getItems()[0].getItems()[1].getItems()[0].setVisible(false);
			}
		},
		AddProjectTime_OnKmDelete: function(oEvent, container, oController) {
			var source = oEvent.getSource();
			var sourcePanel = this.AddProjectKM__getOwnFrameObject(source);
			var oAddKMBtn = oController.byId("addKMButton");
			container.removeItem(sourcePanel);
			sourcePanel.destroy(true);
			if (container.getItems().length === 1) {
				if (oAddKMBtn) {
					oAddKMBtn.setVisible(false);
				} else {
					container.getParent().getItems()[1].getItems()[0].setVisible(false);
				}
				//container.getParent().getItems()[1].getItems()[0].setVisible(false);
			} else if (container.getItems().length > 1) {
				//container.getParent().getItems()[1].getItems()[0].setVisible(false);
				if (oAddKMBtn) {
					oAddKMBtn.setVisible(false);
				} else {
					container.getParent().getItems()[1].getItems()[0].setVisible(false);
				}
			} else {
				//container.getParent().getItems()[1].getItems()[0].setVisible(true);
				if (oAddKMBtn) {
					oAddKMBtn.setVisible(true);
				} else {
					container.getParent().getItems()[1].getItems()[0].setVisible(true);
				}
			}
		},
		AddProjectTime_OnchangeTimeSelection: function(oEvent) {

			var buttons = oEvent.getSource().getButtons();
			this.warning = true;

			var source = oEvent.getSource();
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var newValue = 0;

			// VBox containing labels + time picker and step input for duration input
			
			//AMU_US6 Ergonomie du Masque de saisies des heures
			//var selecthrsCombo = source.getParent().getParent().getParent().getItems()[3];
			var selecthrsCombo = source.getParent().getParent().getParent().getItems()[2];
			//AMU_US6 Ergonomie du Masque de saisies des heures
			
			// HBox containing labels + time picker and step input for duration input
			//var timepicker = selecthrsCombo.getItems()[2].getItems()[0].getItems()[1].getItems()[0];
			var timepickerTo = selecthrsCombo.getItems()[2].getItems()[2];

			if (oEvent.getParameter("selectedIndex") === 1) {
				//newValue = 0;
				buttons[0].setEnabled(true);
				buttons[1].setEnabled(false);
				// allDayCombo.setVisible(false);
				selecthrsCombo.setVisible(true);
				//timepicker.setValue("0.00");
				timepickerTo.setEnabled(false);

			} else { // For all day Selection
				// allDayCombo.setVisible(true);
				selecthrsCombo.setVisible(false);
				buttons[0].setEnabled(false);
				buttons[1].setEnabled(true);

			}
			// for IE 
			if (sap.ui.Device.browser.name === sap.ui.Device.browser.BROWSER.INTERNET_EXPLORER) {
				var localComboKey = undefined;
				try {
					localComboKey = selecthrsCombo.getParent().getItems()[4].getItems()[0].getSelectedKey();
				} catch (e) {
					localComboKey = undefined;
				}
				if (localComboKey !== undefined && localComboKey !== null && localComboKey !== "") {
					selecthrsCombo.getParent().getItems()[4].getItems()[0].setPlaceholder("");
				}
			}
			var currentValue = sourcePanel.getCustomData()[0].getValue();
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var newTotalhrs = currentTotalhrs + deltahrs;
			//this.AddUpdatetimeModel.setProperty('/totalhrs', newTotalhrs);
			this.AddUpdatetimeModel.setProperty("/totalhrs", formatter.formatHour(newTotalhrs));
			sourcePanel.getCustomData()[0].setValue(newValue);

		},

		AddProjectTime_OnChangeHours: function(oEvent) {
			var source = oEvent.getSource();
			this.warning = true;
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);

			var newValue = oEvent.getParameter("value");
			var sep = "";
			if (newValue) {
				if (newValue.toString().indexOf(",") !== -1) {
					sep = ",";
					newValue = newValue.toString().replace(/[,]/g, '.');
				} else {
					sep = ".";
				}
			}

			var currentValue = sourcePanel.getCustomData()[0].getValue();
			if (currentValue) {
				currentValue = currentValue.toString().replace(/[,]/g, '.');
			}
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty("/totalhrs");
			if (currentTotalhrs) {
				currentTotalhrs = currentTotalhrs.toString().replace(/[,]/g, '.');
			}
			var newTotalhrs = Number(currentTotalhrs) + Number(deltahrs);
			if (sep === ",") {
				newTotalhrs = newTotalhrs.toString().replace(/[.]/g, ',');
			}
			this.AddUpdatetimeModel.setProperty("/totalhrs", formatter.formatHour(newTotalhrs));
			sourcePanel.getCustomData()[0].setValue(newValue);
		},

		AddProjectTime_OnEquipmentChangeQuanity: function(oEvent) {

			var source = oEvent.getSource();
			this.warning = true;
			var sourcePanel = this.AddProjectTime__getOwnFrameObject(source);
			var newValue = oEvent.getParameter("value");

			var sep = "";
			if (newValue) {
				if (newValue.toString().indexOf(",") !== -1) {
					sep = ",";
					newValue = newValue.toString().replace(/[,]/g, '.');
				} else {
					sep = ".";
				}
			}
			var currentValue = sourcePanel.getCustomData()[0].getValue();

			if (currentValue) {
				//currentValue = currentValue.toString().replace(/[,]/g, '.',);
				currentValue = currentValue.toString().replace(/\s/g, '');
			}

			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			if (currentTotalhrs) {
				currentTotalhrs = currentTotalhrs.toString().replace(/[,]/g, '.');
			}

			var newTotalhrs = Number(currentTotalhrs) + Number(deltahrs);
			if (sep === ",") {
				newTotalhrs = newTotalhrs.toString().replace(/[.]/g, ',');
			}
			//this.AddUpdatetimeModel.setProperty('/totalhrs', formatter.formatHour(newTotalhrs));
			this.AddUpdatetimeModel.setProperty('/totalhrs', formatter.formatHourEquip(newTotalhrs));
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
			if (currentValue) {
				currentValue = Number(currentValue.toString().replace(/[,]/g, '.'));
			}
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var sep = ".";
			if (currentTotalhrs && currentTotalhrs.toString().indexOf(",") > 0) {
				currentTotalhrs = Number(currentTotalhrs.toString().replace(/[,]/g, '.'));
				sep = ",";
			}
			var newTotalhrs = currentTotalhrs + deltahrs;
			newTotalhrs = newTotalhrs.toString().replace(/[.]/g, sep);
			this.AddUpdatetimeModel.setProperty('/totalhrs', formatter.formatHour(newTotalhrs));
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
			if (currentValue) {
				currentValue = Number(currentValue.toString().replace(/[,]/g, '.'));
			}
			var deltahrs = newValue - currentValue;
			var currentTotalhrs = this.AddUpdatetimeModel.getProperty('/totalhrs');
			var sep = ".";
			if (currentTotalhrs && currentTotalhrs.toString().indexOf(",") > 0) {
				currentTotalhrs = Number(currentTotalhrs.toString().replace(/[,]/g, '.'));
				sep = ",";
			}
			var newTotalhrs = currentTotalhrs + deltahrs;
			newTotalhrs = newTotalhrs.toString().replace(/[.]/g, sep);
			this.AddUpdatetimeModel.setProperty('/totalhrs', formatter.formatHour(newTotalhrs));
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
		AddProjectKM__getOwnFrameObject: function(source) {
			var parent = source.getParent().getParent();
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
			// StepInput fragment
			var source = oEvent.getSource().getParent().getParent();
			this.warning = true;
			var sourcePanel = this.AddProjectKM__getOwnFrameObject(source);
			var newValue = oEvent.getParameter("value");
			newValue = newValue.toString().replace(/[,]/g, '.');
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
			var sourcePanel = this.AddProjectKM__getOwnFrameObject(source);
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
			var sourcePanel = this.AddProjectKM__getOwnFrameObject(source);
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

			var oIcnTabBar = controler.byId('idIconTabBarMulti');
			var sKey = "";
			if (oIcnTabBar) {
				sKey = oIcnTabBar.getSelectedKey();
			}

			if (this.equipment) {
				odata = {
					totalhrs: 0,
					visibleHrs: false,
					visibleDailyAllow: false,
					visibleOvernight: false,
					visibleBonus: false,
					visibleKM: false,
					visibleAbsence: false,
					visibleAbsence1: false,
					visibleAbsence2: false,
					visibleAbsence3: false,
					visibleEquipment: true,
					visibleSummary: false,
					visibleProjectOptional: false,
					visibleProjMandatoryTxt: false,
					visibleManagerTxt: true, //ERA_PRD18
					newTime: true,
					newBonus: true,
					duration: userPrefModel.getProperty('/durationFlag')
				};
			} else {
				odata = {
					totalhrs: 0,
					visibleHrs: true,
					visibleDailyAllow: userPrefModel.getProperty('/defaultIPD'),
					visibleOvernight: userPrefModel.getProperty('/defaultOvernight'),
					visibleBonus: userPrefModel.getProperty('/defaultBonus'),
					visibleKM: userPrefModel.getProperty('/defaultKM'),
					visibleAbsence: userPrefModel.getProperty('/defaultAbsence'),
					visibleAbsence1: true,
					visibleAbsence2: false,
					visibleAbsence3: false,
					visibleEquipment: false,
					visibleSummary: false,
					visibleProjectOptional: false,
					visibleProjMandatoryTxt: ((sKey === "overnight" || sKey === "KM" || sKey === "bonus") ? false : true),
					visibleManagerTxt: true, //ERA_PRD18
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

			var footerData;
			this.warning = false;
			this.currentView = 'hours';
			var items = container.getItems();
			if (items.length > 0) {
				items[0].setVisible(false);
			}
			container.addItem(oFragment);
			controler.getView().byId('AllowanceZoneType').onAfterRendering = this._comboKeyboardDisable;
			controler.getView().byId('AbsCat').onAfterRendering = this._comboKeyboardDisable;
			controler.getView().byId('AccAllowanceType').onAfterRendering = this._comboKeyboardDisable;
			this.oDataModel = odataModel;
			this.employees = employees;

			if (type === 'New') {

				var oSelectFilters = this.getValueHelpParams(this.employees);
				//ERA_US1 Pointages par domaine du personnel
				sKey = "hours";
				//ERA_US1 Pointages par domaine du personnel
				this.setSelectTypeBinding(sKey, oSelectFilters, controler);

				this.warning = false;
				this.currentView = "hours";
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
				odata.visibleOvernight = false;
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

                        //AMU_US6 Ergonomie du Masque de saisies des heures
                        //getting the selected radio button
                        //var source = controler.getView().byId('addTimeTab').getItems()[0].getItems()[1].getItems()[2].getItems()[2].getItems()[0];
						var source = controler.getView().byId('addTimeTab').getItems()[0].getItems()[1].getItems()[1].getItems()[1].getItems()[0];
					    //AMU_US6 Ergonomie du Masque de saisies des heures
						var buttons = source.getButtons();
						
						//AMU_US6 Ergonomie du Masque de saisies des heures
						//getting the time picker
						//var selecthrsCombo = source.getParent().getParent().getParent().getItems()[3];
						//var projectView = controler.getView().byId('addTimeTab').getItems()[0].getItems()[1].getItems()[2].getItems()[1];
						var selecthrsCombo = source.getParent().getParent().getParent().getItems()[2];
						var projectView = controler.getView().byId('addTimeTab').getItems()[0].getItems()[1].getItems()[1].getItems()[0].getItems()[1];
						//AMU_US6 Ergonomie du Masque de saisies des heures
					
						var projectContext = "/ProjectSet(ProjectId='" + odataModel.getProperty(updateKeyPath).ProjectID + "',ApplicationName='TEAMLEAD')";
						projectView.bindElement(projectContext);

						buttons[0].setEnabled(true);
						buttons[1].setEnabled(false);
						
						//Binding of value help categories
						oSelectFilters = this.getValueHelpParams(this.employees, updateKeyPath);
						//ERA_US1 Pointages par domaine du personnel
						sKey = "hours";
						//ERA_US1 Pointages par domaine du personnel
						this.setSelectTypeBinding(sKey, oSelectFilters, controler);

						selecthrsCombo.setVisible(true);

						break;
					case 'IPD':
						odata.visibleDailyAllow = true;
						odata.visibleProjMandatoryTxt = true;

						//controler.getView().byId('AllowanceZoneType').getBinding("items").resume();
						//Binding of value help categories
						oSelectFilters = this.getValueHelpParams(this.employees, updateKeyPath);
						//ERA_US1 Pointages par domaine du personnel
						sKey = "allowance";
						//ERA_US1 Pointages par domaine du personnel
						this.setSelectTypeBinding(sKey, oSelectFilters, controler);

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
							error: function(error) {}
						});
						break;
					case 'OVERNIGHT':
						odata.visibleOvernight = true;
						odata.visibleProjMandatoryTxt = false;

						//Binding of value help categories
						oSelectFilters = this.getValueHelpParams(this.employees, updateKeyPath);
						//ERA_US1 Pointages par domaine du personnel
						sKey = "overnight";
						//ERA_US1 Pointages par domaine du personnel
						this.setSelectTypeBinding(sKey, oSelectFilters, controler);

						// Load items for AccAllowance Type drop down list
						//controler.getView().byId('AccAllowanceType').getBinding("items").resume();
						controler.getView().byId('AccAllowanceType').setPlaceholder("");

						// Binding current project of workday item to projectView
						var projectId = odataModel.getProperty(updateKeyPath).ProjectID;
						var projectView = controler.getView().byId('addAccAllowance').getItems()[0].getItems()[1].getItems()[1];
						if (projectId !== null && projectId !== '' && projectId !== undefined) {
							var projectContext = "/ProjectSet(ProjectId='" + projectId + "',ApplicationName='TEAMLEAD')";
							projectView.bindElement(projectContext);
						} else if (projectId === '') {
							projectView.getItems()[0].setText("");
						}

						// Select correct segmented button for current workday item
						var oSgmtButton = controler.getView().byId("overnightInd");
						if (oSgmtButton) {
							if (odataModel.getProperty(updateKeyPath).MealIndicator) {
								oSgmtButton.setSelectedKey("0");
							} else if (odataModel.getProperty(updateKeyPath).JourneyIndicator) {
								oSgmtButton.setSelectedKey("1");
							} else if (odataModel.getProperty(updateKeyPath).TransportIndicator) {
								oSgmtButton.setSelectedKey("2");
							} else {
								oSgmtButton.setSelectedKey("0");
							}
						}

						break;
					case 'KM':
						odata.visibleKM = true;
						odata.visibleProjMandatoryTxt = false;

						var oVbox = controler.getView().byId("addKM").getItems()[0];
						oVbox.removeAllItems();
						this.AddProjectKm_init(controler, oVbox, true);
						var oAddKMFrgmt = oVbox.getItems()[0].getItems()[2].getItems()[2].getItems()[0];
						//var oComboBox = oAddKMFrgmt.getItems()[1].getItems()[4];
						//oComboBox.getBinding("items").resume();

						//Binding of value help categories
						oSelectFilters = this.getValueHelpParams(this.employees, updateKeyPath);
						//ERA_US1 Pointages par domaine du personnel
						sKey = "KM";
						//ERA_US1 Pointages par domaine du personnel
						this.setSelectTypeBinding(sKey, oSelectFilters, controler);

						projectView = oVbox.getItems()[0].getItems()[2].getItems()[1];
						projectContext = "/ProjectSet(ProjectId='" + odataModel.getProperty(updateKeyPath).ProjectID +
							"',ApplicationName='TEAMLEAD')";
						projectId = odataModel.getProperty(updateKeyPath).ProjectID;
						if (projectId !== "" && projectId !== null && projectId !== undefined) {
							projectView.bindElement(projectContext);
						} else {
							projectView.getItems()[1].getItems()[0].setText("");
						}

						break;
					case 'ABSENCE':
						odata.visibleAbsence = true;
						break;
					case 'PREMIUM':
						odata.visibleBonus = true;
						odata.visibleProjMandatoryTxt = false;
						//Project name does not display-SelectProjectWithDelete fragment
						var projectId = odataModel.getProperty(updateKeyPath).ProjectID;
						//ERA_PRD18
						if (type === 'Update') {
							if (projectId !== null || projectId === "" || projectId === undefined) {
								odata.visibleManagerTxt = false;
							}
						}
						//"+ERA_PRD18
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

						//selectbnsCombo.getBinding("items").resume();

						//Binding of value help categories
						oSelectFilters = this.getValueHelpParams(this.employees, updateKeyPath);
						//ERA_US1 Pointages par domaine du personnel
						sKey = "bonus";
						//ERA_US1 Pointages par domaine du personnel
						this.setSelectTypeBinding(sKey, oSelectFilters, controler);

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

			// For SelectProjectWithDelete fragment, label for mandatory project is displayed for IPD 
			// and not for overnight mask entry
			var oAddTimeModel = controler.getModel("AddTime");
			if (oAddTimeModel) {
				oAddTimeModel.setProperty("/visibleProjMandatoryTxt", true);
			}

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
				//Binding of value help categories
				var oSelectFilters = this.getValueHelpParams(this.employees);
				this.setSelectTypeBinding(key, oSelectFilters, controler);

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

			} else if (key === 'overnight') {
				//Binding of value help categories
				var oSelectFilters = this.getValueHelpParams(this.employees);
				this.setSelectTypeBinding(key, oSelectFilters, controler);
				// Combo box
				oView.byId('AccAllowanceType').setSelectedKey(null);
				// Segmented buttons
				oView.byId('overnightInd').setSelectedButton(null);

				// Project VBox
				oView.byId('AccAllowanceProject').getItems()[1].getItems()[0].unbindElement();
				oView.byId('AccAllowanceProject').getItems()[1].getItems()[0].setVisible(false); // Label
				oView.byId('AccAllowanceProject').getItems()[1].getItems()[1].setVisible(true); // ownIntialButton
				oView.byId('AccAllowanceProject').getItems()[1].getItems()[2].setVisible(false);
				oView.byId('AccAllowanceProject').getItems()[1].getItems()[3].setVisible(false);
				// Setting label visibility to false
				if (oAddTimeModel) {
					oAddTimeModel.setProperty("/visibleProjMandatoryTxt", false);
				}

			} else if (key === 'absence') {
				if (this.oEmpsModel.getData().length === 1) {
					oView.byId('AbsEmployee').setEnabled(false);
				} else {
					oView.byId('AbsEmployee').setEnabled(true);
				}

				//Binding of value help categories
				var oSelectFilters = this.getValueHelpParams(this.employees);
				this.setSelectTypeBinding(key, oSelectFilters, controler);

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

				//Binding of value help categories
				var oSelectFilters = this.getValueHelpParams(this.employees);
				this.setSelectTypeBinding(key, oSelectFilters, controler);

			} else if (key === 'bonus') {
				//	if(oView.byId("addBonusTab").getItems()[0].getItems().length === 1) {
				var container = oView.byId("addBonusTab").getItems()[0];
				var header2 = container.getItems()[0];
				container.removeAllItems();
				container.insertItem(header2);
				if (oAddTimeModel) {
					oAddTimeModel.setProperty("/visibleProjMandatoryTxt", false);
					//+ERA_PRD18
					oAddTimeModel.setProperty("/visibleManagerTxt", false);
					//+ERA_PRD18
				}
				var oFragment = sap.ui.xmlfragment(oView.getId(), "com.vinci.timesheet.admin.view.AddProjectBonus", controler);
				container.addItem(oFragment);

				//Binding of value help categories
				var oSelectFilters = this.getValueHelpParams(this.employees);
				this.setSelectTypeBinding(key, oSelectFilters, controler);
				oFragment.getItems()[2].getItems()[0].getItems()[0].getItems()[1].onAfterRendering = this._comboKeyboardDisable;
				//	}
			} else if (key === 'KM') {
				var oVbox = oView.byId("addKM").getItems()[0];
				oVbox.removeAllItems();
				// Setting label visibility to false
				if (oAddTimeModel) {
					oAddTimeModel.setProperty("/visibleProjMandatoryTxt", false);
					//+ERA_PRD18
					oAddTimeModel.setProperty("/visibleManagerTxt", false);
					//+ERA_PRD18
				}

				this.AddProjectKm_init(controler, oVbox, this.AddUpdatetimeModel.getData().newTime);
				//Binding of value help categories
				var oSelectFilters = this.getValueHelpParams(this.employees);
				this.setSelectTypeBinding(key, oSelectFilters, controler);
			}
		},
		AddUpdatetime_onAllowanceIndicator: function(oEvent) {
			this.warning = true;
		},

		AddUpdatetime_onOvernightIndicator: function(oEvent) {
			this.warning = true;
		},

		AddUpdatetime_OnaddNewHourPress: function(controller) {
			var addNew = this.AddUpdatetimeModel.getData().newTime;
			this.AddProjectTime_init(controller, controller.getView().byId('addTimeTab').getItems()[0], addNew);
			if (controller.getView().byId('addTimeTab').getItems()[0].getItems().length === 1) {
				controller.getView().byId('addTimeTab').getItems()[0].getItems()[0].getItems()[2].getItems()[0].setVisible(true);
			} else if (controller.getView().byId('addTimeTab').getItems()[0].getItems().length > 1) {
				controller.getView().byId('addTimeTab').getItems()[0].getItems()[0].getItems()[2].getItems()[0].setVisible(false);
			} else {
				controller.getView().byId('addTimeTab').getItems()[0].getItems()[0].getItems()[2].getItems()[0].setVisible(true);
			}
		},
		AddUpdatetime_OnaddNewEquipmentPress: function(controller) {
			var addNew = this.AddUpdatetimeModel.getData().newTime;
			this.AddProjectEquipment_init(controller, controller.getView().byId('addEquipmentTab').getItems()[0], addNew);
			if (controller.getView().byId('addEquipmentTab').getItems()[0].getItems().length === 1) {
				controller.getView().byId('addEquipmentTab').getItems()[0].getItems()[0].getItems()[2].getItems()[0].setVisible(true);
			} else if (controller.getView().byId('addEquipmentTab').getItems()[0].getItems().length > 1) {
				controller.getView().byId('addEquipmentTab').getItems()[0].getItems()[0].getItems()[2].getItems()[0].setVisible(false);
			} else {
				controller.getView().byId('addEquipmentTab').getItems()[0].getItems()[0].getItems()[2].getItems()[0].setVisible(true);
			}
		},
		AddUpdatetime_OnaddNewBonusPress: function(controller) {
			var addNew = this.AddUpdatetimeModel.getData().newBonus;
			this.AddProjectBonus_init(controller, controller.getView().byId('addBonusTab').getItems()[0], addNew);
			if (controller.getView().byId('addBonusTab').getItems()[0].getItems().length === 1) {
				controller.getView().byId('addBonusTab').getItems()[0].getItems()[0].getItems()[1].getItems()[0].setVisible(true);
			} else if (controller.getView().byId('addBonusTab').getItems()[0].getItems().length > 1) {
				controller.getView().byId('addBonusTab').getItems()[0].getItems()[0].getItems()[1].getItems()[0].setVisible(false);
			} else {
				controller.getView().byId('addBonusTab').getItems()[0].getItems()[0].getItems()[1].getItems()[0].setVisible(true);
			}
		},
		AddUpdatetime_OnaddNewKmPress: function(controller) {
			var addNew = this.AddUpdatetimeModel.getData().newTime;
			var container = controller.getView().byId("addKM").getItems()[0];
			this.AddProjectKm_init(controller, container, addNew);

			/*if (container.getItems().length === 1) {
				container.getItems()[0].getItems()[3].getItems()[0].setVisible(false);
			} else if (container.getItems().length > 1) {
				container.getItems()[0].getItems()[3].getItems()[0].setVisible(false);
			} else {
				container.getItems()[0].getItems()[3].getItems()[0].setVisible(true);
			}*/

			if (container.getItems().length === 1) {
				container.getParent().getItems()[2].getItems()[0].setVisible(false);
			} else if (container.getItems().length > 1) {
				container.getParent().getItems()[2].getItems()[0].setVisible(false);
			} else {
				container.getParent().getItems()[2].getItems()[0].setVisible(true);
			}

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
		AddUpdatetime_handleAccAllowanceZoneTypeLoadItems: function(oEvent) {
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
			var startDate = view.byId('AbsStartDate');
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
			var bUpdate = true;

			if (selectedTab === 'hours') {
				var tab = oView.byId('addTimeTab').getItems()[0].getItems()[1];
				var startTime = '00:00';
				var endTime = '00:00';
				var projectID;
				try {

					// var hrType = tab.getItems()[2].getItems()[2].getItems()[1].getSelectedKey();
			        //AMU_US6 Ergonomie du Masque de saisies des heures
			        //var hrType = tab.getItems()[4].getItems()[0].getSelectedKey();
					// var projectBindingPath = tab.getItems()[2].getItems()[1].getItems()[0].getBindingContext().getPath();
					// var fullDayindex = tab.getItems()[2].getItems()[2].getItems()[0].getSelectedIndex();
			        
					var hrType = tab.getItems()[3].getItems()[0].getSelectedKey();
					var projectBindingPath = tab.getItems()[1].getItems()[0].getItems()[1].getItems()[0].getBindingContext().getPath();
					var fullDayindex = tab.getItems()[1].getItems()[1].getItems()[0].getSelectedIndex();
					 //AMU_US6 Ergonomie du Masque de saisies des heures
					 
					if (this.AddUpdatetimeModel.getData().duration) {
						
						//AMU_US6 Ergonomie du Masque de saisies des heures
						// startTime = tab.getItems()[3].getItems()[2].getItems()[1].getValue();
						// endTime = tab.getItems()[3].getItems()[2].getItems()[2].getValue();
						
						startTime = tab.getItems()[2].getItems()[2].getItems()[1].getValue();
						endTime = tab.getItems()[2].getItems()[2].getItems()[2].getValue();
						//AMU_US6 Ergonomie du Masque de saisies des heures
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
			} else if (selectedTab === 'overnight') {
				// Get Item Data from view for Accommodation Allowances
				var oSegmentedButton = oView.byId('overnightInd');
				var sKey = oSegmentedButton.getSelectedKey();
				var jobsite = false;
				var siteChanges = false;
				var wkndJobsite = false;

				switch (sKey) {
					case ("0"):
						jobsite = true;
						break;
					case ("1"):
						siteChanges = true;
						break;
					case ("2"):
						wkndJobsite = true;
						break;
				}

				var zonetype = oView.byId('AccAllowanceType').getSelectedKey();
				var zoneName = oView.byId('AccAllowanceType').getValue();
				if (zoneName === undefined || zoneName === "" || zoneName === null) {
					//MessageBox.alert("Zone type is not selected");
					MessageBox.alert(this.i18nModel.getText("zoneTypeIsNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					return;
				}

				var allwProjectID = null;
				try {
					var allwProject = oView.byId('AccAllowanceProject').getItems()[1].getItems()[0].getBindingContext().getPath();
					allwProjectID = oView.getModel().getProperty(allwProject).ProjectId;
				} catch (err) {
					allwProjectID = "";
				}
				if (allwProjectID === undefined || allwProjectID === null) {
					allwProjectID = "";
				}

				workDayItem = {
					"ProjectID": allwProjectID,
					"EntryType": "OVERNIGHT",
					"ZoneType": zonetype,
					"ZoneName": zoneName,
					"MealIndicator": jobsite,
					"JourneyIndicator": siteChanges,
					"TransportIndicator": wkndJobsite
				};
			} else if (selectedTab === 'bonus') {
				var bnstab = oView.byId('addBonusTab').getItems()[0].getItems()[1];
				var bnsType = bnstab.getItems()[2].getItems()[0].getItems()[0].getItems()[1].getSelectedKey();
				var bnsDesc = bnstab.getItems()[2].getItems()[0].getItems()[0].getItems()[1]._getSelectedItemText();
				var bnsQty = bnstab.getItems()[2].getItems()[0].getItems()[1].getItems()[1].getValue();
				var bnsProjectBindingPath = bnstab.getItems()[2].getItems()[2].getItems()[0].getBindingContext().getPath();
				var bnsProjectID = oView.getModel().getProperty(bnsProjectBindingPath).ProjectId;
				bnsProjectID = (bnsProjectID === undefined || bnsProjectID === null) ? "" : bnsProjectID;
				workDayItem = {
					"ProjectID": bnsProjectID,
					"Hours": bnsQty.toString(),
					"EntryTypeCatId": bnsType,
					"AllowancesName": bnsDesc
				};
			} else if (selectedTab === 'KM') {
				// Get Item Data from view for KM Hours
				var kmtab = oView.byId('addKM').getItems()[0].getItems()[0];
				var startTime = '000000';
				var endTime = '000000';
				var hrs = "0";

				var kmContainer = kmtab.getItems()[2].getItems()[2].getItems()[0];
				var kmprojectID = undefined;
				var kmhrType = undefined;
				var oTxtArea = kmtab.getItems()[2].getItems()[3].getItems()[0].getContent()[0];

				if (this.AddUpdatetimeModel.getData().duration) {
					startTime = kmContainer.getItems()[1].getItems()[1].getValue();
					endTime = kmContainer.getItems()[1].getItems()[2].getValue();
				} else {
					if (kmContainer.data('hrs')) {
						hrs = kmContainer.data('hrs').toString();
					} else {
						hrs = "";
					}
				}

				var KMNumber = kmContainer.getItems()[1].getItems()[3].getValue();
				kmhrType = kmContainer.getItems()[1].getItems()[4].getSelectedKey();
				var kmprojectBindingPath = kmtab.getItems()[2].getItems()[1].getItems()[1].getItems()[0].getBindingContext().getPath();
				kmprojectID = oView.getModel().getProperty(kmprojectBindingPath).ProjectId;

				// If front-end validation should be implemented
				/*var kmhrTypeEmpty = (kmhrType === "" || kmhrType === undefined || kmhrType === null);
				var startTimeEmpty = (startTime === "" || startTime === undefined || startTime === null);
				var endTimeEmpty = (endTime === "" || endTime === undefined || endTime === null);
				var KMNumberEmpty = (KMNumber === "" || KMNumber === undefined || KMNumber === null);
				var hrsEmpty = (hrs === "" || hrs === undefined || hrs === null);
				
				
				if (KMNumberEmpty && (startTimeEmpty || endTimeEmpty)) {
					MessageBox.alert(this.i18nModel.getText("kmNumberOrkmTimeNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					bUpdate = false;
				}  else if (KMNumberEmpty && hrsEmpty) {
					MessageBox.alert(this.i18nModel.getText("kmNumberOrkmTimeNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					bUpdate = false;
				} else if (kmhrTypeEmpty) {
					MessageBox.alert(this.i18nModel.getText("kmTypeIsNotSelected"));
					ctype.setBusy(false);
					rButton.setEnabled(true);
					bUpdate = false;
				}*/

				//if(bUpdate) {
				workDayItem = {
					"ProjectID": kmprojectID,
					"Hours": hrs,
					"EntryTypeCatId": kmhrType,
					"KMNumber": KMNumber,
					"Comment": oTxtArea.getValue(),
					"StartTime": startTime,
					"EndTime": endTime
				};
				//}

			}

			if (bUpdate) {
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
			}
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
					var empAU = this.employees[l].analyticalUnit;
					for (var j = 0; j < this.employees[l].Days.length; j++) {
						var tab = oView.byId('addEquipmentTab').getItems()[0].getItems();
						for (var k = 1; k < tab.length; k++) {
							var projectID = undefined;
							//var filledHrs = tab[k].getItems()[2].getItems()[2].getItems()[1].getSelectedKey();
							//var fullDayindex = tab[k].getItems()[2].getItems()[2].getItems()[0].getSelectedIndex();
							try {
								var projectBindingPath = tab[k].getItems()[2].getItems()[1].getItems()[0].getBindingContext().getPath();
								projectID = oView.getModel().getProperty(projectBindingPath).ProjectId;
							} catch (e) {
								projectID = undefined;
							}
							if (projectID === undefined) {
								MessageBox.alert(this.i18nModel.getText("projectNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
							var localHours = tab[k].getCustomData()[0].getValue();
							if (localHours === null || localHours === undefined) {
								localHours = tab[k].getItems()[2].getItems()[3].getValue();
							}
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
								"AnalyticalUnit": empAU,
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
				var dlsactiveS = false;
				var dlsactiveE = false;
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
				if (startDate.dst()) {
					dlsactiveS = true;
				}
				if (endDate.dst()) {
					dlsactiveE = true;
				}
				if (dlsactiveS === true) {
					var dlsTZOffsetMsStart = startDate.dstdifference() * 60 * 1000;
				} else {
					dlsTZOffsetMsStart = 0;
				}
				if (dlsactiveE === true) {
					var dlsTZOffsetMsEnd = endDate.dstdifference() * 60 * 1000;
				} else {
					dlsTZOffsetMsEnd = 0;
				}
				// if (TZOffsetMs < 0) {
				var localStartDate = new Date(startDate.getTime() - TZOffsetMs - dlsTZOffsetMsStart);
				var localEndDate = new Date(endDate.getTime() - TZOffsetMs - dlsTZOffsetMsEnd);
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

              ////Hours ///
				if (selectedTab === 'hours') {
					tab = oView.byId('addTimeTab').getItems()[0].getItems();
					for (k = 1; k < tab.length; k++) {
						var startTime = '000000';
						var endTime = '000000';
						try {
							projectID = undefined;
							//var hrType = tab[k].getItems()[2].getItems()[2].getItems()[1].getSelectedKey();
							
							//AMU_US6 Ergonomie du Masque de saisies des heures
							// var hrType = tab[k].getItems()[4].getItems()[0].getSelectedKey();
							// projectBindingPath = tab[k].getItems()[2].getItems()[1].getItems()[0].getBindingContext().getPath();
							// var fullDayindex = tab[k].getItems()[2].getItems()[2].getItems()[0].getSelectedIndex();
							var hrType = tab[k].getItems()[3].getItems()[0].getSelectedKey();
							projectBindingPath = tab[k].getItems()[1].getItems()[0].getItems()[1].getItems()[0].getBindingContext().getPath();
							var fullDayindex = tab[k].getItems()[1].getItems()[1].getItems()[0].getSelectedIndex();
							//AMU_US6 Ergonomie du Masque de saisies des heures
							
							if (this.AddUpdatetimeModel.getData().duration) {
								//AMU_US6 Ergonomie du Masque de saisies des heures
								// startTime = tab[k].getItems()[3].getItems()[2].getItems()[1].getValue();
								// endTime = tab[k].getItems()[3].getItems()[2].getItems()[2].getValue();
								
								startTime = tab[k].getItems()[2].getItems()[2].getItems()[1].getValue();
								endTime = tab[k].getItems()[2].getItems()[2].getItems()[2].getValue();
								//AMU_US6 Ergonomie du Masque de saisies des heures
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
							if (tab.length <= 2) {
								if (hrType === "")
									MessageBox.alert(this.i18nModel.getText("hrTypeNotSelected"));
								else if (projectID === undefined)
									MessageBox.alert(this.i18nModel.getText("projectNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							} else {
								continue;
							}
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
					for (var km = 0; km < kmtab.length; km++) {
						var startTime = '000000';
						var endTime = '000000';
						var hrs = "0";
						try {
							var kmContainer = kmtab[km].getItems()[2].getItems()[2].getItems()[0];
							var kmprojectID = undefined;
							var kmhrType = undefined;
							var oTxtArea = kmtab[km].getItems()[2].getItems()[3].getItems()[0].getContent()[0];

							if (this.AddUpdatetimeModel.getData().duration) {
								startTime = kmContainer.getItems()[1].getItems()[1].getValue();
								endTime = kmContainer.getItems()[1].getItems()[2].getValue();
							} else {
								if (kmContainer.data('hrs')) {
									hrs = kmContainer.data('hrs').toString();
								} else {
									hrs = "";
								}
							}

							var KMNumber = kmContainer.getItems()[1].getItems()[3].getValue();
							kmhrType = kmContainer.getItems()[1].getItems()[4].getSelectedKey();
							var kmprojectBindingPath = kmtab[km].getItems()[2].getItems()[1].getItems()[1].getItems()[0].getBindingContext().getPath();
							kmprojectID = oView.getModel().getProperty(kmprojectBindingPath).ProjectId;

							var kmhrTypeEmpty = (kmhrType === "" || kmhrType === undefined || kmhrType === null);
							var kmprojectIDEmpty = (kmprojectID === "" || kmprojectID === undefined || kmprojectID === null);
							var startTimeEmpty = (startTime === "" || startTime === undefined || startTime === null);
							var endTimeEmpty = (endTime === "" || endTime === undefined || endTime === null);
							var KMNumberEmpty = (KMNumber === "" || KMNumber === undefined || KMNumber === null);
							var hrsEmpty = (hrs === "" || hrs === undefined || hrs === null);

							if (kmprojectIDEmpty && kmhrTypeEmpty && KMNumberEmpty && startTimeEmpty && endTimeEmpty && hrsEmpty) {
								continue;
							} else if (KMNumberEmpty && (startTimeEmpty || endTimeEmpty)) {
								MessageBox.alert(this.i18nModel.getText("kmNumberOrkmTimeNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							} else if (KMNumberEmpty && hrsEmpty) {
								MessageBox.alert(this.i18nModel.getText("kmNumberOrkmTimeNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							} else if (kmhrTypeEmpty) {
								MessageBox.alert(this.i18nModel.getText("kmTypeIsNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
						} catch (err) {
							if (KMNumberEmpty && (startTimeEmpty || endTimeEmpty)) {
								MessageBox.alert(this.i18nModel.getText("kmNumberOrkmTimeNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							} else if (KMNumberEmpty && hrsEmpty) {
								MessageBox.alert(this.i18nModel.getText("kmNumberOrkmTimeNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							} else if (kmhrTypeEmpty) {
								MessageBox.alert(this.i18nModel.getText("kmTypeIsNotSelected"));
								ctype.setBusy(false);
								rButton.setEnabled(true);
								return;
							}
						}
						workDayItem = {
							"ProjectID": kmprojectID,
							"EntryType": "KM",
							"Hours": hrs,
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
							"Comment": oTxtArea.getValue()

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
							var oProjectContext = tabBns[k].getItems()[2].getItems()[2].getItems()[0].getBindingContext();
							var bnsProjectBindingPath = "";
							var bnsProjectID = "";
							if (oProjectContext) {
								bnsProjectBindingPath = oProjectContext.getPath();
								bnsProjectID = oView.getModel().getProperty(bnsProjectBindingPath).ProjectId;
							}
							bnsProjectID = (bnsProjectID === undefined || bnsProjectID === null) ? "" : bnsProjectID;
						} catch (err) {
							if (bnsType === "")
								MessageBox.alert(this.i18nModel.getText("bnsTypeNotSelected"));
							ctype.setBusy(false);
							rButton.setEnabled(true);
							return;

						}
						//if (bnsProjectID === undefined && bnsType === "") {
						//	continue;
						//} else {
						//MessageBox.alert("All Items are not selected");
						var localreturn = false;
						if (bnsType === "") {
							MessageBox.alert(this.i18nModel.getText("bnsTypeNotSelected"));
							localreturn = true;
						}
						if (localreturn === true) {
							ctype.setBusy(false);
							rButton.setEnabled(true);
							return;
						}
						//}
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
				} else if (selectedTab === "overnight") {
					// Get Item Data from view for Accommodation Allowances
					var oSegmentedButton = oView.byId('overnightInd');
					var sKey = oSegmentedButton.getSelectedKey();
					var jobsite = false;
					var siteChanges = false;
					var wkndJobsite = false;

					switch (sKey) {
						case ("0"):
							jobsite = true;
							break;
						case ("1"):
							siteChanges = true;
							break;
						case ("2"):
							wkndJobsite = true;
							break;
						default:
							jobsite = true;
							break;
					}

					var zonetype = oView.byId('AccAllowanceType').getSelectedKey();
					var zoneName = oView.byId('AccAllowanceType').getValue();
					if (zoneName === undefined || zoneName === "" || zoneName === null) {
						MessageBox.alert(this.i18nModel.getText("zoneTypeIsNotSelected"));
						ctype.setBusy(false);
						rButton.setEnabled(true);
						return;
					}
					var allwProjectID = null;
					try {
						var allwProject = oView.byId('AccAllowanceProject').getItems()[1].getItems()[0].getBindingContext().getPath();
						allwProjectID = oView.getModel().getProperty(allwProject).ProjectId;
					} catch (err) {
						allwProjectID = "";
					}

					var workDayAllowanceItem = {
						"ProjectID": allwProjectID,
						"EntryType": "OVERNIGHT",
						"EntryTypeCatId": null,
						"Hours": "1",
						"StartTime": "000000",
						"EndTime": "000000",
						"FullDay": false,
						"AllowancesName": "",
						"ZoneType": zonetype,
						"ZoneName": zoneName,
						"MealIndicator": jobsite,
						"JourneyIndicator": siteChanges,
						"TransportIndicator": wkndJobsite,
						"StartDate": null,
						"EndDate": null,
						"Comment": null
					};
					workDayItems.push(workDayAllowanceItem);
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
				// Defining a custom sorting function to compare date objects and sort them in ascending order. 
				// JavaScript's native comparison operators can be used to compare dates.
				var sortDateAsc = function(date1, date2) {
					if (date1 > date2) return 1;
					if (date1 < date2) return -1;
					return 0;
				};

				var aDates = employees[0].Days;
				aDates.sort(sortDateAsc);

				var fromDay = aDates[0];
				var toDay = aDates[aDates.length - 1];
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
		},

		/* 
		   Incrementing the custom Step input value in fragment StepInput.fragment.xml. 
		   Function accepts a maximum value and an incremental step value as arguments
		*/
		incrementStepInput: function(iInputVal, maxVal, stepVal) {
			var sep = "";
			if (iInputVal) {
				if (iInputVal.toString().indexOf(",") !== -1) {
					sep = ",";
				} else if (iInputVal.toString().indexOf(".") !== -1) {
					sep = ".";
				}
			}

			var oLocale = sap.ui.getCore().getConfiguration().getLocale();
			var oFormatOptions = {};
			if (sep === ".") {
				oFormatOptions = {
					minIntegerDigits: 1,
					maxIntegerDigits: 2,
					minFractionDigits: 2,
					maxFractionDigits: 2
				};
			} else {
				oFormatOptions = {
					minIntegerDigits: 1,
					maxIntegerDigits: 2,
					minFractionDigits: 2,
					maxFractionDigits: 2,
					decimalSeparator: sep
				};
			}
			var oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions, oLocale);

			var iVal = Number(iInputVal.toString().replace(/[,]/g, '.'));
			if (isNaN(iVal)) {
				iVal = oFloatFormat.format(0);
			} else {
				if (iVal < maxVal) {
					iVal += stepVal;
				} else {
					iVal = maxVal;
				}
				iVal = oFloatFormat.format(iVal);
			}
			return iVal;
		},

		/* 
		   Decrementing the custom Step input value in fragment StepInput.fragment.xml. 
		   Function accepts a minimum value and an decremental step value as arguments
		*/
		decrementStepInput: function(iInputVal, minVal, stepVal) {
			var sep = "";
			if (iInputVal) {
				if (iInputVal.toString().indexOf(",") !== -1) {
					sep = ",";
				} else if (iInputVal.toString().indexOf(".") !== -1) {
					sep = ".";
				}
			}

			var oLocale = sap.ui.getCore().getConfiguration().getLocale();
			var oFormatOptions = {};
			if (sep === ".") {
				oFormatOptions = {
					minIntegerDigits: 1,
					maxIntegerDigits: 2,
					minFractionDigits: 2,
					maxFractionDigits: 2
				};
			} else {
				oFormatOptions = {
					minIntegerDigits: 1,
					maxIntegerDigits: 2,
					minFractionDigits: 2,
					maxFractionDigits: 2,
					decimalSeparator: sep
				};
			}
			var oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions, oLocale);
			var iVal = Number(iInputVal.toString().replace(/[,]/g, '.'));
			if (isNaN(iVal)) {
				iVal = oFloatFormat.format(0);
			} else {
				if (iVal > minVal) {
					iVal -= stepVal;
				} else {
					iVal = minVal;
				}
				iVal = oFloatFormat.format(iVal);
			}
			return iVal;
		},

		/*
			For binding category type lists of the entity ValueHelpSet
		*/
		getValueHelpParams: function(aEmployees, updatePath) {
			// Defining a custom sorting function to compare date objects and sort them in ascending order. 
			// JavaScript's native comparison operators can be used to compare dates.
			var sortDateAsc = function(date1, date2) {
				if (date1 > date2) {
					return 1;
				}
				if (date1 < date2) {
					return -1;
				}
				return 0;
			};
			var aSelectedDays = [];
			var aEmpIds = [];
			var oParams = {};

			for (var i = 0; i < aEmployees.length; i++) {
				aEmpIds.push(aEmployees[i].employee);
				for (var j = 0; j < aEmployees[i].Days.length; j++) {
					aSelectedDays.push(aEmployees[i].Days[j]);
				}
			}

			aSelectedDays.sort(sortDateAsc);
			//ERA_US1- si c'est modification (KM,Hours,OtherAllowances etc)
			if (aSelectedDays.length !== 0 && updatePath !== undefined) {
				oParams = {
					EmployeeIds: aEmpIds,
					StartDate: this.oDataModel.getProperty(updatePath).WorkDate,
					EndDate: this.oDataModel.getProperty(updatePath).WorkDate
				};
			}
			//ERA_US1- si c'est modification(KM,Hours,OtherAllowances etc)
			else {
				oParams = {
					EmployeeIds: aEmpIds,
					StartDate: aSelectedDays[0],
					EndDate: aSelectedDays[aSelectedDays.length - 1]
				};
			}
			return oParams;
		},
		//+ERA_Catégorie de pointages par domaine du personnel
		requestPointage: function(oDataArray, ohoursType, oHelpType) {

			var startDateFilters = [];
			var endDateFilters = [];
			var EmpIDFilters = [];
			var filterAN = [];
			var AllFilters = [];
			var helpType = [];

			if (ohoursType !== null && ohoursType !== "" && ohoursType !== undefined) {

				//Define the template for items, which will be inserted inside a select element
				var oItemSelectTemplate = new sap.ui.core.Item({
					key: "{FieldValue}",
					text: "{FieldDescription}"
				});

				//Build the Odata Request wih Employee ID StarDate and EndDate
				filterAN = new Filter("ApplicationName", sap.ui.model.FilterOperator.EQ, "TEAMLEAD");
				helpType = new Filter("HelpType", sap.ui.model.FilterOperator.EQ, oHelpType);

				for (var i = 0; i < oDataArray.EmployeeIds.length; i++) {
					EmpIDFilters = new Filter("EmployeeId", sap.ui.model.FilterOperator.EQ, oDataArray.EmployeeIds[i].toString());
					AllFilters.push(EmpIDFilters);
				}

				startDateFilters = new Filter("StartDate", sap.ui.model.FilterOperator.EQ, oDataArray.StartDate);
				endDateFilters = new Filter("EndDate", sap.ui.model.FilterOperator.EQ, oDataArray.EndDate);
				AllFilters.push(filterAN);
				AllFilters.push(helpType);
				AllFilters.push(startDateFilters);
				AllFilters.push(endDateFilters);

				ohoursType.bindItems({
					path: "/ValueHelpSet",
					filters: AllFilters,
					template: oItemSelectTemplate
				});
			}
		},
		//+ERA_Catégorie de pointages par domaine du personnel

		setSelectTypeBinding: function(sKey, oParams, oController, oPosition) {
			jQuery.sap.log.error("No of selected employees: " + oParams.EmployeeIds.length + " " + oParams.StartDate + " " + oParams.EndDate);
			switch (sKey) {
				case 'hours':
					//var oSelecthrsCombo = source.getParent().getParent().getParent().getItems()[3];
					if (oPosition === undefined) {
						var source = oController.getView().byId('addTimeTab').getItems()[0].getItems()[1].getItems()[2].getItems()[2].getItems()[0];
						//AMU_US6 Ergonomie du Masque de saisies des heures
						//var oSelecthrsCombo = source.getParent().getParent().getParent().getItems()[4].getItems()[0];
						var oSelecthrsCombo = source.getParent().getParent().getParent().getItems()[3].getItems()[0];
						//AMU_US6 Ergonomie du Masque de saisies des heures
					} else {
						source = oController.getView().byId('addTimeTab').getItems()[0].getItems()[oPosition].getItems()[2].getItems()[2].getItems()[0];
						//AMU_US6 Ergonomie du Masque de saisies des heures
						//oSelecthrsCombo = source.getParent().getParent().getParent().getItems()[4].getItems()[0];
						oSelecthrsCombo = source.getParent().getParent().getParent().getItems()[3].getItems()[0];
						//AMU_US6 Ergonomie du Masque de saisies des heures
					}
					//ERA_US1 Pointages par domaine du personnel
					var sHelpType = "DH";
					if (oParams !== null && oParams !== "" && oParams !== undefined) {
						this.requestPointage(oParams, oSelecthrsCombo, sHelpType);
					}
					//ERA_US1 Pointages par domaine du personnel				
					break;
				case 'allowance':
					var oSelectAllowance = oController.getView().byId('AllowanceZoneType');
					//ERA_US1 Pointages par domaine du personnel
					sHelpType = "ZN";
					if (oParams !== null && oParams !== "" && oParams !== undefined) {
						this.requestPointage(oParams, oSelectAllowance, sHelpType);
					}
					//ERA_US1 Pointages par domaine du personnel			
					break;
				case 'overnight':
					var oSelectAccAllowance = oController.getView().byId('AccAllowanceType');
					//ERA_US1 Pointages par domaine du personnel
					sHelpType = "ZN";
					if (oParams !== null && oParams !== "" && oParams !== undefined) {
						this.requestPointage(oParams, oSelectAccAllowance, sHelpType);
					}
					//ERA_US1 Pointages par domaine du personnel					
					break;
				case 'bonus':
					if (oPosition === undefined) {
						var oSelectBns = oController.getView().byId('addBonusTab').getItems()[0].getItems()[1].getItems()[2].getItems()[0].getItems()[0].getItems()[
							1];
					} else {
						oSelectBns = oController.getView().byId('addBonusTab').getItems()[0].getItems()[oPosition].getItems()[2].getItems()[0].getItems()[0].getItems()[
							1];
					}
					//ERA_US1 Pointages par domaine du personnel
					sHelpType = "BNS";
					if (oParams !== null && oParams !== "" && oParams !== undefined) {
						this.requestPointage(oParams, oSelectBns, sHelpType);
					}
					//ERA_US1 Pointages par domaine du personnel					
					break;
				case 'absence':
					var oSelectAbs = oController.getView().byId("AbsCat");
					//ERA_US1 Pointages par domaine du personnel
					sHelpType = "ABS";
					if (oParams !== null && oParams !== "" && oParams !== undefined) {
						this.requestPointage(oParams, oSelectAbs, sHelpType);
					}
					//ERA_US1 Pointages par domaine du personnel
					break;
				case 'KM':

					if (oPosition === undefined) {
						var oVbox = oController.getView().byId("addKM").getItems()[0].getItems()[0].getItems()[2].getItems()[2].getItems()[0];
						var oSelectKm = oVbox.getItems()[1].getItems()[4];
					} else {
						oVbox = oController.getView().byId("addKM").getItems()[0].getItems()[oPosition].getItems()[2].getItems()[2].getItems()[0];
						oSelectKm = oVbox.getItems()[1].getItems()[4];
					}
					//ERA_US1 Pointages par domaine du personnel
					if (oParams !== null && oParams !== "" && oParams !== undefined) {
						this.requestPointage(oParams, oSelectKm, sKey);
					}
					//ERA_US1 Pointages par domaine du personnel					
					break;
				case 'Equipment':
					break;

			}
		}

	};

});