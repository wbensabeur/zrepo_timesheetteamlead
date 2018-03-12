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
				application:'TEAMLEAD',
				applicationVersion:'3',
				defaultBU:defaultBU,
				defaultPeriod:defaultPeriod,
				employeeFilter:null,
				equipmentFilter:null,
				startDate:startDate,
				userID:null,
				successMaskEntry : false,
				successWeekSubmit : false,
				defaultHours : false,
				durationFlag : false,
				defaultIPD : false,
				defaultKM : false,
				defaultAbsence : false,
				defaultEquipment : false,
				defaultOvernight : false,
				defaultBonus: false,
				defaultCraftCode: false,
				teamFilter: null,
				teamName:null,
				signatureRequired : false,
				helpLink :null,
				EmployeeID :null
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
		},
		createEmployeeDaySelection: function () {
			
			var data = [];
			var oModel = new JSONModel(data);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};

});