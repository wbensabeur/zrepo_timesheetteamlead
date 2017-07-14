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
			var userPref = {
				defaultBU:'BU1',
				defaultPeriod:1
			};
			var oModel = new JSONModel(userPref);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};

});