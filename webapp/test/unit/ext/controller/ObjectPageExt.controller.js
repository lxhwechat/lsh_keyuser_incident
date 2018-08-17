sap.ui.define([
	"ehs/hs/rit/manages1/ext/controller/ObjectPageExt.controller",
	"sap/ui/core/routing/History",
	"sap/ushell/services/Container",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(ObjectPageExtController, History, Container) {
	"use strict";

	QUnit.module("ObjectPageExtController", {
		beforeEach: function() {
			this.controller = new ObjectPageExtController();

			// INITIALIZE TEST INFRASTRUCTURE
			this.controller.oViewModel = {
				setProperty: sinon.stub(),
				update: sinon.stub(),
				remove: sinon.stub()
			};

			 // Binding Context Object
			 this.controller.oBindingContextObject = { EHSJobUUID: "00000000-0000-0000-0000-000000000000" };

			// Binding Context
			this.controller.oRITListDouble = {
			 	getProperty: sinon.stub(),
			 	getPath: sinon.stub(),
			 	getObject: sinon.stub().returns(this.controller.oBindingContextObject)
			 };
			 
			// By Id
			this.controller.oByIdDouble = {
				attachDelete: sinon.stub()
			};

			// view
			this.controller.fSetModelStub = sinon.stub();
			this.controller.fSetDependentStub = sinon.stub();
			sinon.stub(this.controller, "getView").returns({
				_oContainingView: {
					getId: sinon.stub().returns("ehs.hs.rit.manages1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_EHSRiskIdnTemplateRskTP")
				},
				getModel: sinon.stub().returns(this.controller.oViewModel),
				setModel: this.controller.fSetModelStub,
				addDependent: this.controller.fSetDependentStub,
				getBindingContext: sinon.stub().returns(this.controller.oRITListDouble),
				byId: sinon.stub().returns(this.controller.oByIdDouble)
			});

			// Cores byId double with different ids
			this.controller.oCoreByIdDouble = sinon.stub(sap.ui.getCore(), "byId");
			
			// double for the control table
			this.controller.oAddControlDialogTableDouble = {
				getSelectedItems: sinon.stub().returns([]),
				removeSelections: sinon.stub()
			};
			this.controller.oCoreByIdDouble.withArgs("AddControlDialogTable").returns(this.controller.oAddControlDialogTableDouble);
			
			// double for the tmpact table
			this.controller.oAddImpactDialogTableDouble = {
				getSelectedItems: sinon.stub().returns([]),
				removeSelections: sinon.stub()
			};
			this.controller.oCoreByIdDouble.withArgs("AddImpactDialogTable").returns(this.controller.oAddImpactDialogTableDouble);

		},

		afterEach: function() {
			sinon.restore(sap.ui.getCore(), "byId");
			this.controller.destroy();
		},
		
		mockCreateTemplateRiskDialog: function(){
			var oCreateTemplateRiskDialog = { 
				open: sinon.stub(),
				close: sinon.stub()
			};
			this.controller._getCreateTemplateRiskDialog = sinon.stub().returns(oCreateTemplateRiskDialog);         
			return oCreateTemplateRiskDialog;
		},
		
		mockViewModel: function(oViewModelData){
			var oViewModel = { 
				setProperty: sinon.stub(),
				getData: sinon.stub().returns(oViewModelData)
			};
			this.controller._getViewModel = sinon.stub().returns(oViewModel);  
			return oViewModel;
		},
		
		mockCreateTemplateRiskHazardList: function(oItemsBindingStub){
			var oHazardList = { 
				getBinding: sinon.stub(),
				removeSelections: sinon.stub(),
				_itemsBindingStub: {
				  	filter: sinon.stub()
				} 
			};
			oHazardList.getBinding.withArgs("items").returns(oHazardList._itemsBindingStub);
			this.controller._getCreateTemplateRiskHazardList = sinon.stub().returns(oHazardList);  
			return oHazardList;
		},
		
		mockCurrentViewBindingContextObject: function(oCurrentViewBindingContextObject){
			this.controller._getCurrentViewBindingContextObject = sinon.stub().returns(oCurrentViewBindingContextObject);  
		},
		
		mockGetNewFilterHazardsList: function(sSearchFieldValue) {
			this.controller._getNewFilterHazardList = sinon.stub().returns(sSearchFieldValue);
		},
		
		mockExtensionApi: function() {
			var oExtensionApi = { 
				securedExecution: sinon.stub(),
				refresh: sinon.stub(),
				invokeActions: sinon.stub(),
				_securedExecutionPromise: { 
					then: sinon.stub(),
					catch: sinon.stub()
				}
			};
			oExtensionApi.securedExecution.returns(oExtensionApi._securedExecutionPromise);
			this.controller._getExtensionApi = sinon.stub().returns(oExtensionApi);
			return oExtensionApi;
		},
		
		mockRiskTemplateList: function(sRiskTemplateListKey){
			var oRiskTemplateList = { 
				getId: sinon.stub().returns(sRiskTemplateListKey) 
			};
			this.controller._getRiskTemplateList = sinon.stub().returns(oRiskTemplateList);
			return oRiskTemplateList;
		},
		
		mockNavigationController: function(){
			var oNavigationController = { navigateInternal: sinon.stub() };
			this.controller._getNavigationController = sinon.stub().returns(oNavigationController);
			return oNavigationController;
		}
		
	});

	QUnit.test("Run the Extension Controllers init", function(assert) {
		// create the needed stups
		var fXmlFragmentStub = this.stub(sap.ui, "xmlfragment");
		//var fAttachItemDeleteHandler = this.stub(this.controller, "_attachItemDeleteHandler");

		// Act
		this.controller.onInit();

		// Assert
		assert.ok(true, "App Controller init successfully called");
		ok(this.controller.fSetModelStub.callCount === 1, "A Model was set to the the view");
		ok(this.controller.fSetModelStub.getCalls()[0].args[1] === "viewModel", "The model was set as viewModel");

		var oViewModel = this.controller.fSetModelStub.getCalls()[0].args[0];
		ok(oViewModel.getProperty("/AddControlOKButtonEnabled") === false);
		ok(oViewModel.getProperty("/AddImpactOKButtonEnabled") === false);
		ok(oViewModel.getProperty("/DialogBusy") === false);

		// Check if all dialogs are created
		ok(fXmlFragmentStub.callCount === 2, "The expected number of dependent views were created");
		// Check if all dialogs are registered
		ok(this.controller.fSetDependentStub.callCount === 2, "The expected number of dependent views are registered");

		// Check if delete Handlers are registered
		//ok(fAttachItemDeleteHandler.callCount === 5, "The expected number of delete Handlers were registered");
	});
	
	QUnit.test("Run the Extension Controllers onClickCreateTemplateRiskButton - without job", function(assert) {

		// arrange
		// initialize dependencies
		var oCreateTemplateRiskDialog    = this.mockCreateTemplateRiskDialog();
		var oViewModel			         = this.mockViewModel();
		var oHazardList			         = this.mockCreateTemplateRiskHazardList();
		this.mockCurrentViewBindingContextObject({EHSJobUUID: "00000000-0000-0000-0000-000000000000"});

		// act
		this.controller.onClickCreateTemplateRiskButton();

		// assert
		assert.ok(oViewModel.setProperty.calledWith("/DialogBusy", false), "The dialog was set unbusy");
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateEHSJobStepName", ""), "Initialize the Job Step Name");
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateEHSJobStepNameVisible", false), "Since the job is initial, the job shall not be visible");
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateOperationalStatus", ""), "Initialize the Operational Status");
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateHazard", ""), "Initialize the hazard");
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateHazardSearch", ""), "Initialize the search on hazards");
		assert.ok(oHazardList.removeSelections.called, "The selection on the hazard list was reset");
		assert.ok(oHazardList._itemsBindingStub.filter.calledWith([]), "The filter on the hazards list was reset");
		assert.ok(oCreateTemplateRiskDialog.open.called, "The create template risk dialog was opened");

	});
	
	QUnit.test("Run the Extension Controllers onClickCreateTemplateRiskButton - with job", function(assert) {

		// arrange
		// initialize dependencies
		this.mockCreateTemplateRiskDialog();
		var oViewModel = this.mockViewModel();
		this.mockCreateTemplateRiskHazardList();
		this.mockCurrentViewBindingContextObject({EHSJobUUID: "10000000-0000-0000-0000-000000000001"});

		// act
		this.controller.onClickCreateTemplateRiskButton();

		// assert
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateEHSJobStepNameVisible", true), "Since the job is not initial, the job shall be visible");

	});

	QUnit.test("Run the Extension Controllers onSelectionChangeCreateTemplateRiskDialogHazardList", function(assert) {

		// arrange
		// initialize dependencies
		var oViewModel = this.mockViewModel();
		// event
		var sHazard = "My_Hazard";
		var oEvent = { getParameter: sinon.stub() };
		oEvent.getParameter.withArgs("listItem").returns(
			{ getBindingContext: sinon.stub().returns(
				{ getProperty: sinon.stub().returns(sHazard) })
			}
		);

		// act
		this.controller.onSelectionChangeCreateTemplateRiskDialogHazardList(oEvent);

		// assert
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateHazard", sHazard), "Set the hazard in the view model according to the selected list item in the hazard list");
	});

	QUnit.test("Run the Extension Controllers onCreateRiskTemplateDialogHazardSearchChange", function(assert) {

		// arrange
		// initialize dependencies
		// view model
		var oViewModel = this.mockViewModel();
		// hazard list
		var oHazardList	= this.mockCreateTemplateRiskHazardList();
		// event
		var sSearchFieldValue = "My_Filter_Value";
		var oEvent = { 
			getSource: sinon.stub().returns({
				getValue: sinon.stub().returns(sSearchFieldValue)
			}) 
		};
		this.mockGetNewFilterHazardsList(sSearchFieldValue);
		
		// act
		this.controller.onCreateRiskTemplateDialogHazardSearchChange(oEvent);
		
		// assert
		assert.ok(oHazardList._itemsBindingStub.filter.calledWith([sSearchFieldValue]), "The filter on the hazards list was set to the filter value");
		assert.ok(oHazardList.removeSelections.called, "The selection on the hazard list was reset");
		assert.ok(oViewModel.setProperty.calledWith("/CreateRiskTemplateHazard", ""), "The hazard was reset in the view model");
	});

	QUnit.test("Run the Extension Controllers onCancelCreateTemplateRiskDialog ", function(assert) {

		// arrange
		// initialize dependencies
		var oCreateTemplateRiskDialog = this.mockCreateTemplateRiskDialog();

		// act
		this.controller.onCancelCreateTemplateRiskDialog();

		// assert
		assert.ok(oCreateTemplateRiskDialog.close.called, "The create template risk dialog was closed");
	});

	QUnit.test("Run the Extension Controllers onOkCreateTemplateRiskDialog ", function(assert) {

		// arrange
		// initialize dependencies
		var oViewModel = this.mockViewModel();
		var oExtensionApi = this.mockExtensionApi();
		
		// act
		this.controller.onOkCreateTemplateRiskDialog();

		// assert
		assert.ok(oViewModel.setProperty.calledWith("/DialogBusy", true), "The dialog was set busy");
		assert.ok(oExtensionApi._securedExecutionPromise.then.called, "Then was called on the promise");
		assert.ok(oExtensionApi._securedExecutionPromise.catch.called, "Catch was called on the promise");
	});

	QUnit.test("Run the Extension Controllers callCreateTemplateRisk", function(assert) {

		// arrange
		// initialize dependencies
		// view model and its data
		var oViewModelData = {
			Hazard: "My_Hazard",
			OperationalStatus: "My_Op_Status",
			EHSJobStepName: "My Job Step Name"
		};
		this.mockViewModel(oViewModelData);
		// extension API
		var oExtensionApi = this.mockExtensionApi();
		var sEHSRiskIdentificationTmplUUID = "40f2e9af-be79-1ee7-bfa5-3fdae1d76b9e";
		this.mockCurrentViewBindingContextObject({EHSRiskIdentificationTmplUUID: sEHSRiskIdentificationTmplUUID});
		
		// act
		this.controller.callCreateTemplateRisk();

		// assert
		var oExpectedParameters = {
			Hazard: oViewModelData.CreateRiskTemplateHazard,
			OperationalStatus: oViewModelData.CreateRiskTemplateOperationalStatus, 
			EHSJobStepName: oViewModelData.CreateRiskTemplateEHSJobStepName,
			EHSRiskIdentificationTmplUUID: sEHSRiskIdentificationTmplUUID
		};
		assert.ok(oExtensionApi.invokeActions.calledWith("/CreateRITRsk", [], oExpectedParameters), "Function import was called to create a new template risk");
	});
		
	QUnit.test("Run the Extension Controllers templateRiskCreateSuccess", function(assert) {
		
		// arrange
		// initialize dependencies
		// extension API
		var oExtensionApi = this.mockExtensionApi();
		// Risk Template List
		var sRiskTemplateListKey = "RiskTemplateListKey";
		this.mockRiskTemplateList(sRiskTemplateListKey);
		// Create Template Risk Dialog
		var oCreateTemplateRiskDialog = this.mockCreateTemplateRiskDialog();
		// Navigation Controller
		var oNavigationController = this.mockNavigationController();
		// New template risk UUID
		var sNewTemplateRiskUUID = "20000000-0000-0000-0000-000000000020"; 

		// act
		this.controller.templateRiskCreateSuccess(sNewTemplateRiskUUID);
		
		// assert
		assert.ok(oExtensionApi.refresh.calledWith(sRiskTemplateListKey), "The risk template list was refreshed");
		assert.ok(oCreateTemplateRiskDialog.close.called, "The create risk template dialog was closed");
		var sAssertedTargetKey = "EHSRiskIdnTmplRiskUUID=guid'" + sNewTemplateRiskUUID + "',IsActiveEntity=false";
		assert.ok(oNavigationController.navigateInternal.calledWith(sAssertedTargetKey, 
			{ routeName: "to_EHSRiskIdentificationTmplRsk" }), "The navigation to the new risk template was triggered");

	});
	
	QUnit.test("Run the Extension Controllers onAddControlDialogTableSelectionChange", function(assert) {

		// act
		this.controller.onAddControlDialogTableSelectionChange();
		// assert
		ok(this.controller.oViewModel.setProperty.calledWith("/AddControlOKButtonEnabled", false), "View properties changed");

	});
	
});