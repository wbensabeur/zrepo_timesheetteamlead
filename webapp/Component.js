sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/vinci/timesheet/admin/model/models",
	"com/vinci/timesheet/admin/utility/datetime",
	"com/vinci/timesheet/admin/controller/ErrorHandler",
	"sap/m/MessageBox",
	"com/vinci/timesheet/admin/model/formatter"
], function(UIComponent, Device, Filter, FilterOperator, models, datetime, ErrorHandler, MessageBox,formatter) {
	"use strict";

	return UIComponent.extend("com.vinci.timesheet.admin.Component", {
		formatter: formatter,
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function() {

			/*if (userBox != null) {
				userBox.setModel(this.getModel());
				userBox.bindAggregation("/TimeAdminSet");             
			}*/
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set the userPref model
			this.setModel(models.createUserPersolisationModel(), "userPreference");

			//set EmployeeSelection Model
			this.setModel(models.createEmployeeSelection(), "employeeSelected");

			//set EmployeeDaySelection Model
			this.setModel(models.createEmployeeDaySelection(), "employeeDaysSelected");
			var that = this;
			if (sap.hybrid !== undefined) {
				window.console.log("platfrom:" + sap.hybrid.getPlatform());
				window.console.log("Version:" + window.AppVersion.version);
				var platformType = sap.hybrid.getPlatform();
				var appVersion = window.AppVersion.version;
				if (platformType === undefined) {
					platformType = 'ios';
				}
				var url = "https://mobile.vinci-energies.net/app-version-middleware/services/isUpToDate/teamlead/" + platformType + "/" +
					appVersion;
				window.console.log("URL:" + url);

				jQuery.ajax({
					url: url,
					type: "GET",
					async: false,
					success: function(data) {
						if (data.upToDate) {
							var userPreferenceModel = that.getModel("userPreference");
							that._updateUserPreference(that.getModel(), userPreferenceModel);

							var userBox = sap.ui.getCore().byId('shellUser');

							that.getModel().read('/TimeAdminSet', {
								urlParameters: {
									"$select": "UserId,FullName"
								},
								success: function(data) {
									var results = data.results;
									var usrName = results[0].FullName;
									userBox.setUsername(usrName);
									userPreferenceModel.setProperty('/userID', results[0].UserId);
									that.getRouter().initialize();

								}
							});
						} else {
							MessageBox.alert(that.getModel("i18n").getResourceBundle().getText("versionIssue", [appVersion]));

						}

					},
					error: function(odata) {
						window.console.log(odata);
					}

				});

			} else {
				var userPreferenceModel = that.getModel("userPreference");
				//that._updateUserPreference(that.getModel(), userPreferenceModel);
				formatter.updateUserPreference(that.getModel(), userPreferenceModel);

				var userBox = sap.ui.getCore().byId('shellUser');

				that.getModel().read('/TimeAdminSet', {
					urlParameters: {
						"$select": "UserId,FullName"
					},
					success: function(data) {
						var results = data.results;
						var usrName = results[0].FullName;
						userBox.setUsername(usrName);
						userPreferenceModel.setProperty('/userID', results[0].UserId);
						that.getRouter().initialize();

					}
				});
			}

			// create the views based on the url/hash
			//this.getRouter().initialize(); done under  _updateUserPreference

		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function() {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		_updateUserPreference: function(odataModel, userPreferenceModel) {
			
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
								break;
							case 'IPD':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultIPD', true);
								break;
							case 'KM':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultKM', true);
								break;
							case 'ABSENCE':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultAbsence', true);
								break;
							case 'EQUIPMENT':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultEquipment', true);
								break;
							case 'OVERNIGHT':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultOvernight', true);
								break;
							case 'BONUS':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultBonus', true);
								break;
							case 'CRAFTCODE':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/defaultCraftCode', true);
								break;
							case 'DT':
								if (data.results[k].PersoValue === 'TIME')
									userPreferenceModel.setProperty('/durationFlag', true);
								break;
							case 'SIGNATURE':
								if (data.results[k].PersoValue === 'X')
									userPreferenceModel.setProperty('/signatureRequired', true);
								break;

						}
					}

				}
			});

		}

	});

});
