sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/suite/ui/generic/template/extensionAPI/extensionAPI",
	"zwx/sm/itsm/keyuserincidents/util/Util"
], function(Controller, Sorter, extensionAPI, Util) {
	"use strict";

	return Controller.extend("zwx.sm.itsm.keyuserincidents.ext.controllers.DetailsChange", {

		onInit: function() {
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			this._oView.setModel(this._oComponent.getModel());
			this._oRouter = this._oComponent.getRouter();
			this._oNavigationTable = this.byId("navigationTable");

			//	this._oRouter.attachRoutePatternMatched(this._onRoutePatternMatched, this);

			var uiModel = this.getOwnerComponent().getModel("ui");
			var oBindingModel = new sap.ui.model.Binding(uiModel, "/editable", uiModel.getContext("/editable"));

			oBindingModel.attachChange(
				function(oEvent) {
					if (oEvent.getSource().getModel().getData().editable) {
						this.setFieldValues();
					}
				}, this
			);

			this._oView.byId("Processor").getBinding("suggestionItems").attachDataReceived(
				function(oEvent) {

					if (oEvent.getParameter("data")) {

						if (oEvent.getParameter("data").results.length === 1) {
							this._oView.byId("Processor").setValue(oEvent.getParameter("data").results[0].Name);
							this._oView.getModel().setProperty(this._oView.byId("Processor").getBindingContext().sPath + "/PersonResp", oEvent.getParameter(
								"data").results[0].Partner);

							this._oView.byId("Processor").setValueState(sap.ui.core.ValueState.None);
							this._oView.byId("Processor").destroySuggestionItems();

						} else if (this._oView.byId("Processor").getBindingContext()) {

							this._oView.getModel().setProperty(this._oView.byId("Processor").getBindingContext().sPath + "/PersonResp", "");

						}
					}

				}, this
			);

			this._oView.byId("SupportTeam").getBinding("suggestionItems").attachDataReceived(
				function(oEvent) {

					if (oEvent.getParameter("data")) {

						if (oEvent.getParameter("data").results.length === 1) {
							this._oView.byId("SupportTeam").setValue(oEvent.getParameter("data").results[0].Name);
							this._oView.getModel().setProperty(this._oView.byId("SupportTeam").getBindingContext().sPath + "/ServiceTeam", oEvent.getParameter(
								"data").results[0].Partner);

							this._oView.byId("SupportTeam").setValueState(sap.ui.core.ValueState.None);
							this._oView.byId("SupportTeam").destroySuggestionItems();

						} else if (this._oView.byId("SupportTeam").getBindingContext()) {

							this._oView.getModel().setProperty(this._oView.byId("SupportTeam").getBindingContext().sPath + "/ServiceTeam", "");

						}
					}

				}, this
			);

			this._oView.byId("ConfigItemInput").getBinding("suggestionItems").attachDataReceived(
				function(oEvent) {

					if (oEvent.getParameter("data")) {

						if (oEvent.getParameter("data").results.length === 1) {
							this._oView.byId("ConfigItemInput").setValue(oEvent.getParameter("data").results[0].Description);
							this._oView.getModel().setProperty(this._oView.byId("ConfigItemInput").getBindingContext().sPath + "/ConfigItemId", oEvent.getParameter(
								"data").results[0].ConfigItemId);

							this._oView.byId("ConfigItemInput").setValueState(sap.ui.core.ValueState.None);
							this._oView.byId("ConfigItemInput").destroySuggestionItems();

						} else if (this._oView.byId("ConfigItemInput").getBindingContext()) {

							this._oView.getModel().setProperty(this._oView.byId("ConfigItemInput").getBindingContext().sPath + "/ConfigItemId", "");

						}
					}

				}, this
			);

			this.aFilterStack = [];
		},

		onBeforeRendering: function() {
			// deregister a listener via jQuery
			if (!this.extensionAPI) {
				this.extensionAPI = Util.getObjectAPI(this.extensionAPI);

				this.extensionAPI.getTransactionController().attachAfterCancel(jQuery.proxy(this.afterCancel, this));
			}
		},

		afterCancel: function(oEvent) {
			this.getView().byId("ShortText").setValueState("None");
		},

		_toggleButtonsAndView: function(bEdit) {
			// Set the right form type
			this._showFormFragment(bEdit ? "DetailsChange" :
				"DetailsDisplay");
		},

		_showFormFragment: function(sFragmentName) {
			// var oPage = this.getView();

			// oPage.removeAllContent();
			// var ofragmentName = this._getFormFragment(sFragmentName);
			// oPage.insertContent(ofragmentName);
		},

		_getFormFragment: function(sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "zwx.sm.itsm.keyuserincidents.ext.fragments." + sFragmentName);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];

		},

		_formFragments: {},

		onProcessorChange: function(oEvent) {
			if (this.getView().byId("Processor").getValue().toString().length === 0) {
				var oCtx = oEvent.getSource().getBindingContext();
				var oModel = oCtx.getModel();
				oModel.setProperty(oCtx.sPath + "/PersonResp", "");
				oModel.setProperty(oCtx.sPath + "/PersonRespName", "");
				zwx.sm.itsm.keyuserincidents.util.Util.removeProcessor();
			}

		},
		
		onConfigItemChange: function(oEvent) {
			if (this.getView().byId("ConfigItemInput").getValue().toString().length === 0) {
				var oCtx = oEvent.getSource().getBindingContext();
				var oModel = oCtx.getModel();
				oModel.setProperty(oCtx.sPath + "/ConfigItemId", "");
				zwx.sm.itsm.keyuserincidents.util.Util.removeConfigItem();
			}

		},

		onSupportTeamChange: function(oEvent) {
			if (this.getView().byId("SupportTeam").getValue().toString().length === 0) {
				var oCtx = oEvent.getSource().getBindingContext();
				var oModel = oCtx.getModel();
				oModel.setProperty(oCtx.sPath + "/ServiceTeam", "");
				oModel.setProperty(oCtx.sPath + "/ServiceTeamList", "");
				zwx.sm.itsm.keyuserincidents.util.Util.removeSupportTeam();
			}

		},

		onValidatedFieldLiveChange: function(oEvent) {

			if (oEvent.getParameters().newValue === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			} else {
				oEvent.getSource().data("type", "");
			}
		},

		onChangePriority: function(oEvent) {
			// sap.m.MessageToast.show("Selected Priority: " + evt.getParameters().selectedItem.getText());
			var oCtx = oEvent.getSource().getBindingContext();
			var oModel = oCtx.getModel();
			oModel.setProperty(oCtx.sPath + "/Priority", oEvent.getParameters().selectedItem.getKey());
			oModel.setProperty(oCtx.sPath + "/PriorityTxt", oEvent.getParameters().selectedItem.getText());
		},

		onCategoryValueHelp: function(oEvent) {
			this._oPopover = sap.ui.xmlfragment("categoryPopover", "zwx.sm.itsm.keyuserincidents.ext.fragments.CategoryPopover",
				this);
			this._oPopover.setModel(this.getView().getModel());
			this._oPopover.setModel(this.getView().getModel("i18n"), "i18n");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oPopover);
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			if (this.aFilterStack.length === 0) {
				oDetailPage.setShowNavButton(false);
			}

			// check if entry already exists to enable/disable "clear" button.
			var oClearButton = sap.ui.core.Fragment.byId("categoryPopover", "clearButton");
			if (!oEvent.getSource().getValue()) {
				oClearButton.setEnabled(false);
			} else {
				oClearButton.setEnabled(true);
			}

			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this._oEntity.ProcessType);

			listBinding.filter([oFilterProcType]);
			// this._oPopover.openBy(oEvent.getSource());
			this._oPopover.open();
		},

		onValueHelpProcessor: function(oEvent) {

			var oModel = this.getView().getModel();

			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
					label: "ID",
					template: "Partner"
				}, {
					label: "Name",
					template: "Name"
				}]
			});
			var title = this.getView().getModel("i18n").getResourceBundle().getText("LBL_PROCESSOR");
			var oValueHelpDialog = Util.getPartnerValueHelp(oEvent, "/ProcessorSet", oModel, oColModel, false, title, "/PersonResp");

			oValueHelpDialog.open();
			oValueHelpDialog.update();

		},

		onValueHelpSupportTeam: function(oEvent) {

			var oModel = this.getView().getModel();

			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
					label: "ID",
					template: "Partner"
				}, {
					label: "Name",
					template: "Name"
				}]
			});
			var title = this.getView().getModel("i18n").getResourceBundle().getText("LBL_SUPPORT_TEAM");
			var oValueHelpDialog = Util.getPartnerValueHelp(oEvent, "/SupportTeamSet", oModel, oColModel, false, title, "/ServiceTeam");

			oValueHelpDialog.open();
			oValueHelpDialog.update();

		},

		// categoryHandleSuggest: function(oEvent) {
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	var aFilters = [];
		// 	if (sTerm.value !== "") {
		// 		aFilters.push(new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this._oEntity.ProcessType));
		// 		aFilters.push(new sap.ui.model.Filter("CategoryId", sap.ui.model.FilterOperator.Contains, sTerm));
		// 		oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		// 	}
		// },

		// categorySuggestionItemSelected: function(oControlEvent) {
		// 	this._oModel.setProperty(this._oCtx.sPath + "/CategoryId", oControlEvent.getParameters("selectedItem").selectedItem.data("type"));

		// 	var oView = this.getView();
		// 	var oInput = oView.byId("CategoryInput");

		// 	// var oCtx = oControlEvent.getSource().getBindingContext();
		// 	// var oEntity = oInput.getModel().getData(oCtx.getPath(), oCtx);
		// 	// 
		// 	// oInput.data("CategoryId", oEntity.CategoryId);
		// 	// oInput.data("CategoryCatalogType", oEntity.CategoryCatalogType);
		// 	// oInput.data("CategoryTxt", oEntity.CategoryDescription);
		// 	// oInput.data("CategoryAspId", oEntity.CategoryAspId);
		// 	// this._oModel.setProperty(this._oCtx.sPath + "/CategoryId", oEntity.CategoryId);
		// 	// this._oModel.setProperty(this._oCtx.sPath + "/CategoryTxt", oEntity.CategoryDescription);
		// 	// this._oModel.setProperty(this._oCtx.sPath + "/CategoryCatalogType", oEntity.CategoryCatalogType);
		// 	// this._oModel.setProperty(this._oCtx.sPath + "/CategoryAspectId", oEntity.CategoryAspId);

		// 	oInput.setValueState(sap.ui.core.ValueState.None);
		// },

		onComponentValueHelp: function(oEvent) {
			this._oPopover = sap.ui.xmlfragment("componentPopover", "zwx.sm.itsm.keyuserincidents.ext.fragments.ComponentPopover",
				this);
			this._oPopover.setModel(this.getView().getModel());
			this._oPopover.setModel(this.getView().getModel("i18n"), "i18n");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oPopover);
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			if (this.aFilterStack.length === 0) {
				oDetailPage.setShowNavButton(false);
			}

			// check if entry already exists to enable/disable "clear" button.
			var oClearButton = sap.ui.core.Fragment.byId("componentPopover", "clearButton");
			if (!oEvent.getSource().getValue()) {
				oClearButton.setEnabled(false);
			} else {
				oClearButton.setEnabled(true);
			}
			// this._oPopover.openBy(oEvent.getSource());
			this._oPopover.open();
		},

		// componentHandleSuggest: function(oEvent) {
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	var aFilters = [];
		// 	if (sTerm.value !== "") {
		// 		// aFilters.push(new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this._oEntity.ProcessType));
		// 		aFilters.push(new sap.ui.model.Filter("CompID", sap.ui.model.FilterOperator.Contains, sTerm));
		// 		oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		// 	}
		// },

		// componentSuggestionItemSelected: function(oControlEvent) {
		// 	this._oModel.setProperty(this._oCtx.sPath + "/Component", oControlEvent.getParameters("selectedItem").selectedItem.data("type"));
		// 	var oView = this.getView();
		// 	var oInput = oView.byId("ComponentInput");
		// 	oInput.setValueState(sap.ui.core.ValueState.None);
		// },

		onCatNavToNextLevel: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);

			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilterCatID = new sap.ui.model.Filter("CategoryId", sap.ui.model.FilterOperator.EQ, oEntity.CategoryId);
			var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this._oEntity.ProcessType);
			this.aFilterStack.unshift(oFilterCatID);

			if (this.aFilterStack.length >= 1) {
				oDetailPage.setShowNavButton(true);
			}

			jQuery.sap.delayedCall(100, this, function() {
				listBinding.filter([oFilterCatID, oFilterProcType]);
			});
		},

		onCompNavToNextLevel: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);

			var oListDetail = sap.ui.core.Fragment.byId("componentPopover", "compPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilter = new sap.ui.model.Filter("CompID", sap.ui.model.FilterOperator.EQ, oEntity.CompID);
			this.aFilterStack.unshift(oFilter);

			if (this.aFilterStack.length >= 1) {
				oDetailPage.setShowNavButton(true);
			}

			jQuery.sap.delayedCall(100, this, function() {
				listBinding.filter([oFilter]);
			});
		},

		onCatSearch: function(oEvent) {
			var searchedValue = oEvent.getParameter("newValue");
			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			if (searchedValue.length >= 1) {
				oDetailPage.setShowNavButton(false);
				this.aFilterStack = [];
				var oFilterCatID = new sap.ui.model.Filter("CategoryId", sap.ui.model.FilterOperator.Contains, searchedValue);
				var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this._oEntity.ProcessType);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilterCatID, oFilterProcType]);
				});
			} else if (searchedValue.length === 0) {
				var oFilterProcType2 = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this._oEntity.ProcessType);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilterProcType2]);
				});
			}
		},

		onCompSearch: function(oEvent) {
			var searchedValue = oEvent.getParameter("newValue");
			var oListDetail = sap.ui.core.Fragment.byId("componentPopover", "compPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			if (searchedValue.length > 1) {
				oDetailPage.setShowNavButton(false);
				this.aFilterStack = [];
				var oFilter = new sap.ui.model.Filter("CompID", sap.ui.model.FilterOperator.Contains, searchedValue);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilter]);
				});
			} else if (searchedValue.length === 0) {
				var oFilter2 = new sap.ui.model.Filter("CompID", sap.ui.model.FilterOperator.Contains, searchedValue);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilter2]);
				});
			}
		},

		onCatTitleClicked: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);
			var oInput = this.byId("CategoryInput");
			oInput.data("CategoryId", oEntity.CategoryId);
			oInput.data("CategoryCatalogType", oEntity.CategoryCatalogType);
			oInput.data("CategoryTxt", oEntity.CategoryDescription);
			oInput.data("CategoryAspId", oEntity.CategoryAspId);
			this._oModel.setProperty(this._oCtx.sPath + "/CategoryId", oEntity.CategoryId);
			this._oModel.setProperty(this._oCtx.sPath + "/CategoryTxt", oEntity.CategoryDescription);
			this._oModel.setProperty(this._oCtx.sPath + "/CategoryCatalogType", oEntity.CategoryCatalogType);
			this._oModel.setProperty(this._oCtx.sPath + "/CategoryAspectId", oEntity.CategoryAspId);
			oInput.setValue(oEntity.CategoryConcDescription);
			oInput.setValueState("None");
			this._oPopover.close();
			this.destroyPopover();
		},

		onCompTitleClicked: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);
			var oInput = this.byId("ComponentInput");
			oInput.setValue(oEntity.CompID);
			oInput.data("CompId", oEntity.CompID);
			oInput.data("CompText", oEntity.CompText);
			oInput.setValueState("None");
			this._oPopover.close();
			this.destroyPopover();
		},

		onCatNavButtonPress: function() {
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this._oEntity.ProcessType);

			if (this.aFilterStack.length > 1) {
				this.aFilterStack.shift();
				listBinding.filter([this.aFilterStack[0], oFilterProcType]);
			} else {
				oDetailPage.setShowNavButton(false);
				this.aFilterStack.shift();
				listBinding.filter(oFilterProcType);
			}
		},

		onCompNavButtonPress: function() {
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			var oListDetail = sap.ui.core.Fragment.byId("componentPopover", "compPopoverList");
			var listBinding = oListDetail.getBinding("items");

			if (this.aFilterStack.length > 1) {
				this.aFilterStack.shift();
				listBinding.filter([this.aFilterStack[0]]);
			} else {
				var oInitialFilter = [];
				oDetailPage.setShowNavButton(false);
				this.aFilterStack.shift();
				listBinding.filter(oInitialFilter);
			}
		},

		onPopoverCancel: function() {
			this._oPopover.close();
			this.destroyPopover();

		},

		onCatPopoverClear: function() {
			this._oPopover.close();
			this.destroyPopover();
			var oInput = this.byId("CategoryInput");
			oInput.setValue("");
			oInput.data("CategoryId", "");
			oInput.setValueState("None");

		},

		onCompPopoverClear: function() {
			this._oPopover.close();
			this.destroyPopover();
			var oInput = this.byId("ComponentInput");
			oInput.setValue("");
			oInput.setValueState("None");

		},

		onPopoverAfterClose: function() {
			this.destroyPopover();
		},

		destroyPopover: function() {

			//component Popover
			if (sap.ui.core.Fragment.byId("componentPopover", "compPopoverList")) {
				sap.ui.core.Fragment.byId("componentPopover", "compPopoverList").destroy();
			}
			if (sap.ui.core.Fragment.byId("componentPopover", "closeButton")) {
				sap.ui.core.Fragment.byId("componentPopover", "closeButton").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "searchField")) {
				sap.ui.core.Fragment.byId("componentPopover", "searchField").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "componentListItem")) {
				sap.ui.core.Fragment.byId("componentPopover", "componentListItem").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "master")) {
				sap.ui.core.Fragment.byId("componentPopover", "master").destroy();
			}

			//category Popover
			if (sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList")) {
				sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList").destroy();
			}
			if (sap.ui.core.Fragment.byId("categoryPopover", "closeButton")) {
				sap.ui.core.Fragment.byId("categoryPopover", "closeButton").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "searchField")) {
				sap.ui.core.Fragment.byId("componentPopover", "searchField").destroy();
			}

			if (sap.ui.core.Fragment.byId("categoryPopover", "categoryListItem")) {
				sap.ui.core.Fragment.byId("categoryPopover", "categoryListItem").destroy();
			}

			if (sap.ui.core.Fragment.byId("categoryPopover", "master")) {
				sap.ui.core.Fragment.byId("categoryPopover", "master").destroy();
			}

			// if (this._oPopover) {
			// 	this._oPopover.destroy();
			// } 

			this.aFilterStack = [];

		},

		// for the fast search in the business partner fields
		handleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm.value !== "") {
				aFilters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sTerm));
				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			}
		},

		// used to fill the custom data 'type into the field input field so we can read it later	
		suggestionProcessorItemSelected: function(oControlEvent) {
			// var oSelectedItem = oControlEvent.getParameters("selectedItem");
			// var oSelected = oSelectedItem.selectedItem;
			// var sBp = oSelected.data("type");
			this._oModel.setProperty(this._oCtx.sPath + "/PersonResp", oControlEvent.getParameters("selectedItem").selectedItem.data("type"));
			var oView = this.getView();
			var oInput = oView.byId("Processor");
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		// used to fill the custom data 'type into the field input field so we can read it later	
		suggestionReporterItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sBp = oSelected.data("type");
			this._oModel.setProperty(this._oCtx.sPath + "/ContactPerson", sBp);
			var oView = this.getView();
			var oInput = oView.byId("Reporter");
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		// used to fill the custom data 'type into the field input field so we can read it later	
		suggestionSupportTeamItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sBp = oSelected.data("type");
			this._oModel.setProperty(this._oCtx.sPath + "/ServiceTeam", sBp);
			var oView = this.getView();
			var oInput = oView.byId("SupportTeam");
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		// used to fill the custom data 'type into the field input field so we can read it later	
		suggestionCustomerItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sBp = oSelected.data("type");
			this._oModel.setProperty(this._oCtx.sPath + "/SoldToParty", sBp);
			var oView = this.getView();
			var oInput = oView.byId("Customer");
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		// for the fast search in the config item field
		CIhandleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm.value !== "") {
				aFilters.push(new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sTerm));
				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			}
		},

		// used to fill the config Item input field
		CIsuggestionItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sCItem = oSelected.data("type");
			var oView = this.getView();
			this._oModel.setProperty(this._oCtx.sPath + "/ConfigItemId", sCItem);
			var oInput = oView.byId("ConfigItemInput");
			oInput.data("type", sCItem);
			this.sValuesCItem = sCItem;
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		onShortTextLiveChange: function() {

			this._oModel.setProperty(this._oCtx.sPath + "/Description", this.getView().byId("ShortText").getValue());

			if (this.getView().byId("ShortText").getValue().length < 1 || this.getView().byId("ShortText").getValue().length > 40)

			{
				this.getView().byId("ShortText").setValueState("Error");
			} else {
				this.getView().byId("ShortText").setValueState("None");
			}

		},

		setFieldValues: function() {
			//Check if model is defined
			if (this._oView.getModel("ui")) {
				if (this._oView.getModel("ui").getData().editable) {
					//get initial Incident values
					this._oCtx = this._oView.getBindingContext();
					this._oModel = this._oCtx.getModel();
					this._oEntity = this._oModel.getData(this._oCtx.getPath(), this._oCtx);

					//  Change filter of Processor suggestion item
					this.getView().byId("Processor").setFilterFunction(function(sTerm, oItem) {
						// A case-insensitive 'string contains' style filter
						// return oItem.getText().match(new RegExp(sTerm, "i"));
						return oItem.getText();

					});

					// //  Change filter of Reporter suggestion item
					// this.getView().byId("Reporter").setFilterFunction(function(sTerm, oItem) {
					// 	// A case-insensitive 'string contains' style filter
					// 	// return oItem.getText().match(new RegExp(sTerm, "i"));
					// 	return oItem.getText();

					// });

					// //  Change filter of Customer suggestion item
					// this.getView().byId("Customer").setFilterFunction(function(sTerm, oItem) {
					// 	// A case-insensitive 'string contains' style filter
					// 	// return oItem.getText().match(new RegExp(sTerm, "i"));
					// 	return oItem.getText();

					// });

					//  Change filter of ConfigItem suggestion item		
					this.getView().byId("ConfigItemInput").setFilterFunction(function(sTerm, oItem) {
						// A case-insensitive 'string contains' style filter
						// return oItem.getText().match(new RegExp(sTerm, "i"));
						return oItem.getText();

					});

					// //Change filter of Category suggestion item		
					// this.byId("CategoryInput").setFilterFunction(function(sTerm, oItem) {
					// 	// A case-insensitive 'string contains' style filter
					// 	// return oItem.getText().match(new RegExp(sTerm, "i"));
					// 	return oItem.getText();

					// });

					// //Change filter of Category suggestion item		
					// this.byId("ComponentInput").setFilterFunction(function(sTerm, oItem) {
					// 	// A case-insensitive 'string contains' style filter
					// 	// return oItem.getText().match(new RegExp(sTerm, "i"));
					// 	return oItem.getText();

					// });
				}
			}
		}

	});
});