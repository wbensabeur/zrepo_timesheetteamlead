sap.ui.define([
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/core/format/NumberFormat"
], function(datetime, NumberFormat) {
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
		dateFormatinEmpDay: function(oDate) {
			if (oDate && typeof oDate.toISOString === "function") {
				var month = oDate.toLocaleString(sap.ui.getCore().getConfiguration().getLocale().toString(), {
					weekday: "long"
				});
				month = month[0].toUpperCase() + month.slice(1);
				var dd = oDate.getDate();
				if (dd < 10) {
					dd = '0' + dd;
				}
				var mm = oDate.getMonth() + 1;
				if (mm < 10) {
					mm = '0' + mm;
				}
				return month + " " + dd + "/" + mm + "/" + oDate.getUTCFullYear();
			}
			return "";
		},

		periodFormat: function(oDate, biweekly) {
			var currentWeekNumber = datetime.getWeek(oDate);
			var month = oDate.toLocaleString(sap.ui.getCore().getConfiguration().getLocale().toString(), {
				month: "long"
			});
			month = month[0].toUpperCase() + month.slice(1);
			var currentYear = oDate.getFullYear();
			var oString = null;
			if (biweekly) {
				oString = this.getResourceBundle().getText("week") + " " + currentWeekNumber + " " + this.getResourceBundle().getText("and") + " " +
					(currentWeekNumber + 1) + ', ' + month + ' ' + currentYear + ' - ' + this.getResourceBundle()
					.getText("from") + ' ';
			} else {
				oString = this.getResourceBundle().getText("week") + " " + currentWeekNumber + ', ' + month + ' ' + currentYear + ' - ' + this.getResourceBundle()
					.getText("from") + ' ';
			}
			var dd = oDate.getDate();
			if (dd < 10) {
				dd = '0' + dd;
			}
			var mm = oDate.getMonth() + 1;
			if (mm < 10) {
				mm = '0' + mm;
			}
			oString = oString.concat(dd + '/' + mm + ' ' + this.getResourceBundle().getText("to") + ' ');
			var oDateEnd = null;

			if (this.twoWeek) {
				oDateEnd = datetime.getLastDay(oDate, 2);
			} else {
				oDateEnd = datetime.getLastDay(oDate, 1);
			}
			var dd2 = oDateEnd.getDate();
			if (dd2 < 10) {
				dd2 = '0' + dd2;
			}
			var mm2 = oDateEnd.getMonth() + 1;
			if (mm2 < 10) {
				mm2 = '0' + mm2;
			}
			return oString + dd2 + '/' + mm2;
		},
		booleanNot: function(value) {
			if (value) {
				return false;
			}
			return true;
		},
		weekendFormatter: function(number) {
			var oLocale = sap.ui.getCore().getConfiguration().getLocale();
			var oFormatOptions = {
				minIntegerDigits: 1,
				maxIntegerDigits: 3,
				minFractionDigits: 0,
				maxFractionDigits: 2
			};
			var oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions, oLocale);

			var valueInNum = oFloatFormat.format(Number(number));

			if (valueInNum === null || valueInNum === 0 || valueInNum === '') {
				return '';
			}
			return valueInNum;

		},
		leaveFormatter: function(value) {
			if (value === null || value === undefined || value === '') {
				return "";
			}
			if (value.getDay() === 0 || value.getDay() === 6) {
				return "L";
			}
			return "";
		},
		byWeeklyFormattre: function(isByWeekly) {
			if (isByWeekly) {
				var days = '14';
			} else {
				days = '7';
			}
			return days;
		},
		disableDays: function(isEntryEnabled) {
			if (isEntryEnabled) {
				return 'E';
			}
			return 'D1';
		},
		enableTeamDays: function(IsTimeEntryEnable) {
			return '';
		},
		titleLength: function(empName) {
			if (empName.length > 17) {
				return 'Long';
			} else {
				return 'Short';
			}
		},
		disableTeamEmployees: function(IsTimeEntryEnable) {
			return 'Inactive';
		},
		disableEmployees: function(isEntryEnabled) {
			if (isEntryEnabled) {
				return 'Active';
			}
			return 'Inactive';
		},
		DaySelectorTeamFormatter: function(value) {
			return "Inactive";
		},
		DaySelectorFormatter: function(value) {
			if (value === null || value === undefined || value === '') {
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
					status = this.getResourceBundle().getText("legend-draft");
					break;
				case 'W':
					status = this.getResourceBundle().getText("legend-waiting");
					break;
				case 'V':
					status = this.getResourceBundle().getText("legend-validated");
					break;
				case 'R':
					status = this.getResourceBundle().getText("legend-refused");
					break;
				default:
					status = '';
			}
			return status;

		},
		theoritecalHourFormat: function(filled, target) {
			var oLocale = sap.ui.getCore().getConfiguration().getLocale();
			var oFormatOptions = {
				minIntegerDigits: 1,
				maxIntegerDigits: 3,
				minFractionDigits: 0,
				maxFractionDigits: 2
			};
			var oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions, oLocale);
			var oFilled = oFloatFormat.format(Number(filled));
			var otarget = oFloatFormat.format(Number(target));

			if ((oFilled === otarget) || (oFilled === '' && otarget === '0') || (oFilled === '' && otarget === '') || (oFilled === '0' && otarget ===
					''))
				return 'T';
			else return 'NT';
		},
		numberFormatter: function(value) {
			var oLocale = sap.ui.getCore().getConfiguration().getLocale();
			var oFormatOptions = {
				minIntegerDigits: 1,
				maxIntegerDigits: 3,
				minFractionDigits: 0,
				maxFractionDigits: 2
			};
			var oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions, oLocale);
			var valueInNum = Number(value); //.toString();
			return oFloatFormat.format(valueInNum);
		},
		getUnit: function(type, hrUnit) {
			if (type === "IPD")
				return 'Q';
			else 
				return hrUnit;
		},
		getQuantity: function(type, hrs) {
			return Number(hrs);
			/*if (type === 'Hours')
			{
				return Number(hrs);
			}
			else if (type === "IPD"){
				return Number(hrs);
			}*/
		},
		favIcon: function(fav) {
			if (fav) {
				return "sap-icon://favorite";
			} else {
				return "sap-icon://unfavorite";
			}
		},
		datetotimestamp: function(date) {
			if (date instanceof Date) {
				return date.getTime();
			}
		},
		tableWidth: function(deviceType) {
			if (deviceType.desktop) {
				return "98%";
			}
			return "97%";
		},
		editVisibility: function(item,emp) {
			if(!item && emp)
				return true;
			else
				return false;
		},
		teamRowHeaderLablel: function(teamid) {
			var teamidnum = teamid.substring(teamid.search("TEAM")+5);
			var teamRowHeaderLablelText = this.getResourceBundle().getText("teamRowHeader") + " " + teamidnum + " :";
			return teamRowHeaderLablelText;
		},
		buFilterSelected: function(buValue) {
			if(this.userPref.defaultBU === buValue) {
				return true;
			} else {
				return false;
			}
		},
		teamFilterSelected: function(teamID) {
			if(this.userPref.teamFilter === teamID) {
				return true;
			} else {
				return false;
			}
		},
		allDaySelection: function (addTime) {
			if(addTime)
				return 0;
			else
				return 1;
		},
		ProjectDescFirstLine: function (text) {
			if(text === null)
			{
				return '';
			}
			else if(text.length < 25){
				return text;
			}
			else {
				return text.substring(0,25);
			}
		},
		ProjectDescSecondLine: function (text) {
			if(text === null)
			{
				return '';
			}
			else if(text.length < 25){
				return "";
			}
			else {
				return text.substring(25);
			}
		},
		IsProjectDescSecondLine: function (text) {
			if(text === null)
			{
				return false;
			}
			else if(text.length < 25){
				return false;
			}
			else {
				return true;
			}
		}
	};

});
