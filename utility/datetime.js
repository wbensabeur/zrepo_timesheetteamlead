sap.ui.define([], function() {
	"use strict";

	return {

		getMonday: function(cDate) {
			cDate = new Date(cDate);
			var day = cDate.getDay(),
				diff = cDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
			return new Date(cDate.setDate(diff));
		},

		getLastDay: function(cDate, noOfWeeks) {
			var oDate = new Date(cDate);
			var numberOfDaysToAdd = 7 * noOfWeeks;
			return new Date(oDate.setDate(cDate.getDate() + numberOfDaysToAdd));
		}

	};

});