sap.ui.define([
	"com/vinci/timesheet/admin/utility/datetime",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(datetime, NumberFormat,Filter,FilterOperator) {
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
				if(currentWeekNumber < 52) {
				oString = this.getResourceBundle().getText("week") + " " + currentWeekNumber + " " + this.getResourceBundle().getText("and") + " " +
					(currentWeekNumber + 1) + ', ' + month + ' ' + currentYear + ' - ' + this.getResourceBundle()
					.getText("from") + ' ';
				}
				else {
					oString = this.getResourceBundle().getText("week") + " " + currentWeekNumber + " " + this.getResourceBundle().getText("and") +  ' 1, ' + month + ' ' + currentYear + ' - ' + this.getResourceBundle()
					.getText("from") + ' ';	
				}
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
		booleanNotPRJL: function(value,ProjectId) {
			if (value) {
				return false;
			} else {
				if(ProjectId === null || ProjectId === undefined || ProjectId === '') {
					return false;
				}	
			}
			return true;
		},
		booleanNotPRJLForNew: function(value,ProjectId) {
			if (value) {
				return true;
			} else {
				if(ProjectId === null || ProjectId === undefined || ProjectId === '') {
					return true;
				}	
			}
			return false;
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
		chkSelectedFormatter: function(value) {
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
		disableDays: function(isEntryEnabled,noEditFlag) {
			if (isEntryEnabled && !noEditFlag) {
				return '';
			}
			return 'D1';
		},
		disableDaysBoolean: function(isEntryEnabled,noEditFlag) {
			if (isEntryEnabled && !noEditFlag) {
				return true;
			}
			return false;
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
		browserType: function(empName) {
			if(sap.ui.Device.browser.name === sap.ui.Device.browser.BROWSER.INTERNET_EXPLORER) {
				return 'ie';
			}
			return 'nie';
		},
		disableTeamEmployees: function(IsTimeEntryEnable) {
			return 'Inactive';
		},
		disableEmployees: function(isEntryEnabled,noEditFlag) {
			if (isEntryEnabled && !noEditFlag) {
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
		numEmptyFormatter: function(value) {
			return '';
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
		getNumber: function(Value) {
			if(Value) {
			return Number(Value);
			} else {
				return '';
			}
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
		},
		getProject: function(ProjectID, ProjectName) {
			if(ProjectID !== undefined && ProjectID !== null && ProjectID !== "") {
				return ProjectID + " / " + ProjectName;
			}
			return ProjectID + " " + ProjectName;
		},
		updateUserPreference: function (odataModel, userPreferenceModel) {
		
		odataModel.read('/PersonalizationSet', {
				async: false,
				filters: [new Filter("ApplicationName", FilterOperator.EQ, userPreferenceModel.getProperty('/application'))],
				success: function(data) {
					var results = data.results;
					for (var k = 0; k < results.length; k++) {
						var key = data.results[k].PersoId;
						switch (key) {
							case 'BU':
								userPreferenceModel.setProperty('/defaultBU', data.results[k].PersoValue);
								userPreferenceModel.setProperty('/defaultBUT', data.results[k].PersoDesc);
								break;
							case 'BW':
								if (data.results[k].PersoValue === null || data.results[k].PersoValue === undefined || data.results[k].PersoValue === '') {
									userPreferenceModel.setProperty('/defaultPeriod', 1);
									userPreferenceModel.setProperty('/startDate', new Date());

								} else {
									userPreferenceModel.setProperty('/defaultPeriod', 2);
									userPreferenceModel.setProperty('/startDate', datetime.getLastWeek(new Date()));
								}
								break;
							case 'HOURS':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultHours', true);
								else
									userPreferenceModel.setProperty('/defaultHours', false);
								break;
							case 'IPD':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultIPD', true);
								else
									userPreferenceModel.setProperty('/defaultIPD', false);
								break;
							case 'KM':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultKM', true);
								else
									userPreferenceModel.setProperty('/defaultKM', false);
								break;
							case 'ABSENCE':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultAbsence', true);
								else
									userPreferenceModel.setProperty('/defaultAbsence', false);
								break;
							case 'EQUIPMENT':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultEquipment', true);
								else
									userPreferenceModel.setProperty('/defaultEquipment', false);
								break;
							case 'OVERNIGHT':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultOvernight', true);
								else
									userPreferenceModel.setProperty('/defaultOvernight', false);
								break;
							case 'BONUS':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultBonus', true);
								else
									userPreferenceModel.setProperty('/defaultBonus', false);
								break;
							case 'CRAFTCODE':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultCraftCode', true);
								else
									userPreferenceModel.setProperty('/defaultCraftCode', false);
								break;
							case 'DT':
								if (data.results[k].PersoValue === 'TIME')
									userPreferenceModel.setProperty('/durationFlag', true);
								else
									userPreferenceModel.setProperty('/durationFlag', false);
								break;
							case 'SIGNATURE':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/signatureRequired', true);
								else
									userPreferenceModel.setProperty('/signatureRequired', false);
								break;

						}
					}

				}
			});	
		
		}
	};

});
