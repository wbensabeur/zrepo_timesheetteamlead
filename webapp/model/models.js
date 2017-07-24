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
		createUserPersolisationModel: function(backendModel) {
			var startDate = new Date(); /// =datetime.getLastWeek(new Date()); in case of default 2 week display
			
			var userPref = {
				defaultBU:'BU1',
				defaultPeriod:1,
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