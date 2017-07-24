sap.ui.define([
	"com/vinci/timesheet/admin/utility/datetime"
], function(datetime) {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
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
		booleanNot: function(value) {
			if (value) {
				return false;
			}
			return true;
		},
		weekendFormatter: function(number) {
			if (number === null || number === 0 || number === '') {
				return '';
			}
			return number;

		},
		leaveFormatter: function(value) {
			if (value === null) {
				return "";
			}
			if (value.getDay() === 0 || value.getDay() === 6) {
				return "L";
			}
			return "";
		},
		disableDays: function(isEntryEnabled) {
			if (isEntryEnabled) {
				return '';
			}
			return 'D';
		},
		disableEmployees: function(isEntryEnabled) {
			if (isEntryEnabled) {
				return 'Active';
			}
			return 'Inactive';
		},
		DaySelectorFormatter: function(value) {
			if (value === null) {
				return "Active";
			}
			if (value.getDay() === 0 || value.getDay() === 6) {
				return "Inactive";
			}
			return "Active";
		},
		leaveDaySelectorFormatter: function(value) {
			if (value === null) {
				return "";
			}
			if (value.getDay() === 0 || value.getDay() === 6) {
				return "Inactive";
			}
			return "";
		},
		statusFormat: function(value) {
			var status = '';
			switch (value) {
				case 'D':
					status = 'Draft';
					break;
				case 'W':
					status = 'Waiting';
					break;
				case 'V':
					status = 'Validated';
					break;
				case 'R':
					status = 'Refused';
					break;
				default:
					status = '';
			}
		return status;
			
		}

	};

});