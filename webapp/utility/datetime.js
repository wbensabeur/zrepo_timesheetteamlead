sap.ui.define([], function() {
	"use strict";

	return {

		getMonday: function(cDate) {
			//cDate = new Date(cDate.getUTCFullYear(), cDate.getMonth(), cDate.getDate());
			cDate = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate());
			var day = cDate.getDay(),
				diff = cDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
			return new Date(cDate.setDate(diff));
		},
		getLastWeek: function(cDate) {
			//var lastWeek = new Date(cDate.getUTCFullYear(), cDate.getMonth(), cDate.getDate() - 7);
			var lastWeek = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate() - 7);
			return lastWeek;
		},
		getNextWeek: function(cDate) {
			//var nextWeek = new Date(cDate.getUTCFullYear(), cDate.getMonth(), cDate.getDate() + 7);
			var nextWeek = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate() + 7);
			return nextWeek;
		},
		getLastMonday: function(cDate) {
			//cDate = new Date(cDate.getUTCFullYear(), cDate.getMonth(), cDate.getDate());
			cDate = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate());
			var day = cDate.getDay(),
				diff = cDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
			return new Date(cDate.setDate(diff));
		},

		getLastDay: function(cDate, noOfWeeks) {

			var oDate = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate());
			var numberOfDaysToAdd = 7 * noOfWeeks;
			return new Date(oDate.setDate(cDate.getDate() + numberOfDaysToAdd - 1));
		},

		getWeek: function(cDate) {
			var oDate = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate());
			oDate.setHours(0, 0, 0, 0);
			// Thursday in current week decides the year.
			oDate.setDate(oDate.getDate() + 3 - (oDate.getDay() + 6) % 7);
			// January 4 is always in week 1.
			//var week1 = new Date(oDate.getUTCFullYear(), 0, 4);
			var week1 = new Date(oDate.getFullYear(), 0, 4);
			// Adjust to Thursday in week 1 and count number of weeks from date to week1.
			return 1 + Math.round(((oDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

		},
		getTodayDate: function(cDate) {
			//var oDate = new Date(cDate.getUTCFullYear(), cDate.getMonth(), cDate.getDate());
			var oDate = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate());
			return oDate;
		},
		getCalenderDateOnlyData: function(startDate, noOfWeek,resourceBundle) {
			var monday = this.getMonday(startDate);
			var sunday = this.getLastDay(monday, noOfWeek);
			var biweekly = false;
			if(noOfWeek === 2)
				biweekly = true;
			var oCalendarData = {
				StartDate: new Date(monday.getTime()),
				BiWeekly: biweekly,
				data: []
			};
			var weekday = [resourceBundle.getText("tablleColTitleSun"), resourceBundle.getText("tablleColTitleMon"), resourceBundle
				.getText("tablleColTitleTues"), resourceBundle.getText("tablleColTitleWed"), resourceBundle.getText(
					"tablleColTitleThru"), resourceBundle.getText("tablleColTitleFri"), resourceBundle.getText(
					"tablleColTitleSat")
			];
		/*	var idata = {
				ColumnTxt1: resourceBundle.getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: '...',
				ComboVisible: true,
				width: '18.18%',
				cssClass: 'tableColumnE',
				Date: new Date(monday.getTime())
			};
			oCalendarData.data.push(idata);*/
			if (noOfWeek === 2) {

				for (var d = monday; d <= sunday; d.setDate(d.getDate() + 1)) {
					var cDate = d;
					var data = {
						ColumnTxt1: weekday[d.getDay()],
						ColumnTxt2: '  ' + d.getDate(),
						width: "6%",
						cssClass: 'tableColumn',
						ComboVisible: false,
						Date: new Date(cDate.getTime())
					};
					oCalendarData.data.push(data);
				}
			} else {

				var friday = this.getTodayDate(new Date());
				friday.setTime(sunday.getTime() - (2 * 24 * 60 * 60 * 1000));
				for (var d3 = monday; d3 <= friday; d3.setDate(d3.getDate() + 1)) {
					var cDate3 = d3;
					var data3 = {
						ColumnTxt1: weekday[d3.getDay()],
						ColumnTxt2: '  ' + d3.getDate(),
						width: "15%",
						cssClass: 'tableColumn',
						ComboVisible: false,
						Date: new Date(cDate3.getTime())
					};
					oCalendarData.data.push(data3);
				}

				var saturday = this.getTodayDate(new Date());
				saturday.setTime(sunday.getTime() - (1 * 24 * 60 * 60 * 1000));
				for (var d2 = saturday; d2 <= sunday; d2.setDate(d2.getDate() + 1)) {
					var cDate2 = d2;
					var data2 = {
						ColumnTxt1: weekday[d2.getDay()],
						ColumnTxt2: '  ' + d2.getDate(),
						width: "auto",
						cssClass: 'tableColumn',
						ComboVisible: false,
						Date: new Date(cDate2.getTime())
					};
					oCalendarData.data.push(data2);
				}
			}
			return oCalendarData;
		},
		getCalenderData: function(startDate, noOfWeek,resourceBundle) {
			var monday = this.getMonday(startDate);
			var sunday = this.getLastDay(monday, noOfWeek);
			var biweekly = false;
			if(noOfWeek === 2)
				biweekly = true;
			var oCalendarData = {
				StartDate: new Date(monday.getTime()),
				BiWeekly: biweekly,
				data: []
			};
			var weekday = [resourceBundle.getText("tablleColTitleSun"), resourceBundle.getText("tablleColTitleMon"), resourceBundle
				.getText("tablleColTitleTues"), resourceBundle.getText("tablleColTitleWed"), resourceBundle.getText(
					"tablleColTitleThru"), resourceBundle.getText("tablleColTitleFri"), resourceBundle.getText(
					"tablleColTitleSat")
			];
			var idata = {
				ColumnTxt1: resourceBundle.getText("tableNameColumnTitleEmpName"),
				ColumnTxt2: '...',
				ComboVisible: true,
				width: '18.18%',
				cssClass: 'tableColumnE',
				Date: new Date(monday.getTime())
			};
			oCalendarData.data.push(idata);
			if (noOfWeek === 2) {

				for (var d = monday; d <= sunday; d.setDate(d.getDate() + 1)) {
					var cDate = d;
					var data = {
						ColumnTxt1: weekday[d.getDay()],
						ColumnTxt2: '  ' + d.getDate(),
						width: "6%",
						cssClass: 'tableColumn',
						ComboVisible: false,
						Date: new Date(cDate.getTime())
					};
					oCalendarData.data.push(data);
				}
			} else {

				var friday = this.getTodayDate(new Date());
				friday.setTime(sunday.getTime() - (2 * 24 * 60 * 60 * 1000));
				for (var d3 = monday; d3 <= friday; d3.setDate(d3.getDate() + 1)) {
					var cDate3 = d3;
					var data3 = {
						ColumnTxt1: weekday[d3.getDay()],
						ColumnTxt2: '  ' + d3.getDate(),
						width: "13.13%",
						cssClass: 'tableColumn',
						ComboVisible: false,
						Date: new Date(cDate3.getTime())
					};
					oCalendarData.data.push(data3);
				}

				var saturday = this.getTodayDate(new Date());
				saturday.setTime(sunday.getTime() - (1 * 24 * 60 * 60 * 1000));
				for (var d2 = saturday; d2 <= sunday; d2.setDate(d2.getDate() + 1)) {
					var cDate2 = d2;
					var data2 = {
						ColumnTxt1: weekday[d2.getDay()],
						ColumnTxt2: '  ' + d2.getDate(),
						width: "auto",
						cssClass: 'tableColumn',
						ComboVisible: false,
						Date: new Date(cDate2.getTime())
					};
					oCalendarData.data.push(data2);
				}
			}
			return oCalendarData;
		},
		getODataDateFilter: function (date) {
			if (date && typeof date.toISOString === "function") {
				var time = date.toISOString();
				return "datetime'" + time.substr(0, time.length - 1) + "'";
			}
			return "";
		},
		getODataDateKey: function (date) {
			if (date && typeof date.toISOString === "function") {
				var dd = date.getDate();
				if (dd < 10) {
					dd = '0' + dd;
				}
				var mm = date.getMonth() + 1;
				if (mm < 10) {
					mm = '0' + mm;
				}
				
				//return "datetime'" + date.getUTCFullYear()+"-"+mm+"-"+dd + "T00%3A00%3A00'";
				return "datetime'" + date.getFullYear()+"-"+mm+"-"+dd + "T00%3A00%3A00'";
			}
			return "";
		},
		timeToDecimal: function (t) {
		 var arr = t.split(':');
		 var Hrs = parseFloat(parseInt(arr[0], 10));
		 var mins = parseFloat((arr[1]/60)).toFixed(2);
    	 return Hrs + parseFloat(mins);
		} ,
		timeToMilliSec: function(time) {  // format = 13:00 PM
			var arr = time.split(':');
			var arr2 = arr[1].split(' ');
			
			var hour = Number(arr[0]);
			var min = Number (arr2[0]);
			
			
			var date = new Date();	
			//var oDate = new Date(date.getUTCFullYear(), date.getMonth(), date.getDate(), hour, min, 0 );
			var oDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, min, 0 );
		//	var offset = date.getTimezoneOffset() * 60000	;
			return oDate.getTime();	//(hour * 60 + min )*60000 + offset; 
			
		}

	};

});