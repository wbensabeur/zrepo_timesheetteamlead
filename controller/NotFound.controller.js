sap.ui.define([
		"com/vinci/timesheet/admin/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.vinci.timesheet.admin.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);