jQuery.sap.require("zwx.sm.itsm.keyuserincidents.util.Util");
sap.ui.controller("zwx.sm.itsm.keyuserincidents.ext.controllers.ObjectPageExtension", {

	onInit: function() {

		// var	oController =	this.extensionAPI.getTransactionController();

		var uiModel = this.getOwnerComponent().getModel("ui");
		var oBindingModel = new sap.ui.model.Binding(uiModel, "/editable", uiModel.getContext("/editable"));
		zwx.sm.itsm.keyuserincidents.util.Util.setView(this.oView);

		this.extensionAPI.getTransactionController().attachAfterSave(jQuery.proxy(this.afterSave, this));

		zwx.sm.itsm.keyuserincidents.util.Util.setObjectAPI(this.extensionAPI);

		oBindingModel.attachChange(
			function(oEvent) {

				if (oEvent.getSource().getModel().getData().editable) {

					// 			var fnSuccess = function(oData) {

					// 			};

					// 			var fnError = function(oError) {

					// 			};

					// 			this._oPopover = sap.ui.xmlfragment("ProcessPopup", "zwx.sm.itsm.keyuserincidents.ext.fragments.ProcessDialog", that);
					// 			this._oPopover.setModel(this.oView.getModel());				
					// 			this._oPopover.setModel(this.oView.getModel("i18n"), "i18n");
					// 			this._oPopover.setBindingContext(this.getView().getBindingContext());

					// 	//		to get the smaller desktop UI		
					// 			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.oView, this._oPopover);				
					// 			this._oPopover.open();

				}

			}, this

		);

	},

	afterSave: function(oEvent) {
		// var oModel = this.getView().getModel();
		//oModel.setRefreshAfterChange(true); //
		oEvent.saveEntityPromise.then(jQuery.proxy(this.afterSaveSuccess, this), jQuery.proxy(this.afterSaveRejected, this));
		//	this.openBusyDialog("busyPopover", this.getView().getModel("i18n").getResourceBundle().getText("BUSY_DIALOG_PLEASE_WAIT"));
	},

	afterSaveSuccess: function(oEvent, Reject) {
		//	this.closeBusyDialog();
		var oModel = this.getView().getModel();
		var oCtx = this.getView().getBindingContext();
		var path = oCtx.sPath + "/";
		var mMessages = oModel.getMessagesByPath(path);
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		var messageIcon,messageTitle;
		$.each(mMessages, function(index, value) {
			messageTitle = value.type;
			
			switch (value.type) {
				case "Error":
					messageIcon = sap.m.MessageBox.Icon.ERROR;
				
					break;
				case "Warining":
					messageIcon = sap.m.MessageBox.Icon.WARNING;
					break;
				case "Information":
					messageIcon = sap.m.MessageBox.Icon.INFORMATION;
					break;
				default:
					messageIcon = sap.m.MessageBox.Icon.WARNING;
			}

			sap.m.MessageBox.show(
				value.message, {
					title : value.type,
					id: "serviceErrorMessageBox",
					icon: messageIcon,
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function() {
						this._bMessageOpen = false;
					}.bind(this)

				}
			);

		});

		var messageIcon = sap.m.MessageBox.Icon.QUESTION;

		var fnSuccess = function(oResponse) {

			oModel.updateBindings();

		};

		var fnError = function(oResponse) {

		};

		oModel.read(oCtx.sPath, {
			success: fnSuccess,
			error: fnError
		});

		//sap.ui.getCore().byId("zwx.sm.itsm.keyuserincidents::sap.suite.ui.generic.template.ObjectPage.view.Details::IncidentSet--header::headerEditable::com.sap.vocabularies.UI.v1.FieldGroup::HeaderInformation3::UserStatusDescription::Field").unbindElement();
		//	this.getView().getModel().refresh();

	},

	afterSaveRejected: function(oEvent) {
		var oModel = this.getView().getModel();
		oModel.setRefreshAfterChange(false);
		//alert("save rejected");
		//	this.closeBusyDialog();
	},

	onObjectPageProcessAction: function() {

		this.bundle = this.getView().getModel("i18n").getResourceBundle();

		var questionText;

		var hasProcessor = this.getView().getBindingContext().getObject("HasProcessor");
		var isInStatusNew = this.getView().getBindingContext().getObject("IsInStatusNew");

		if (!hasProcessor) {
			if (isInStatusNew) {
				// Case 1 - no processor and in Status "new"
				questionText = this.bundle.getText("PROCESS_POPUP_PROCEED_STATUS");
			} else {
				// Case 2 - no processor and status not "new"
				questionText = this.bundle.getText("PROCESS_POPUP_PROCEED");
			}
		} else {
			if (isInStatusNew) {
				// Case 3 - Processor assigned and status "new"
				questionText = this.bundle.getText("PROCESS_POPUP_ANOTHER_PROCESSOR", this.getView().getBindingContext().getObject(
					"PersonRespName")) + "\n" + this.bundle.getText("PROCESS_POPUP_PROCEED_STATUS");
			} else {
				// Case 4 - Processor assigned and status not "new"
				questionText = this.bundle.getText("PROCESS_POPUP_ANOTHER_PROCESSOR", this.getView().getBindingContext().getObject(
					"PersonRespName")) + "\n" + this.bundle.getText("PROCESS_POPUP_PROCEED");
			}
		}
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
			questionText, {
				onClose: jQuery.proxy(this.onCloseTakeOverMessageBox, this),
				icon: sap.m.MessageBox.Icon.QUESTION,
				title: this.bundle.getText("PROCESS_POPUP_HEADER"),
				actions: [this.bundle.getText("@TakeoverAction"), sap.m.MessageBox.Action.CANCEL],
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				initialFocus: "Custom Button"
			}
		);

	},

	onCloseTakeOverMessageBox: function(oEvent) {
		var that = this;
		if (oEvent === this.bundle.getText("@TakeoverAction")) {
			var guid = zwx.sm.itsm.keyuserincidents.util.Util.getGuidFromContext(this.getView().getBindingContext());

			this._oCtx = this.getView().getBindingContext();
			this._oModel = this.getView().getBindingContext().getModel();

			var url = "/ProcessIncident";
			this._oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"Guid": guid
				},
				success: function(aResponse) {
					zwx.sm.itsm.keyuserincidents.util.Util.setIncidentData(aResponse.ProcessIncident);
					that.setProcessor();
					that.setUserStatus();
					that.submitChanges();
					that.closeBusyDialog();
				},
				error: function(aErr) {
					that.closePopover();
					if (aErr[0] && aErr[0].error && aErr[0].error.response) {
						sap.m.MessageBox.error(aErr[0].error.response.message, {});
					}
					that.closeBusyDialog();
				}
			});

			this.openBusyDialog("busyPopover", this.getView().getModel("i18n").getResourceBundle().getText("BUSY_DIALOG_PLEASE_WAIT"));
		}

	},

	openBusyDialog: function(id, title) {
		this._dialog = zwx.sm.itsm.keyuserincidents.util.Util.getBusyDialog(id, title, this.getView(), this);
		this._dialog.setTitle(title);
		this._dialog.open();
	},

	closeBusyDialog: function() {
		this._dialog.close();
		this._dialog.destroy();
	},

	setProcessor: function() {
		this._oCtx = this.getView().getBindingContext();
		this._oModel = this._oCtx.getModel();
		this._oModel.setProperty(this._oCtx.sPath + "/PersonRespName", zwx.sm.itsm.keyuserincidents.util.Util.getIncidentData().PersonRespName);
		this._oModel.setProperty(this._oCtx.sPath + "/PersonResp", zwx.sm.itsm.keyuserincidents.util.Util.getIncidentData().PersonResp);
		this._oModel.setProperty(this._oCtx.sPath + "/BpIsNotProcessor", false);
		this._oModel.setProperty(this._oCtx.sPath + "/TakeoverActive", false);
	},

	setUserStatus: function() {
		this._oCtx = this.getView().getBindingContext();
		this._oModel = this._oCtx.getModel();
		this._oModel.setProperty(this._oCtx.sPath + "/UserStatusCode", zwx.sm.itsm.keyuserincidents.util.Util.getIncidentData()
			.UserStatusCode);
		this._oModel.setProperty(this._oCtx.sPath + "/UserStatusDescription", zwx.sm.itsm.keyuserincidents.util.Util.getIncidentData()
			.UserStatusDescription);
	},

	submitChanges: function() {
		this._oModel.submitChanges();
	},

	closePopover: function() {
		if (this._oPopover) {
			this._oPopover.close();
			this._oPopover.destroy();
		}
	}

});