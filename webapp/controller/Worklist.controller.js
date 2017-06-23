sap.ui.define([
		"com/vinci/timesheet/admin/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"com/vinci/timesheet/admin/model/formatter",
		"com/vinci/timesheet/admin/utility/datetime",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter,datetime, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("com.vinci.timesheet.admin.controller.Worklist", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			/*onInit : function () {
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
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");
				
				// model for Calendar
				var monday = datetime.getMonday(new Date());
				var sunday = datetime.getLastDay(monday,2);
				var oCalendarData = [];
				var weekday = [this.getResourceBundle().getText("tablleColTitleSun"), this.getResourceBundle().getText("tablleColTitleMon"), this.getResourceBundle().getText("tablleColTitleTues"), this.getResourceBundle().getText("tablleColTitleWed"), this.getResourceBundle().getText("tablleColTitleThru"), this.getResourceBundle().getText("tablleColTitleFri"), this.getResourceBundle().getText("tablleColTitleSat")];
				var idata = {
						ColumnTxt1: this.getResourceBundle().getText("tableNameColumnTitleEmpName"),
						ColumnTxt2: '' ,
						width :'20%' ,
						Date : new Date()
					};
					oCalendarData.push(idata);
				for (var d = monday; d < sunday; d.setDate(d.getDate() + 1)) {
					var data = {
						ColumnTxt1:  weekday[d.getDay()] ,
						ColumnTxt2: '  '+ d.getDate(),
						width :"11%" ,
						Date : d
					};
					oCalendarData.push(data);
				}

				var oCalendarModel = new JSONModel(oCalendarData);
				this.setModel(oCalendarModel, "calendar");
				
				/// Workdat status binding
				

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for worklist's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},*/

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
			/*onUpdateFinished : function (oEvent) {
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
			},
			onUpdateStarted : function (oEvent) {
			var oTable = oEvent.getSource();
			oTable.getBinding("items");
			
			},
*/
			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			/*onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},*/


			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser historz
			 * @public
			 */
			/*onNavBack : function() {
				history.go(-1);
			},*/


			/*onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var oTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						oTableSearchState = [new Filter("FullName", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(oTableSearchState);
				}

			},*/

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			/*onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},*/
			/*onSearchPress : function(){
			this.getId('columnList');
			
			},*/

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			/*_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("EmpId")
				});
			},*/

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {object} oTableSearchState an array of filters for the search
			 * @private
			 */
			/*_applySearch: function(oTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(oTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (oTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}*/

		});
	}
);