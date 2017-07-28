sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createUserPersolisationModel: function() {
			var startDate = null; /// =datetime.getLastWeek(new Date()); in case of default 2 week display
			var defaultBU = null;
			var defaultPeriod = null;
		
			var userPref = {
				defaultBU:defaultBU,
				defaultPeriod:defaultPeriod,
				employeeFilter:null,
				startDate:startDate
			};
			var oModel = new JSONModel(userPref);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createEmployeeSelection: function () {
			var startDate = new Date();
			var data = {
				startDate:startDate,
				employees:[]
			};
			var oModel = new JSONModel(data);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};

});