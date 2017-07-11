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
			this.twoWeek = false;
			this.startDate = new Date();
			this.employeeFilter = null;

			var currentWeekNumber = datetime.getWeek(this.startDate);
			var currentYear = (new Date(this.startDate.getTime())).getFullYear();

			this.getView().byId("table").mBindingInfos.items.filters[0].oValue1 = currentWeekNumber; //WeekNumber
			this.getView().byId("table").mBindingInfos.items.filters[1].oValue1 = currentYear; //WeekYear
			this.getView().byId("table").mBindingInfos.items.filters[2].oValue1 = 0; //isByWeekly
			this._calendarBinding(this.startDate, 1);

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},
		/* =========================================================== */
		/* event handlers                                              */
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
		},
		leaveFormatter: function(value) {
			if (value === null) {
				return "W";
			}
			if (value.getDay() === 0 || value.getDay() === 6) {
				return "L";
			}
			return "W";
		},
		selectPeriod: function(oEvent) {
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
		/*weekTwo: function(oEvent) {
			this.twoWeek = true;
			if (oEvent.getSource().getPressed()) {
				this.getView().byId('Week1').setPressed(false);
				this.getView().byId('Week1').setEnabled(true);
				this.getView().byId('Week2').setEnabled(false);
				this._calendarBinding(new Date(), 2);
			}
		},
		weekOne: function(oEvent) {
			this.twoWeek = false;
			if (oEvent.getSource().getPressed()) {
				this.getView().byId('Week2').setPressed(false);
				this.getView().byId('Week2').setEnabled(true);
				this.getView().byId('Week1').setEnabled(false);
				this._calendarBinding(new Date(), 1);
			}
		},*/
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
		onFilterPress: function(oEvent) {
			var filterView = this.getView().byId('adminFilter');
			if (filterView.getSize() === "0%") {
				filterView.setSize("38%");
			} else {
				filterView.setSize("0%");

			}
			/*if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.vinci.timesheet.admin.view.filter", this);
				
			}
 
			this._oDialog.setModel(this.getView().getModel());
			this._oDialog.setContentHeight("900px");
			this._oDialog.setContentWidth("390px");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();*/

		},
		booleanNot: function(value) {
			if (value) {
				return false;
			}
			return true;
		},
		periodFormat: function(oDate) {
			var currentWeekNumber = datetime.getWeek(oDate);
			var month = oDate.toLocaleString(sap.ui.getCore().getConfiguration().getLocale().toString(), {
				month: "long"
			});
			var currentYear = oDate.getFullYear();
			var oString = this.getResourceBundle().getText("week") + ' ' + currentWeekNumber + ',' + month + ' ' + currentYear + ' - ' + this.getResourceBundle()
				.getText("from") + ' ';
			var dd = oDate.getDate();
			var mm = oDate.getMonth() + 1;
			oString = oString.concat(dd + '/' + mm + ' ' + this.getResourceBundle().getText("to") + ' ');
			var oDateEnd = null;

			if (this.twoWeek) {
				oDateEnd = datetime.getLastDay(oDate, 2);
			} else {
				oDateEnd = datetime.getLastDay(oDate, 1);
			}
			var dd2 = oDateEnd.getDate();
			var mm2 = oDateEnd.getMonth() + 1;
			return oString + dd2 + '/' + mm2;
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
		//	onAfterRendering: function() {
		//
		//	},

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
			var monday = datetime.getMonday(startDate);
			var sunday = datetime.getLastDay(monday, noOfWeek);
			var oCalendarData = {
				StartDate: new Date(monday.getTime()),
				data: []
			};
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
				if(this.employeeFilter != null && this.employeeFilter.length > 0)
				{
					Filters.push(new Filter("EmployeeName", FilterOperator.Contains, this.employeeFilter));
				}

				oTable.getBinding("items").filter(Filters, "Application");
			}

			var weekday = [this.getResourceBundle().getText("tablleColTitleSun"), this.getResourceBundle().getText("tablleColTitleMon"), this.getResourceBundle()
				.getText("tablleColTitleTues"), this.getResourceBundle().getText("tablleColTitleWed"), this.getResourceBundle().getText(
					"tablleColTitleThru"), this.getResourceBundle().getText("tablleColTitleFri"), this.getResourceBundle().getText(
					"tablleColTitleSat")
			];
			/*var idata = {
				ColumnTxt1: this.getResourceBundle().getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: 'Business Unit 1',
				ComboVisible: true,
				width: '18.18%',
				Date: new Date(monday.getTime())
			};
			oCalendarData.data.push(idata);*/
			
			if (noOfWeek === 2) {
			
			var idata = {
				ColumnTxt1: this.getResourceBundle().getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: 'Business Unit 1',
				ComboVisible: true,
				width: '18.18%',
				cssClass:'tableColumnE',
				Date: new Date(monday.getTime())
			};
			oCalendarData.data.push(idata);
			
			for (var d = monday; d <= sunday  ; d.setDate(d.getDate() + 1)) {
				var cDate = d;
				var data = {
					ColumnTxt1: weekday[d.getDay()],
					ColumnTxt2: '  ' + d.getDate(),
					width: "6%",
					cssClass:'tableColumn',
					ComboVisible: false,
					Date: new Date(cDate.getTime())
				};
				oCalendarData.data.push(data);
			}	
			}
			else{
				
			var idata = {
				ColumnTxt1: this.getResourceBundle().getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: 'Business Unit 1',
				ComboVisible: true,
				cssClass:'tableColumnE',
				width: '18.18%',
				Date: new Date(monday.getTime())
			};
			oCalendarData.data.push(idata);	
				
			var friday = datetime.getTodayDate(new Date());
			friday.setDate(sunday.getDate() - 2);
			for (var d = monday; d <= friday  ; d.setDate(d.getDate() + 1)) {
				var cDate = d;
				var data = {
					ColumnTxt1: weekday[d.getDay()],
					ColumnTxt2: '  ' + d.getDate(),
					width: "13.13%",
					cssClass:'tableColumn',
					ComboVisible: false,
					Date: new Date(cDate.getTime())
				};
				oCalendarData.data.push(data);
			}
			
			var saturday = datetime.getTodayDate(new Date());
			saturday.setDate(sunday.getDate() - 1);
			for (var d2 = saturday; d2 <= sunday; d2.setDate(d2.getDate() + 1)) {
				var cDate2 = d2;
				var data2 = {
					ColumnTxt1: weekday[d2.getDay()],
					ColumnTxt2: '  ' + d2.getDate(),
					width: "auto",
					cssClass:'tableColumn',
					ComboVisible: false,
					Date: new Date(cDate2.getTime())
				};
				oCalendarData.data.push(data2);
			}
			}

			var oCalendarModel = new JSONModel(oCalendarData);
			this.setModel(oCalendarModel, "calendar");
		}

	});

});