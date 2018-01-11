sap.ui.define([
	"com/vinci/timesheet/admin/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
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
			logout.attachPress(function(oEvent) {

				var hostname = window.location.origin;
				var logoutpage = false;
				var SAMLLogoffURL = hostname + '/sap/saml2/sp/slo/300';
				var myPopup = window.open(SAMLLogoffURL, 'logoff', 'left=20,top=20,width=100,height=100,resizable=0');
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
				}, 1500);
			});

			// apply content density mode to root view
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});

});