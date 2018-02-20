sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"com/vinci/timesheet/admin/utility/fragment",
	"sap/m/MessageToast",
	"sap/m/GroupHeaderListItem"
], function(BaseController, JSONModel, formatter, datetime, Filter, FilterOperator, MessageBox, fragment, MessageToast,
	GroupHeaderListItem) {
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
			var setting = sap.ui.getCore().byId("shellSettings");
			if (setting !== null) {
				setting.attachPress(function(oEvent) {

					MessageBox.information("Version - 4.0.0");
				});
			}
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._oTableSearchState = [];
			this.dailyDetail = false;
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
				if (this.userPref.teamName === null) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = "(" + iTotalItems + ") " + this.userPref.teamName;
				}
			} else {
				if (this.userPref.teamName === null) {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				} else {
					sTitle = this.userPref.teamName;
				}
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt1", sTitle);
			this.getModel("calendar").setProperty("/data/0/ColumnTxt2", this.getModel("userPreference").getProperty("/defaultBUT"));
			//	this.getView().byId('editPlanning').setEnabled(!(this.getModel().getProperty(oTable.getItems()[0].getBindingContext().getPath()).NotEditable));

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

			var url = "/PersonalizationSet(ApplicationName='" + this.userPref.application + "',UserId='" + this.getView().getModel(
				"userPreference").getProperty(
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
		OnEmployeePress: function(oEvent) {
			this.Filters1 = [];
			this.currentEmp = oEvent.getSource().data('employee');
			this.currentEmpName = oEvent.getSource().data('employeeName');

			var caldenderdata = datetime.getCalenderDateOnlyData(this.userPref.startDate, 1, this.getResourceBundle());
			var oCalendarModel = new JSONModel(caldenderdata);
			this.setModel(oCalendarModel, "calendarOnly");

			var oView = this.getView();
			var oDialog = oView.byId("EmpWeekCheckDialog");
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.vinci.timesheet.admin.view.EmployeeWeekDialog", this);
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

			var EmpEntryEnable = oEvent.getSource().data('entryEnable');
			var noEdited = oEvent.getSource().data('notEditable');
			var editEnable = !noEdited && EmpEntryEnable;
			this.editEnable = editEnable;
			this.getView().byId('WeekAddNewTimeButton').setEnabled(editEnable);
			this.getView().byId('WeekAddDeleteButton').setEnabled(editEnable);
			var table = this.getView().byId('tableWeekItems');
			if (editEnable) {
				table.setMode("MultiSelect");
			} else {
				table.setMode("None");
			}

			var EmpDetail = {
				enable: EmpEntryEnable
			};
			var oEmpDetailModel = new JSONModel(EmpDetail);
			this.getView().setModel(oEmpDetailModel, "EmpDetail");
			oDialog.bindElement(oEvent.getSource().getBindingContext().getPath());
			var empBinding = "/EmployeeSet(EmployeeId='" + this.currentEmp + "'," + "ApplicationName='" + this.userPref.application + "')";
			oView.byId('employeeCompany').bindElement({
				path: empBinding,
				events: {
					dataReceived: function(rData) {
						oView.byId('employeeBU').bindElement(empBinding);
						oView.byId('employeeSection').bindElement(empBinding);
					}
				}
			});
			
			oDialog.open();

			var oTable = this.byId("employeeWeekTable");
			var Filters = [
				new Filter("WeekNumber", FilterOperator.EQ, this.currentWeekNumber),
				new Filter("WeekYear", FilterOperator.EQ, this.currentYear),
				new Filter("isByWeekly", FilterOperator.EQ, false),
				new Filter("BusinessUnit", FilterOperator.EQ, this.userPref.defaultBU),
				new Filter("EmployeeId", FilterOperator.EQ, this.currentEmp),
				new Filter("ApplicationName", FilterOperator.EQ, this.userPref.application),
				new Filter("ApplicationVersion", FilterOperator.EQ, this.userPref.applicationVersion)
			];
			var that = this;
			oTable.getBinding("items").filter(Filters, "Application");
			oTable.getBinding("items").attachEventOnce("dataReceived", function() {
				var oCells = oTable.getItems()[0].getCells();
				for (var j = 0; j < oCells.length; j++) {
					if (oCells[j].data('status') === "S") {
						oCells[j].getCustomData()[0].setValue(oCells[j].data('status2'));
					}
				}

				if (!table.getBinding("items").isSuspended()) {
					var itemFilters = [new Filter("ApplicationName", FilterOperator.EQ, that.userPref.application),
						new Filter("ApplicationVersion", FilterOperator.EQ, that.userPref.applicationVersion)
					];

					table.getBinding("items").filter(itemFilters, "Application");
					table.setVisible(false);
					that.getView().byId('employeeWeekLabel').setVisible(true);
				}
				// for employee week selection view
				that.employees = [{
					employee: that.currentEmp,
					employeeName: that.currentEmpName,
					Days: []
				}];

			});

		},
		getCounty: function(oContext) {
			var urlStr = "/WorkDaySet(EmployeeId='" + this.currentEmp + "'," + "WorkDate=" + datetime.getODataDateKey(oContext.getProperty(
					'WorkDate')) + "," +
				"ApplicationName='" + this.userPref.application + "')";

			var theorHrs = oContext.getModel().getProperty(urlStr).TargetHours;
			var filledHrs = oContext.getModel().getProperty(urlStr).FilledHours;

			return formatter.dateFormatinEmpDay(oContext.getProperty('WorkDate')) + " - " + this.getResourceBundle().getText(
					"legend-theoritical") + " : " + theorHrs + " " + this.getResourceBundle().getText("hour") + " / " + filledHrs + " " + this.getResourceBundle()
				.getText("hour");
		},

		getGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false
			});
		},
		onemployeeWeekItemLoad: function(oEvent) {
			if (this.editEnable) {
				var tbl = this.getView().byId('tableWeekItems');
				var header = tbl.$().find('thead');
				var selectAllCb = header.find('.sapMCb');

				tbl.getItems().forEach(function(r) {
					var obj = r.getBindingContext().getObject();
					var noEdit = obj.NotEditable;
					var cb = r.$().find('.sapMCb');
					var oCb = sap.ui.getCore().byId(cb.attr('id'));
					if (noEdit) {
						oCb.setEnabled(false);
						selectAllCb.remove();
					}
				});
			}
		},

		EmployeeHourSize: function(oEvent) {
			var button = oEvent.getSource();
			var Filters1 = this.Filters1;
			if (button.data('status') !== "S") { // getCustomData()[0].getValue()
				button.getCustomData()[0].setValue("S");
				var urlFilterParam = "$filter=EmployeeId%20eq%20'" + button.data('employee') + "'and%20WorkDate%20eq%20" +
					datetime.getODataDateFilter(button.data('selectedDate')) + "and%20ApplicationName%20eq%20%27" + this.userPref
					.application + "%27%20and%20ApplicationVersion%20eq%20%27" + this.userPref.applicationVersion + "%27%20";

				this.getView().getModel().read('/WorkDaySet', {
					urlParameters: urlFilterParam
				});

				Filters1.push(button.data('selectedDate'));

			} else {
				button.getCustomData()[0].setValue(button.data('status2'));
				var boxindex = Filters1.indexOf(button.data('selectedDate'));
				Filters1.splice(boxindex, 1);
			}

			var orFilter = [];
			var dataExist = true;
			var table = this.getView().byId('tableWeekItems');
			if (Filters1.length === 0) {
				//table.setModel(this.getView().getModel('calender'));
				orFilter = new Filter("WorkDate", FilterOperator.EQ, new Date("1971-01-01"));
				dataExist = false;
				table.setVisible(false);
				this.getView().byId('employeeWeekLabel').setVisible(true);

			} else if (Filters1.length === 1) {
				table.setVisible(true);
				this.getView().byId('employeeWeekLabel').setVisible(false);
				table.setModel(this.getView().getModel());
				orFilter = new Filter("WorkDate", FilterOperator.EQ, Filters1[0]);
			} else {
				table.setModel(this.getView().getModel());
				orFilter = new Filter("WorkDate", FilterOperator.EQ, Filters1[0]);
				for (var k = 1; k < Filters1.length; k++) {
					orFilter = new Filter({
						filters: [new Filter("WorkDate", FilterOperator.EQ, Filters1[k]),
							orFilter
						],
						and: false
					});
				}
			}

			var Filters = new Filter({
				filters: [new Filter("ApplicationName", FilterOperator.EQ, this.userPref.application),
					orFilter
				],
				and: true
			});
			Filters = new Filter({
				filters: [new Filter("ApplicationVersion", FilterOperator.EQ, this.userPref.applicationVersion),
					Filters
				],
				and: true
			});
			if (dataExist) {
				Filters = new Filter({
					filters: [new Filter("EmployeeId", FilterOperator.EQ, button.data('employee')),
						Filters
					],
					and: true
				});
			}

			table.getBinding("items").filter(Filters, "Application");
			table.getBinding("items").resume();
			table.getBinding("items").attachEvent('dataReceived', function(oData) {

				try {
					var results = oData.getParameter('data').results;
					var showStartTime = false;
					var showEndTime = false;
					var showKM = false;
					for (var i = 0; i < results.length; i++) {
						if (showStartTime === false) {
							if (results[i].StartTime !== undefined && results[i].StartTime !== null &&
								results[i].StartTime !== "" && results[i].StartTime !== "00:00") {
								showStartTime = true;
							}
						}
						if (showEndTime === false) {
							if (results[i].EndTime !== undefined && results[i].EndTime !== null &&
								results[i].EndTime !== "" && results[i].EndTime !== "00:00") {
								showEndTime = true;
							}
						}
						if (showKM === false) {
							if (results[i].KMNumber !== undefined && results[i].KMNumber !== null &&
								results[i].KMNumber !== "" && results[i].KMNumber !== "0") {
								showKM = true;
							}
						}
					}

					table.getColumns()[3].setVisible(showStartTime);
					table.getColumns()[4].setVisible(showEndTime);
					table.getColumns()[5].setVisible(showKM);
				} catch (e) {
					// do nothing
				}
			});

			this.Filters1 = Filters1;

			var localDaysRecordFound = false;
			for (var e = 0; e < this.employees[0].Days.length; e++) {
				if (oEvent.getSource().data('selectedDate') === this.employees[0].Days[e]) {
					localDaysRecordFound = true;
					this.employees[0].Days.splice(e, 1);
				}
			}
			if (localDaysRecordFound === false) {
				this.employees[0].Days.push(oEvent.getSource().data('selectedDate'));
			}

		},
		OnHourPress: function(oEvent) {
			//var currentBindingPath = oEvent.getSource().getBindingContext().getPath();
			// Edit Enable
			this.dailyDetail = true;
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

			/*var Filters = [
				new Filter("ApplicationName", FilterOperator.EQ, this.userPref.application),
				new Filter("ApplicationVersion", FilterOperator.EQ, this.userPref.applicationVersion)
			];*/

			oDialog.bindElement("/EmployeeSet(EmployeeId='" + this.currentEmp + "'," + "ApplicationName='" + this.userPref.application + "')");

			//var urlStr = "/WorkDaySet(EmployeeId='" + this.currentEmp + "'," + "WorkDate=" + datetime.getODataDateKey(this.currentDate) + ")";
			var urlStr = "/WorkDaySet(EmployeeId='" + this.currentEmp + "'," + "WorkDate=" + datetime.getODataDateKey(this.currentDate) + "," +
				"ApplicationName='" + this.userPref.application + "')";
			oView.byId('EmpDayTotal').bindElement(urlStr);
			oView.byId('EmpDayStatus').bindElement(urlStr);
			var that = this;
			var EmpEntryEnable = oEvent.getSource().data('entryEnable');
			oView.byId('EmpDayInfo').bindElement({
				path: urlStr,
				events: {
					dataReceived: function(rData) {
						//var entryEnable = rData.getParameter('data').isEntryEnabled;
						try {
							var noEdited = rData.getParameter('data').NotEditable;
							var editEnable = !noEdited && EmpEntryEnable;
							that.getView().byId('AddNewTimeButton').setEnabled(editEnable);
						} catch (e) {
							// do nothing
						}
						var EmpDetail = {
							enable: EmpEntryEnable
						};
						var oEmpDetailModel = new JSONModel(EmpDetail);
						that.getView().setModel(oEmpDetailModel, "EmpDetail");
					}
				}
			});
			oView.byId('MainAddButton').bindElement(urlStr);
			try {
				var noEdited = oView.getModel().getProperty(urlStr).NotEditable;
				var editEnable = !noEdited && EmpEntryEnable;
				that.getView().byId('AddNewTimeButton').setEnabled(editEnable);
			} catch (e) {
				// do nothing
			}
			var EmpDetail = {
				enable: EmpEntryEnable
			};
			var oEmpDetailModel = new JSONModel(EmpDetail);
			that.getView().setModel(oEmpDetailModel, "EmpDetail");

			var Filters = [
				new Filter("EmployeeId", FilterOperator.EQ, this.currentEmp),
				new Filter("WorkDate", FilterOperator.EQ, this.currentDate),
				new Filter("ApplicationName", FilterOperator.EQ, this.userPref.application),
				new Filter("ApplicationVersion", FilterOperator.EQ, this.userPref.applicationVersion)
			];

			/*oDialog.getContent()[0].setVisible(true);
			oDialog.getContent()[1].setVisible(false);*/ // Invisible Add Information Screen
			this.update = false;
			oDialog.open();
			var table = this.getView().byId('tableDayItems');
			table.setModel(this.getView().getModel());
			table.getBinding("items").filter(Filters, "Application");
			table.getBinding("items").resume();
			table.getBinding("items").attachEvent('dataReceived', function(oData) {

				that.getView().byId('MainAddDeleteButton').setEnabled(EmpEntryEnable);

				if (EmpEntryEnable) {
					try {
						var results = oData.getParameter('data').results;
						that.getView().byId('MainAddDeleteButton').setEnabled(false);
						for (var i = 0; i < results.length; i++) {

							if (results[i].NotEditable === false) {
								that.getView().byId('MainAddDeleteButton').setEnabled(true);
								break;
							}
						}
					} catch (e) {
						// do nothing
					}
				}
				// Logic for hiding table column if no data
				try {
					var showStartTime = false;
					var showEndTime = false;
					var showKM = false;
					for (i = 0; i < results.length; i++) {
						if (showStartTime === false) {
							if (results[i].StartTime !== undefined && results[i].StartTime !== null &&
								results[i].StartTime !== "" && results[i].StartTime !== "00:00") {
								showStartTime = true;
							}
						}
						if (showEndTime === false) {
							if (results[i].EndTime !== undefined && results[i].EndTime !== null &&
								results[i].EndTime !== "" && results[i].EndTime !== "00:00") {
								showEndTime = true;
							}
						}
						if (showKM === false) {
							if (results[i].KMNumber !== undefined && results[i].KMNumber !== null &&
								results[i].KMNumber !== "" && results[i].KMNumber !== "0") {
								showKM = true;
							}
						}
					}
					var localTable = that.getView().byId('tableDayItems');
					localTable.getColumns()[3].setVisible(showStartTime);
					localTable.getColumns()[4].setVisible(showEndTime);
					localTable.getColumns()[5].setVisible(showKM);
					if (showStartTime === false && showEndTime === false && showKM === false) {
						localTable.getColumns()[1].setWidth("30%");
					} else {
						// Determin width display
						var controlWidth = 0;
						if (showStartTime === true) {
							controlWidth = controlWidth + 1;
						} else if (showEndTime === true) {
							controlWidth = controlWidth + 1;
						} else if (showKM === true) {
							controlWidth = controlWidth + 1;
						}
						// apply width display
						if (controlWidth === 1) {
							localTable.getColumns()[1].setWidth("24%");
						} else if (controlWidth === 2) {
							localTable.getColumns()[1].setWidth("18%");
						} else if (controlWidth === 3) {
							localTable.getColumns()[1].setWidth("12%");
						}
					}
				} catch (e) {
					// do nothing
				}
			});

			/*var noEdited = oEvent.getSource().data('noEdited');

			var editEnable = entryEnable && !noEdited;
			this.getView().byId('AddNewTimeButton').setEnabled(editEnable);

			var EmpDetail = {
				enable: editEnable
			};
			var oEmpDetailModel = new JSONModel(EmpDetail);
			this.getView().setModel(oEmpDetailModel, "EmpDetail");*/
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
				var buFilterItem = oDialog.getFilterItems()[0]; //this.getView().byId('BUFilter');
				var oldFilter = buFilterItem.getBinding("items").sFilterParams;
				var newFilter = oldFilter + "%20and%20ApplicationName%20eq%20%27" + this.userPref.application +
					"%27%20and%20ApplicationVersion%20eq%20%27" + this.userPref.applicationVersion + "%27%20";
				buFilterItem.getBinding("items").sFilterParams = newFilter;
				buFilterItem.getModel().setSizeLimit(5000);
				var teamFilterItem = oDialog.getFilterItems()[1]; //this.getView().byId('TeamFilter');
				if (teamFilterItem.getBinding("items") === undefined) {
					var newFilter2 = "$filter=BusinessUnit%20eq%20%27" + this.userPref.defaultBU + "%27";
				}
				teamFilterItem.getBinding("items").sFilterParams = newFilter2;
				buFilterItem.getBinding("items").resume();
				teamFilterItem.getBinding("items").resume();
				teamFilterItem.getBinding("items").attachEventOnce('dataReceived', function() {
					oDialog.open();
				});

				oDialog.setModel(this.getView().getModel());
				oDialog.setModel(this.getView().getModel('userPreference'), 'userPreference');
				oDialog.setModel(this.getView().getModel('i18n'), 'i18n');
			} else {
				oDialog.open();
			}
		},
		OnEquipmentOn: function(oEvent) {
			this.getRouter().navTo("WSEquipment", {
				source: 'Summary'
			}, true);
		},
		OnTableTeamChange: function(oEvent) {
			var oItem = oEvent.getParameter('selectedItem');
			this.userPref.teamFilter = oItem.getKey();
			this.userPref.teamName = oItem.getText();

			this._applyFilters();
		},
		filterTabOpened: function(oEvent) {

			if (oEvent.getParameter('parentFilterItem').getKey() === "BusinessUnit") {

				this.BuFilter = true;
				/*var buFilterItem = this.getView().byId('BUFilter');
				var filters = [new Filter('ApplicationName', FilterOperator.EQ, this.userPref.application), new Filter('ApplicationVersion',
					FilterOperator.EQ, this.userPref.applicationVersion)];
				buFilterItem.getBinding("items").filter(filters);
				buFilterItem.getBinding("items").resume();*/

			} else if (oEvent.getParameter('parentFilterItem').getKey() === "Team") {
				this.BuFilter = false;
				/*var teamFilterItem = this.getView().byId('TeamFilter');
				var filters2 = [new Filter('BusinessUnit', FilterOperator.EQ, this.userPref.defaultBU)];
				teamFilterItem.getBinding("items").filter(filters2);
				teamFilterItem.getBinding("items").resume();*/

			}
		},
		handleAdvanceSearch: function(oEvent) {
			var mParams = oEvent.getParameters();
			var that = this;

			if (mParams.filterItems.length > 0) {
				jQuery.each(mParams.filterItems, function(i, oItem) {
					//var aSplit = oItem.getKey().split(");
					if (oItem.getParent().getProperty("key") === 'BusinessUnit') {
						that.userPref.defaultBU = oItem.getKey();

						that.getModel("userPreference").setProperty("/defaultBUT", oItem.getText());
						var oData = {
							PersoValue: oItem.getKey()
						};
						var url = "/PersonalizationSet(ApplicationName='" + that.userPref.application + "',UserId='" + that.getView().getModel(
							"userPreference").getProperty(
							"/userID") + "',PersoId='BU')";
						that.getView().getModel().update(url, oData, {
							success: function() {
								formatter.updateUserPreference(that.getModel(), that.getModel("userPreference"));
							}
						});
						that.userPref.teamFilter = null;
						that.userPref.teamName = null;
					} else if (oItem.getParent().getProperty("key") === 'Team') {
						if (that.BuFilter) {
							that.userPref.teamFilter = null;
							that.userPref.teamName = null;
							var index2 = mParams.filterItems.indexOf(oItem);
							mParams.filterItems[index2].setSelected(false);
						} else {
							that.userPref.teamFilter = oItem.getKey();
							that.userPref.teamName = oItem.getText();
						}

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
			this.dailyDetail = false;
			oDialog.close();
		},
		OnCancelEmpWeekCheckDialog: function(oEvent) {
			var oDialog = this.getView().byId("EmpWeekCheckDialog");
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
		onPressSelectDeleteEntries: function(oEvent) {

			var that = this;
			var contextPath = this.getView().byId('EmpWeekTotal').getBindingContext().getPath();
			MessageBox.confirm(
				that.getResourceBundle().getText("confirmSelectDeleteMsg"), {
					title: that.getResourceBundle().getText("deletecnfm"),
					onClose: function fnCallbackConfirm(oAction) {
						if (oAction === 'OK') {
							var model = that.getView().getModel();
							var items = that.getView().byId('tableWeekItems').getSelectedItems();
							model.setDeferredGroups(["group1"]);
							for (var j = 0; j < items.length; j++) {
								var binding = items[j].getBindingContext().getPath();
								if (model.getProperty(binding).NotEditable === false) {
									model.remove(binding, {
										groupId: "group1",
										changeSetId: "changeSetId1",

									});
								}

							}
							model.submitChanges({
								groupId: "group1",
								success: function() {
									that.getView().getModel().read(contextPath);
									var oTable2 = that.getView().byId('employeeWeekTable');
									oTable2.getBinding("items").refresh();
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
		onPressAllDeleteEntries: function(oEvent) {
			//var binding = oEvent.getSource().getBindingContext().getPath();
			var that = this;
			var contextPath = this.getView().byId('EmpDayTotal').getBindingContext().getPath();

			//this.getView().byId('EmpDayTotal').getBinding('text').refresh();
			//oView.byId('EmpDayStatus').bindElement(urlStr);
			//oView.byId('EmpDayInfo').bindElement(urlStr);

			MessageBox.confirm(
				that.getResourceBundle().getText("confirmAllDeleteMsg"), {
					title: that.getResourceBundle().getText("deletecnfm"),
					onClose: function fnCallbackConfirm(oAction) {
						if (oAction === 'OK') {
							var model = that.getView().getModel();
							var items = that.getView().byId('tableDayItems').getItems();
							model.setDeferredGroups(["group1"]);
							for (var j = 0; j < items.length; j++) {
								var binding = items[j].getBindingContext().getPath();
								if (model.getProperty(binding).NotEditable === false) {
									model.remove(binding, {
										groupId: "group1",
										changeSetId: "changeSetId1",

									});
								}

							}
							model.submitChanges({
								groupId: "group1",
								success: function() {
									that.update = true;
									that.getView().getModel().read(contextPath);
									MessageToast.show(that.getResourceBundle().getText("successDeleteMsg"));
								}

							});
						} else {
							return;
						}
					}
				});
		},
		onPressSaveEntries: function(oEvent) {
			var that = this;
			var headerContextPath = null;
			var oTable = null;
			var dailog = null;
			if (this.dailyDetail) {
				dailog = this.getView().byId("EmpDayCheckDialog");
				headerContextPath = this.getView().byId('EmpDayTotal').getBindingContext().getPath();
				oTable = this.getView().byId('tableDayItems');
			} else {
				dailog = this.getView().byId("EmpWeekCheckDialog");
				headerContextPath = this.getView().byId('EmpWeekTotal').getBindingContext().getPath();
				oTable = this.getView().byId('tableWeekItems');
			}
			fragment.AddUpdatetime_saveEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));

				that.getView().getModel().read(headerContextPath);
				oTable.getBinding("items").refresh();
				if (!that.dailyDetail) {
					var oTable2 = that.getView().byId('employeeWeekTable');
					oTable2.getBinding("items").refresh();
				}
				that.update = true;
				MessageToast.show(that.getResourceBundle().getText("successPostMsg"));
			}, dailog, oEvent.getSource());

		},
		onPressUpdateEntries: function(oEvent) {
			var that = this;
			var headerContextPath = null;
			var dialogContextPath = this.getView().byId('idIconTabBarMulti').getBindingContext().getPath();
			var oTable = null;
			var dailog = null;
			if (this.dailyDetail) {
				dailog = this.getView().byId("EmpDayCheckDialog");
				headerContextPath = this.getView().byId('EmpDayTotal').getBindingContext().getPath();
				oTable = this.getView().byId('tableDayItems');
			} else {
				dailog = this.getView().byId("EmpWeekCheckDialog");
				headerContextPath = this.getView().byId('EmpWeekTotal').getBindingContext().getPath();
				oTable = this.getView().byId('tableWeekItems');

			}
			fragment.AddUpdatetime_updateEntries(this.getView(), function() {
				fragment.AddUpdatetime_destroy(that.getView().byId('idIconTabBarMulti'));

				that.getView().getModel().read(headerContextPath);
				oTable.getBinding("items").refresh();
				if (!that.dailyDetail) {
					var oTable2 = that.getView().byId('employeeWeekTable');
					oTable2.getBinding("items").refresh();
				}
				that.update = true;
				MessageToast.show(that.getResourceBundle().getText("successUpdateMsg"));
			}, dailog, oEvent.getSource(), dialogContextPath);

		},
		onPressCheckVersion: function(oEvent) {
			
			if(	!this.getView().byId("legend").getVisible()){
				this.getView().byId("displayLegend").setIcon("sap-icon://drill-down");
			this.getView().byId("legend").setVisible(true);
			}
			else{
			this.getView().byId("legend").setVisible(false);	
			this.getView().byId("displayLegend").setIcon("sap-icon://drill-up");
			}
		
		},

		////*** Add New Time  **///

		OnAddEmpWeekTime: function(oEvent) {
			var that = this;
			var oDialog = null;
			oDialog = this.getView().byId("EmpWeekCheckDialog");

			if (this.employees[0].Days.length <= 0) {
				MessageToast.show(that.getResourceBundle().getText("selectAtleastOneDay"));
				return;
			} else {
				if (this.Filters1.length <= 0) {
					this.employees = [{
						employee: this.currentEmp,
						employeeName: this.currentEmpName,
						Days: []
					}];
					for (var k = 0; k < this.Filters1.length; k++) {
						this.employees[0].Days.push(this.Filters1[k]);
					}
				}
			}

			var oModel = fragment.AddUpdatetime_init(this, oDialog.getContent()[0], "New", this.getResourceBundle(), this.employees, this.getView()
				.getModel());

			this.getView().setModel(oModel.AddTime, "AddTime");
			this.getView().setModel(oModel.projectSearch, "projectSearch");
			this.getView().getModel("footer").destroy();
			this.getView().setModel(oModel.footer, "footer");
			this.getView().setModel(oModel.Emps, "Emps");

		},

		OnAddEmpTime: function(oEvent) {
			var oView = this.getView();
			var oDialog = null;
			if (this.dailyDetail)
				oDialog = this.getView().byId("EmpDayCheckDialog");
			else
				oDialog = this.getView().byId("EmpWeekCheckDialog");

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
		handleTeamLoadItems: function(oEvent) {
			oEvent.getSource().getBinding("items").resume();
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
				new Filter("ApplicationName", FilterOperator.EQ, this.userPref.application),
				new Filter("ApplicationVersion", FilterOperator.EQ, this.userPref.applicationVersion)
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
			var oDialog = null;
			if (this.dailyDetail) {
				oDialog = this.getView().byId("EmpDayCheckDialog");
			} else {
				oDialog = this.getView().byId("EmpWeekCheckDialog");
			}
			this.employees = [{
				employee: this.currentEmp,
				employeeName: this.currentEmpName,
				Days: [this.currentDate]
			}];

			var oModel = fragment.AddUpdatetime_init(this, oDialog.getContent()[0], "Update", this.getResourceBundle(), this.employees, this.getView()
				.getModel(), oEvent.getSource().getBindingContext().getPath());

			this.getView().setModel(oModel.AddTime, "AddTime");
			this.getView().setModel(oModel.projectSearch, "projectSearch");
			this.getView().getModel("footer").destroy();
			this.getView().setModel(oModel.footer, "footer");
			this.getView().setModel(oModel.Emps, "Emps");

		},
		onAllowanceIndicatorData : function(oEvent){	
			fragment.AddUpdatetime_onAllowanceIndicatorData(oEvent,this);
		},
		OnDeleteEmpDayitem: function(oEvent) {
			var binding = oEvent.getSource().getBindingContext().getPath();
			var that = this;
			var headerContextPath = null;
			if (this.dailyDetail) {

				headerContextPath = this.getView().byId('EmpDayTotal').getBindingContext().getPath();

			} else {

				headerContextPath = this.getView().byId('EmpWeekTotal').getBindingContext().getPath();

			}
			this.employees = [{
				employee: this.currentEmp,
				employeeName: this.currentEmpName,
				Days: [this.currentDate]
			}];
			//this.getView().byId('EmpDayTotal').getBinding('text').refresh();
			//oView.byId('EmpDayStatus').bindElement(urlStr);
			//oView.byId('EmpDayInfo').bindElement(urlStr);

			MessageBox.confirm(
				that.getResourceBundle().getText("confirmDeleteMsg"), {
					title: that.getResourceBundle().getText("deletecnfm"),
					onClose: function fnCallbackConfirm(oAction) {
						if (oAction === 'OK') {
							that.employees[0].Days = [];
							that.employees[0].Days.push(that.getView().getModel().getProperty(binding).WorkDate);
							that.getView().getModel().remove(binding, {
								success: function() {
									that.getView().getModel().read(headerContextPath);
									if (!that.dailyDetail) {
										var oTable2 = that.getView().byId('employeeWeekTable');
										oTable2.getBinding("items").refresh();
									}
									that.update = true;
									MessageToast.show(that.getResourceBundle().getText("successDeleteMsg"));
									//fragment.refresh_workdaySet(that.employees,that.getView());
									that.getView().getModel().refresh();
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
			var selectButton;
			if (this.dailyDetail) {
				selectButton = this.getView().byId('ProjectSelectButton');
			} else {
				selectButton = this.getView().byId('WeekProjectSelectButton');
			}

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
			if (this.dailyDetail) {
				fragment.SelectProject_OnProjectSearch(oEvent, this, this.getView().byId('ProjectSelectButton'));
			} else {
				fragment.SelectProject_OnProjectSearch(oEvent, this, this.getView().byId('WeekProjectSelectButton'));
			}

		},
		OnProjectRefresh: function(oEvent) {
			if (this.dailyDetail) {
				fragment.SelectProject_OnProjectRefresh(oEvent, this, this.getView().byId('ProjectSelectButton'));
			} else {
				fragment.SelectProject_OnProjectRefresh(oEvent, this, this.getView().byId('WeekProjectSelectButton'));
			}

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
		OnOthAllownaceTypeChange: function(oEvent) {
			fragment.SelectProject_OnOthAllownaceTypeChange(oEvent);
		},
		OnOthAllownaceEntryChange: function(oEvent) {
			fragment.SelectProject_OnOthAllownaceEntryChange(oEvent);
		},
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
		OnBonusDelete: function(oEvent) {
			var container = this.getView().byId('addBonusTab').getItems()[0];
			fragment.AddProjectTime_OnBonusDelete(oEvent, container);
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
			fragment.AddUpdatetime_OnTabSelected(oEvent, this.getView(), this);
		},
		OnaddNewHourPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewHourPress(this);
		},
		OnaddNewBonusPress: function(oEvent) {
			fragment.AddUpdatetime_OnaddNewBonusPress(this);
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
		onAbsenceCatChange: function(oEvent) {
			fragment.AddUpdateTime_onAbsenceCatChange(oEvent, this.getView().getModel('AddTime'), this.getView());
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
		OnChangeKMHours: function(oEvent) {
			fragment.AddKM_OnChangeKMHours(oEvent);
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