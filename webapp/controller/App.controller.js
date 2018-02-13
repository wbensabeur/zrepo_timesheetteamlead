sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("com.vinci.timesheet.admin.controller.App", {

		onInit: function() {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);

			var logout = sap.ui.getCore().byId("shellLogout");
			var that = this;
			logout.attachPress(function(oEvent) {

				MessageBox.confirm(
					that.getResourceBundle().getText("confirmLogoffMsg"), {
						title: that.getResourceBundle().getText("logoutcnfm"),
						onClose: function fnCallbackConfirm(oAction) {
							if (oAction === 'OK') {
								var hostname = window.location.origin;
								var SAMLLogoffURL = hostname + '/sap/public/bc/icf/logoff?redirectURL=' + hostname + '/mobitime';
								sap.m.URLHelper.redirect(SAMLLogoffURL, false);
							} else {
								return;
							}
						}
					});

				/*var myPopup = window.open(SAMLLogoffURL, 'logoff', 'left=20,top=20,width=100,height=100,resizable=0');
				if (!sap.ui.Device.browser.msie) {
					myPopup.onload = function() {
						logoutpage = true;
						myPopup.close();
						window.location.reload(true);
					}
				}
				setTimeout(function() {
					if (!logoutpage) {
						myPopup.close();
						window.location.reload(true);
					}
				}, 1500);*/
			});

			var help = sap.ui.getCore().byId("shellHelp");

			help.attachPress(function(oEvent) {
				var helpURL = 'https://help.sap.com';
				window.open(helpURL);

			});

			// apply content density mode to root view
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});

});