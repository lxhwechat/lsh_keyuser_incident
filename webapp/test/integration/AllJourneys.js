jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zwx/sm/itsm/keyuserincidents/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/suite/ui/generic/template/integration/testLibrary/ListReport/pages/ListReport",
	"sap/suite/ui/generic/template/integration/testLibrary/ObjectPage/pages/ObjectPage"

], function (Opa5, Common, opaQunit, ListReport, ObjectPage) {
	"use strict";
	Opa5.extendConfig({
		autoWait: true,
		arrangements: new Common(), //CommonPageObject.getArrangement(),
		viewNamespace: "sap.suite.ui.generic.template",
		appParams: {
			"sap-ui-animation": false
        },
		testLibs: {
			fioriElementsTestLibrary: {
				Common: {
					appId: "zwx.sm.itsm.keyuserincidents", 
					entitySet: "IncidentSet"
				}
			}
		}
	});

	sap.ui.require([
		//"ehs/hs/rit/manages1/test/integration/RITWithJobJourney",
		"ehs/hs/rit/manages1/test/integration/RITWithoutJobJourney",

		"ehs/hs/rit/manages1/test/integration/TempTestJourney"
	], function () {
		QUnit.config.testTimeout = 220000;
//		QUnit.config.testTimeout = 999000;
		QUnit.start();
	});
});