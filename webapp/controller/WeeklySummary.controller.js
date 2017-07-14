sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/vinci/timesheet/admin/model/formatter",
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, formatter, datetime, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.vinci.timesheet.admin.controller.WeeklySummary", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vinci.timesheet.admin.view.WeeklySummary
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			/// Attach Seeting button from Shell
			var setting = sap.ui.getCore().byId('shellSettings');
			if (setting != null) {
				setting.attachPress(function(oEvent) {
					alert("Personal Setting");
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
			var userPref = this.getOwnerComponent().getModel('userPreference').getData();
			this.employeeFilter = null;
			var currentWeekNumber = null;
			var currentYear = null;
			var oPeriodbutton = this.getView().byId('periodButton');
			if (userPref.defaultPeriod === 1) {
				this.twoWeek = false;
				this.startDate = new Date();
				this.isByWeekly = 0;
				currentWeekNumber = datetime.getWeek(this.startDate);
				currentYear = (new Date(this.startDate.getTime())).getFullYear();
				
			} else {
				this.twoWeek = true;
				this.startDate = datetime.getLastWeek(new Date());
				this.isByWeekly = 1;
				currentWeekNumber = datetime.getWeek(this.startDate);
				currentYear = (new Date(this.startDate.getTime())).getFullYear();
				oPeriodbutton.setSelectedKey("twoWeek");
			}

			this.getView().byId("table").mBindingInfos.items.filters[0].oValue1 = currentWeekNumber; //WeekNumber
			this.getView().byId("table").mBindingInfos.items.filters[1].oValue1 = currentYear; //WeekYear
			this.getView().byId("table").mBindingInfos.items.filters[2].oValue1 = this.isByWeekly; //isByWeekly
			this._calendarBinding(this.startDate, this.isByWeekly + 1);

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
			var sTitle,
				oTable = oEvent.getSource(),
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
			if (oKey === 'OneWeek') {
				this.twoWeek = false;
				this.startDate = new Date();
				this._calendarBinding(this.startDate, 1);
			} else {
				this.twoWeek = true;
				this.startDate = datetime.getLastWeek(new Date());
				this._calendarBinding(this.startDate, 2);
			}
		},

		onEmployeSearch: function(oEvent) {
			var oTable = this.byId("table");

			//var oTableSearchState = [];
			var sQuery = oEvent.getParameter("query");
			this.employeeFilter = sQuery;
			var Filters = [new Filter("WeekNumber", FilterOperator.EQ, this.currentWeekNumber), new Filter("WeekYear", FilterOperator.EQ,
				this.currentYear), new Filter("isByWeekly", FilterOperator.EQ, this.isByWeekly)];

			if (sQuery && sQuery.length > 0) {

				Filters.push(new Filter("EmployeeName", FilterOperator.Contains, sQuery));

			}

			oTable.getBinding("items").filter(Filters, "Application");

		},
		OnHourPress: function(oEvent) {
			var oView = this.getView();
			var oDialog = oView.byId("EmpDayCheckDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.vinci.timesheet.admin.view.EmployeeDayDialog", this);
				oView.addDependent(oDialog);
			}

			oDialog.open();
		},
		OnskipFilterScreen: function(oEvent) {
			var filterView = this.getView().byId('adminFilter');
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
				this.startDate.setDate(this.startDate.getDate() - 14);
				this._calendarBinding(this.startDate, 2);
			} else {
				this.startDate.setDate(this.startDate.getDate() - 7);
				this._calendarBinding(this.startDate, 1);
			}
		},
		onFuturePeriodNavPress: function(oEvent) {
			if (this.twoWeek) {
				this.startDate.setDate(this.startDate.getDate() + 14);
				this._calendarBinding(this.startDate, 2);
			} else {
				this.startDate.setDate(this.startDate.getDate() + 7);
				this._calendarBinding(this.startDate, 1);
			}
		},
		OnCancelEmpDayCheckDialog: function(oEvent) {
			var oDialog = this.getView().byId("EmpDayCheckDialog");
			oDialog.close();
		},
		OnCancelFilterDialog: function(oEvent) {
			var oDialog = this.getView().byId("filterDialog");
			oDialog.close();
		},

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
			this.currentYear = (new Date(monday.getTime())).getFullYear();
			this.isByWeekly = 0;
			if (noOfWeek === 2) {
				this.isByWeekly = 1;
			}
			var oTable = this.byId("table");
			if (oTable.getBinding("items") != null) {

				var existingFilters = oTable.mBindingInfos.items.filters;

				var Filters = [new Filter("WeekNumber", FilterOperator.EQ, this.currentWeekNumber), new Filter("WeekYear", FilterOperator.EQ,
					this.currentYear), new Filter("isByWeekly", FilterOperator.EQ, this.isByWeekly)];
				if (this.employeeFilter != null && this.employeeFilter.length > 0) {
					Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.employeeFilter));
				}

				oTable.getBinding("items").filter(Filters, "Application");
			}

		}

	});

});