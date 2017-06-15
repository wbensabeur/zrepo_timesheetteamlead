jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"com/vinci/timesheet/admin/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"com/vinci/timesheet/admin/test/integration/pages/Worklist",
		"com/vinci/timesheet/admin/test/integration/pages/Object",
		"com/vinci/timesheet/admin/test/integration/pages/NotFound",
		"com/vinci/timesheet/admin/test/integration/pages/Browser",
		"com/vinci/timesheet/admin/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.vinci.timesheet.admin.view."
	});

	sap.ui.require([
		"com/vinci/timesheet/admin/test/integration/WorklistJourney",
		"com/vinci/timesheet/admin/test/integration/ObjectJourney",
		"com/vinci/timesheet/admin/test/integration/NavigationJourney",
		"com/vinci/timesheet/admin/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});