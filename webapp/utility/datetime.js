sap.ui.define([], function() {
	"use strict";

	return {

		getMonday: function(cDate) {
			cDate =new Date(cDate.getUTCFullYear(),cDate.getMonth(),cDate.getDate());
			var day = cDate.getDay(),
				diff = cDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
			return new Date(cDate.setDate(diff));
		},
		getLastWeek: function(cDate){
    		var lastWeek = new Date(cDate.getUTCFullYear(), cDate.getMonth(), cDate.getDate() - 7);
    		return lastWeek ;
		},
		getLastMonday: function(cDate) {
			cDate = new Date(cDate.getUTCFullYear(),cDate.getMonth(),cDate.getDate());
			var day = cDate.getDay(),
				diff = cDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
			return new Date(cDate.setDate(diff));
		},

		getLastDay: function(cDate, noOfWeeks) {
			
			var oDate = new Date(cDate.getUTCFullYear(),cDate.getMonth(),cDate.getDate());
			var numberOfDaysToAdd = 7 * noOfWeeks;
			return new Date(oDate.setDate(cDate.getDate() + numberOfDaysToAdd - 1));
		},

		getWeek: function(cDate) {
			var oDate =new Date(cDate.getUTCFullYear(),cDate.getMonth(),cDate.getDate());
			oDate.setHours(0, 0, 0, 0);
			// Thursday in current week decides the year.
			oDate.setDate(oDate.getDate() + 3 - (oDate.getDay() + 6) % 7);
			// January 4 is always in week 1.
			var week1 = new Date(oDate.getUTCFullYear(), 0, 4);
			// Adjust to Thursday in week 1 and count number of weeks from date to week1.
			return 1 + Math.round(((oDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

		},
		getTodayDate: function(cDate){
			var oDate =new Date(cDate.getUTCFullYear(),cDate.getMonth(),cDate.getDate());
			return oDate;
		}

	};


});