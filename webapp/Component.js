sap.ui.define([
			"sap/ui/core/UIComponent",
			"sap/ui/Device",
			"com/vinci/timesheet/admin/model/models",
			"com/vinci/timesheet/admin/utility/datetime",
			"com/vinci/timesheet/admin/controller/ErrorHandler"
		], function(UIComponent, Device, models,datetime, ErrorHandler) {
			"use strict";

			return UIComponent.extend("com.vinci.timesheet.admin.Component", {

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

						var userBox = sap.ui.getCore().byId('shellUser');
						if (userBox != null) {
							userBox.setModel(this.getModel('user'));
						}
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

						// create the views based on the url/hash
						//this.getRouter().initialize(); done under  _updateUserPreference
						this._updateUserPreference(this.getModel(),this.getModel('userPreference'));
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
						var that = this;
						odataModel.read('/PersonalizationSet', {
								async: false,
								success: function(data) {
									var results = data.results;
									for (var k = 0; k < results.length; k++) {
										var key = data.results[k].PersoId;
										switch (key) {
											case 'BU':
												userPreferenceModel.setProperty('/defaultBU', data.results[k].PersoValue);
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
												}
										}
									that.getRouter().initialize();	
									}
								});

						}

					});

			}
		);