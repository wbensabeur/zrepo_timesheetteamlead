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
			this.getModel("calendar").setProperty("/data/0/ColumnTxt1",sTitle);
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
				this._calendarBinding(new Date(), 1);
			} else {
				this.twoWeek = true;
				this._calendarBinding(datetime.getLastWeek(new Date()), 2);
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
			var oString = this.getResourceBundle().getText("week")+' ' + currentWeekNumber + ',' + month + ' ' + currentYear + ' - '+this.getResourceBundle().getText("from")+' ';
			var dd = oDate.getDate();
			var mm = oDate.getMonth() + 1;
			oString = oString.concat(dd + '/' + mm + ' '+this.getResourceBundle().getText("to")+' ');
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
			var currentWeekNumber = datetime.getWeek(monday);
			var currentYear = (new Date(monday.getTime())).getFullYear();
			var isByWeekly = 0;
			if (noOfWeek === 2) {
				isByWeekly = 1;
			}
			var oTable = this.byId("table");
			if (oTable.getBinding("items") != null) {
				var Filters = [new Filter("WeekNumber", FilterOperator.EQ, currentWeekNumber), new Filter("WeekYear", FilterOperator.EQ,
					currentYear), new Filter("isByWeekly", FilterOperator.EQ, isByWeekly)];
				oTable.getBinding("items").filter(Filters, "Application");
			}
			var weekday = [this.getResourceBundle().getText("tablleColTitleSun"), this.getResourceBundle().getText("tablleColTitleMon"), this.getResourceBundle()
				.getText("tablleColTitleTues"), this.getResourceBundle().getText("tablleColTitleWed"), this.getResourceBundle().getText(
					"tablleColTitleThru"), this.getResourceBundle().getText("tablleColTitleFri"), this.getResourceBundle().getText(
					"tablleColTitleSat")
			];
			var idata = {
				ColumnTxt1: this.getResourceBundle().getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: '',
				ComboVisible: true,
				width: '15em',
				Date: new Date(monday.getTime())
			};
			oCalendarData.data.push(idata);
			for (var d = monday; d <= sunday; d.setDate(d.getDate() + 1)) {
				var cDate = d;
				var data = {
					ColumnTxt1: weekday[d.getDay()],
					ColumnTxt2: '  ' + d.getDate(),
					width: "auto",
					ComboVisible: false,
					Date: new Date(cDate.getTime())
				};
				oCalendarData.data.push(data);
			}

			var oCalendarModel = new JSONModel(oCalendarData);
			this.setModel(oCalendarModel, "calendar");
		}

	});

});