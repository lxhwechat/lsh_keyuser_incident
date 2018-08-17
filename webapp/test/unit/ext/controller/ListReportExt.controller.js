sap.ui.define([
	"zwx/sm/itsm/keyuserincidents/ext/controllers/ListReportExt.controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(ListReportExt,JSONModel) {
	"use strict";

	QUnit.module("ListReportExtController", {
		beforeEach: function() {
			this.controller = new ListReportExt();

			// INITIALIZE TEST INFRASTRUCTURE
			this.controller.oViewModel = new JSONModel({
				DialogBusy: false,
				CreateTemplateRiskDialogOKButtonEnabled: false,
				EHSRiskIdentificationTmplName: "",
				EHSJobUUID: "00000000-0000-0000-0000-000000000000"
			});

			// double the template table gathered later on  by getView().byId()
			this.controller.foTemplateTableRefresh = sinon.stub();              
			this.controller.oByIdDouble = {
				getBinding: sinon.stub().returns( { 
					refresh: this.controller.foTemplateTableRefresh
				})
			};

			// view stubs
			this.controller.fSetModelStub = sinon.stub();
			this.controller.fSetDependentStub = sinon.stub();
			sinon.stub(this.controller, "getView").returns({
				getModel: sinon.stub().returns(this.controller.oViewModel),
				setModel: this.controller.fSetModelStub,
				addDependent: this.controller.fSetDependentStub,
				byId: sinon.stub().returns(this.controller.oByIdDouble)
			});

			// Cores byId double with different ids
			this.controller.oCoreByIdDouble = sinon.stub(sap.ui.getCore(), "byId");

			// Cores BusyIndicator double 
			this.controller.oCoreBusyIndicatorShow = sinon.stub(sap.ui.core.BusyIndicator, "show").returns();
			this.controller.oCoreBusyIndicatorHide = sinon.stub(sap.ui.core.BusyIndicator, "hide").returns();

			// double for the template name input field on the add new template dialog
			this.controller.fsetValueState = sinon.stub();
			this.controller.oCreateTemplateDialogNameInputField = {
				setValueState: this.controller.fsetValueState
			};
			this.controller.oCoreByIdDouble.withArgs("CreateTemplateDialogNameInputField").returns(this.controller.oCreateTemplateDialogNameInputField);

			// double for the job table on the add new template dialog
			this.controller.fJobTableFilterStub = sinon.stub();
			this.controller.oCreateTemplateDialogJobTable = {
				getSelectedItems: sinon.stub().returns( [] ),
				removeSelections: sinon.stub(),
				getBinding: sinon.stub().returns( {
					filter: this.controller.fJobTableFilterStub 
				})
			};
			this.controller.oCoreByIdDouble.withArgs("CreateTemplateDialogJobTable").returns(this.controller.oCreateTemplateDialogJobTable);
			
			// double for the job search field on the add new template dialog
			this.controller.oCreateTemplateDialogJobSearch = {
				setValue: sinon.stub()	
			};
			this.controller.oCoreByIdDouble.withArgs("CreateTemplateDialogJobSearch").returns(this.controller.oCreateTemplateDialogJobSearch);

			// double for the dialog fragment
			this.controller.fopenDialog = sinon.stub();
			this.controller.fcloseDialog = sinon.stub();
			this.controller.oAddNewRITDialog = {
				open : this.controller.fopenDialog,
				close: this.controller.fcloseDialog,
				getModel: sinon.stub().returns( this.controller.oViewModel )
			};
			this.controller.oXmlFragmentStub = sinon.stub(sap.ui, "xmlfragment").returns( this.controller.oAddNewRITDialog );
		},

		afterEach: function() {
			sinon.restore(sap.ui.getCore(), "byId");
			sinon.restore(sap.ui, "xmlfragment");
			sinon.restore(sap.ui.core.BusyIndicator, "show");
			sinon.restore(sap.ui.core.BusyIndicator, "hide");
			this.controller.destroy();
		}
	});

	QUnit.test("Run the Extension Controllers onClickAddTemplateButton", function(assert) {
		// create the needed stups

		// act
		this.controller.onClickAddTemplateButton();

		// assert
		// Check if  dialog is created and appropriate methods are clled
		ok(this.controller.oXmlFragmentStub.callCount === 1, "The add new template dialog was created");
		ok(this.controller.fopenDialog.callCount === 1, "The open method of the dialog was called");
		ok(this.controller.fSetModelStub.callCount ===1, "View setModel called");

	});
	
	QUnit.test("Run the Extension Controllers onCancelCreateTemplateDialog", function(assert) {

		// Prepare
		this.controller._oCreateTemplateDialog = this.controller.oAddNewRITDialog;
		// act
		this.controller.onCancelCreateTemplateDialog();
		// assert
		ok(this.controller.fcloseDialog.callCount === 1, "The close method of the dialog was called");

	});
	
	QUnit.test("Run the Extension Controllers onOkCreateTemplateDialog with no data given", function(assert) {

		// Prepare
		this.controller._oCreateTemplateDialog = this.controller.oAddNewRITDialog;
		// act
		this.controller.onOkCreateTemplateDialog();
		// assert
		ok(this.controller.fsetValueState.callCount === 1, "New template name input field successfully highlighted");
		ok(this.controller.fcloseDialog.callCount === 0, "Add new template dialog is still open");
		ok(this.controller.oCoreBusyIndicatorShow.callCount === 0, "No Busy indicator was shown");
		

	});
	
	QUnit.test("Run the Extension Controllers onOkCreateTemplateDialog with data given", function(assert) {

		// Prepare
		var sTmplName = "Any Name";
		this.controller._oCreateTemplateDialog = this.controller.oAddNewRITDialog;
		var oData = this.controller.oViewModel.getData();		
		oData.EHSRiskIdentificationTmplName = sTmplName;
		this.controller.oViewModel.setData( oData );
		
		var fmyResponseFunc;
		var oPromiseStub = {
			then: function( fResponseFunc ) { fmyResponseFunc = fResponseFunc; }
		};
		var fnavigateInternalStub = this.stub();
		var oNavControllerStub = {
			navigateInternal: fnavigateInternalStub
		};

		var finvokeActionsStub = this.stub().returns();
		var fmyCallbackFunc;
		var oMyExtensionAPI = {
			securedExecution: function( fCallback ) {
				fmyCallbackFunc = fCallback;
				return oPromiseStub;
			},
			getNavigationController: this.stub().returns( oNavControllerStub ),
			invokeActions: finvokeActionsStub
		};
		this.controller.extensionAPI = oMyExtensionAPI;

		// act
		this.controller.onOkCreateTemplateDialog();

		// assert 
		ok(this.controller.fcloseDialog.callCount === 1, "Add new template dialog successfully closed");
		ok(this.controller.oCoreBusyIndicatorShow.callCount === 1, "Busy indicator is shown");
		
		// check the call to the backend
		fmyCallbackFunc();
		var emptyGuid = "00000000-0000-0000-0000-000000000000";
		var firstArgument = finvokeActionsStub.getCall(0).args[0];
		var thirdArgument = finvokeActionsStub.getCall(0).args[2];
		ok((firstArgument === "/CreateRIT"), "Backend function import successfully invoked");
		ok((thirdArgument.TemplateName === sTmplName), "Backend function successfully suplied with the correct template name");
		ok((thirdArgument.JobUUID === emptyGuid), "Backend function successfully suplied with an empty guid for job");

		// check also the reaction for the promise
		var myResponse = {
			response: {
				data: {
					key:  "00000000-4711-0815-0000-000000000000"
				}
			}
		};
		fmyResponseFunc( [ myResponse ] );

		// assert again
		ok(this.controller.oCoreBusyIndicatorHide.callCount === 1, "Busy indicator is deactivated");
		ok(fnavigateInternalStub.callCount === 1, "internal navigation was called");

	});

	QUnit.test("Run the Extension Controllers onCreateTemplateDialogJobSearchChange with no data", function(assert) {

		// prepare
		var oEvent = { getSource: this.stub().returns( {
				getValue: this.stub().returns("")
			})
		};

		// act
		this.controller.onCreateTemplateDialogJobSearchChange(oEvent);
		// assert
		var firstArgument = this.controller.fJobTableFilterStub.getCall(0).args[0];
		ok( ( (firstArgument instanceof Array) && (firstArgument.length === 0) ), "Job Table filter is set with an empty array");

	});

	QUnit.test("Run the Extension Controllers onCreateTemplateDialogJobSearchChange with data", function(assert) {

		// prepare
		var oEvent = { getSource: this.stub().returns( {
				getValue: this.stub().returns("My job filter value")
			})
		};

		// act
		this.controller.onCreateTemplateDialogJobSearchChange(oEvent);
		// assert
		var firstArgument = this.controller.fJobTableFilterStub.getCall(0).args[0];
		ok( ( (firstArgument instanceof Array) && (firstArgument.length === 1) ), "Job Table filter is set with an filled array");

	});

	QUnit.test("Run the Extension Controllers onCreateTemplateDialogNameInputChange with now data", function(assert) {

		// prepare
		this.controller.oCreateTemplateDialogNameInputField.getValue = function() {
			return "";	
		};
		// act
		this.controller.onCreateTemplateDialogNameInputChange( );
		// assert
		ok(!this.controller.oViewModel.getData().CreateTemplateRiskDialogOKButtonEnabled, "No template name given - ok button is disabled");

	});

	QUnit.test("Run the Extension Controllers onCreateTemplateDialogNameInputChange with data", function(assert) {

		// prepare
		this.controller.oCreateTemplateDialogNameInputField.getValue = function() {
			return "my test template";	
		};
		// act
		this.controller.onCreateTemplateDialogNameInputChange( );
		// assert
		ok(this.controller.oViewModel.getData().CreateTemplateRiskDialogOKButtonEnabled, "Template name given - ok button is enabled");

	});
	
});