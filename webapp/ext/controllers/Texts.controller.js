sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/suite/ui/generic/template/extensionAPI/extensionAPI",
	"zwx/sm/itsm/keyuserincidents/util/Util",
	"sap/ui/richtexteditor/RichTextEditor"
], function(Controller, Sorter, extensionAPI, Util, RichTextEditor) {
	"use strict";

	sap.ui.controller("zwx.sm.itsm.keyuserincidents.ext.controllers.Texts", {

		onInit: function() {

			var that = this;

			var oView = this.getView();
			var i18nModel = this.getOwnerComponent().getModel("i18n");
			if (i18nModel) {
				this.bundle = i18nModel.getResourceBundle();
			}

			// get extension API
			// extensionAPI.getExtensionAPIPromise(oView).then(
			// 	function(oExtensionAPI){
			// 		this.extensionAPI = oExtensionAPI;
			// 		this.extensionAPI.attachPageDataLoaded(jQuery.proxy(this.pageDataLoaded, this));
			// 		this.extensionAPI.getTransactionController().attachAfterSave(jQuery.proxy(this.afterSave, this));
			// });

			this.oEmployeeModel = new sap.ui.model.json.JSONModel();

			var uiModel = this.getOwnerComponent().getModel("ui");
			var odataModel = this.getOwnerComponent().getModel();

			oView.setModel(odataModel);
			//	odataModel.setRefreshAfterChange(true);
			var oBindingModel = new sap.ui.model.Binding(uiModel, "/editable", uiModel.getContext("/editable"));
			oBindingModel.attachChange(
				function(oEvent) {

					that.oView.byId("actionTextSelect").setVisible(oEvent.getSource().getModel().getData().editable);
						that.oView.byId("DescriptionRT").setVisible(false);
							that.oView.byId("Description").setVisible(false);
					//that.oView.byId("DescriptionRT").setVisible(oEvent.getSource().getModel().getData().editable);
					if (oEvent.getSource().getModel().getData().editable) {
						
						var textMode = that.oView.getModel().getProperty("TextMode",that.oView.byId("actionTextSelect").getSelectedItem().getBindingContext());
						
						if (textMode === "H") {
							that.oView.byId("DescriptionRT").setVisible(true);
							that.oView.byId("Description").setVisible(false);
						} else {
							that.oView.byId("DescriptionRT").setVisible(false);
							that.oView.byId("Description").setVisible(true);
						}
						var ActionTextKey = that.oView.byId("actionTextSelect").getSelectedKey();
						if (ActionTextKey) {
							//						Set Placeholder Text according to Action Selected

							if (that.oView.getBindingContext() !== undefined) {
								that.oView.getModel().read(that.oView.getBindingContext() + "/ActionTextSet", {
									async: false,
									success: function(oResult) {

										for (var i = 0; i < oResult.results.length; i++) {

											if (ActionTextKey.indexOf(oResult.results[i].ActionTextId) !== -1) {
												//	that.getView().byId("Description").setPlaceholder(oResult.results[i].PlaceholderText);		
											}

											// if(ActionTextKey.includes(oResult.results[i].ActionTextId)){
											// 	that.getView().byId("Description").setPlaceholder(oResult.results[i].PlaceholderText);		
											// }										

										}
									}

								});

							}
						}
					}
				}, this

			);

			if (!Util.getModel()) {
				Util.setModel(this.getOwnerComponent().getModel());
			}

			oView.textFeedList = oView.byId("feedList");
			oView.textFeedInput = oView.byId("Description");
			oView.textActionSelect = oView.byId(
				"actionTextSelect");

			this.jsonModelTexts = new sap.ui.model.json.JSONModel();
			oView.textFeedList.setModel(this.jsonModelTexts);

		},

		onBeforeRendering: function() {
			// deregister a listener via jQuery
			if (!this.extensionAPI) {
				this.extensionAPI = Util.getObjectAPI(this.extensionAPI);
				this.extensionAPI.attachPageDataLoaded(jQuery.proxy(this.pageDataLoaded, this));
				this.extensionAPI.getTransactionController().attachAfterSave(jQuery.proxy(this.afterSave, this));
			}

		},

		pageDataLoaded: function(context) {
			
			this.readTexts(context.context.sPath);

		},

		readTexts: function(sPath) {
			var that = this;

			this.getView().textPath = sPath + "/TextSet";

			var fnSuccess = function(oResponse) {

				that.getView().textFeedList.setBusy(false);
				that.oTextSet = oResponse.results;

				that.jsonModelTexts.setData({
					TextSet: that.oTextSet
				});

				that.jsonModelTexts.updateBindings();

			};

			var fnError = function(oResponse) {
				this.getView().oView.textFeedList.setBusy(false);
			};

			this.getView().textFeedList.setBusy(true);
			Util.getModel().read(this.getView().textPath, {
				success: fnSuccess,
				error: fnError
			});

		},

		afterSave: function(oEvent) {

			// set Selected Key of ActionTextSet in Model / direct Binding caused unecessary Data Loss PopUp in Display
			this.getView().getModel().setProperty(this.getView().getBindingContext().sPath + "/ActionTextId", this.getView().byId(
				"actionTextSelect").getSelectedKey());
			// set Text Mode
			this.getView().getModel().setProperty(this.getView().getBindingContext().sPath + "/TextMode", 
												  this.oView.getModel().getProperty("TextMode",this.oView.byId("actionTextSelect").getSelectedItem().getBindingContext()) );
			
			oEvent.saveEntityPromise.then(jQuery.proxy(this.afterSaveSuccess, this), jQuery.proxy(this.afterSaveReject, this));

		},

		afterSaveSuccess: function(oEvent) {
			this.readTexts(this.getView().getBindingContext().sPath);
		},

		afterSaveReject: function(oEvent) {
			//alert("Failure");
			//this.readTexts(this.getView().getBindingContext().sPath);
		},

		onPressSender: function(oEvent) {

			var oSourceItem = oEvent.getSource();

			var oEmpConfig = {
				pages: [{
					pageId: "employeePageId",
					header: this.bundle.getText("CONTACT_INFO"),
					icon: oSourceItem.getIcon(),
					title: oSourceItem.getSender(),
					description: oSourceItem.data("department"),
					groups: [{
						heading: this.bundle.getText("CONTACT_DETAILS"),
						elements: [{
							label: this.bundle.getText("MOBILE"),
							value: oSourceItem.data("contactmobile"),
							elementType: sap.m.QuickViewGroupElementType.mobile
						}, {
							label: this.bundle.getText("PHONE"),
							value: oSourceItem.data("contactphone"),
							elementType: sap.m.QuickViewGroupElementType.phone
						}, {
							label: this.bundle.getText("EMAIL"),
							value: oSourceItem.data("email"),
							emailSubject: oSourceItem.data("emailsubject"),
							elementType: sap.m.QuickViewGroupElementType.email
						}]
					}, {
						heading: this.bundle.getText("COMPANY"),
						elements: [{
							label: this.bundle.getText("NAME"),
							value: oSourceItem.data("company")
								// url: "http://www.sap.com",
								// type: sap.m.QuickViewGroupElementType.link
						}, {
							label: this.bundle.getText("ADDRESS"),
							value: oSourceItem.data("companyaddress")
						}]
					}]
				}]
			};

			// /**    
			//  * @ControllerHook [Change Contact Information]
			//  * This hook is called when the quick overview of the Sender of text is shown
			//  * Here the displayed data can be modified
			//  * @callback sap.ca.scfld.md.controller.BaseDetailController~extHookContactPopoverData
			//  * @param {Object} oEmpConfig
			//  * @return {void}  ...
			//  */
			// if (this.extHookContactPopoverData) { // check whether any extension has implemented the hook...
			// 	this.extHookContactPopoverData(oEmpConfig); // ...and call it
			// }

			this.oEmployeeModel.setData(oEmpConfig);
			this.createPopover(this.oEmployeeModel);

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource()._oLinkControl;
			jQuery.sap.delayedCall(0, this, function() {
				this._oQuickView.openBy(oButton);
			});

		},

		createPopover: function(oModel) {
			if (!this._oQuickView) {
				this._oQuickView = sap.ui.xmlfragment("zwx.sm.itsm.keyuserincidents.ext.fragments.QuickView", this);
				this._oQuickView.setModel(oModel);
				this._oQuickView.setPlacement(sap.m.PlacementType.Auto);
				this.getView().addDependent(this._oQuickView);
			}
		},

		onChangeActionText: function(oEvent) {
			//			When the action text selector is changed the placeholder text needs to be set accordingly
			var that = this;
			
			var ActionTextId = oEvent.getParameters().selectedItem.getKey();
			var textMode = that.oView.getModel().getProperty("TextMode",oEvent.getParameters().selectedItem.getBindingContext());
			
		 
				if (textMode === "H") {
						that.oView.byId("DescriptionRT").setVisible(true);
						that.oView.byId("Description").setVisible(false);
					} else {
						that.oView.byId("DescriptionRT").setVisible(false);
						that.oView.byId("Description").setVisible(true);
					}
		 

			that.getView().getModel().read(that.getView().getBindingContext().sPath + "/ActionTextSet", {
				async: false,
				success: function(oResult) {

					for (var i = 0; i < oResult.results.length; i++) {

						if (ActionTextId.indexOf(oResult.results[i].ActionTextId) !== -1) {
							that.getView().byId("Description").setPlaceholder(oResult.results[i].PlaceholderText);
						}

					}
				}

			});

		}

	});
});