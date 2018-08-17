//jQuery.sap.require("zwx.sm.itsm.keyuserincidents.util.Util");

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/suite/ui/generic/template/extensionAPI/extensionAPI",
	"zwx/sm/itsm/keyuserincidents/util/Util"
], function(Controller, Sorter, extensionAPI, Util) {
	"use strict";

	return Controller.extend("zwx.sm.itsm.keyuserincidents.ext.controllers.Attachments", {

		onInit: function() {

			var oView = this.getView();
			var i18nModel = this.getOwnerComponent().getModel("i18n");
			if (i18nModel) {
				this.bundle = i18nModel.getResourceBundle();
			}

			oView.attachmentCollection = oView.byId("fileUpload");

			// get extension API
			// extensionAPI.getExtensionAPIPromise(oView).then(
			// 	function(oExtensionAPI) {
			// 		this.extensionAPI = oExtensionAPI;
			// 		this.extensionAPI.attachPageDataLoaded(jQuery.proxy(this.pageDataLoaded, this));
			// 	});

		},

		onBeforeRendering: function() {
			// deregister a listener via jQuery
			if (!this.extensionAPI) {
				this.extensionAPI = Util.getObjectAPI(this.extensionAPI);
				this.extensionAPI.attachPageDataLoaded(jQuery.proxy(this.pageDataLoaded, this));
				this.extensionAPI.getTransactionController().attachAfterSave(jQuery.proxy(this.afterSave, this));
			}

		},

		afterSave: function(oEvent) {

			oEvent.saveEntityPromise.then(jQuery.proxy(this.afterSaveSuccess, this), jQuery.proxy(this.afterSaveReject, this));

		},

		afterSaveSuccess: function(oEvent) {
			this.readAttachments(this.getView());
		},

		afterSaveReject: function(oEvent) {
			//alert("Failure");
			//this.readTexts(this.getView().getBindingContext().sPath);
		},

		pageDataLoaded: function(context) {

			this.readAttachments(this.getView());

		},

		readAttachments: function(oView) {
			var that = this;

			oView.attachmentPath = this.getView().getBindingContext().sPath + "/AttachmentSet";

			// set the upload URL for the current Incident
			//	if (oView.attachmentCollection.getUploadEnabled()) {
			oView.attachmentCollection.setUploadUrl(Util.getModel().sServiceUrl + oView.attachmentPath
				// + (
				// sUrlParams ? "?" +
				// sUrlParams : "")

			);
			//	}

			this.jsonModelAttachments = new sap.ui.model.json.JSONModel();
			oView.attachmentCollection.setModel(this.jsonModelAttachments);
			// Clear all attachments first
			oView.attachmentCollection.removeAllItems();
			oView.attachmentCollection.aItems = [];

			var fnSuccess = function(oResponse) {

				that.oView.attachmentCollection.setBusy(false);
				that.oAttachmentSet = oResponse.results;

				$.each(that.oAttachmentSet, function(index, value) {
					that.oAttachmentSet[index].url = value.__metadata.media_src;
					that.oAttachmentSet[index].documentId = "refGuid=guid'" + value.refGuid + "',loioId='" + value.loioId + "',phioId='" + value.phioId +
						"'";
				});

				that.jsonModelAttachments.setData({
					AttachmentSet: that.oAttachmentSet
				});

				that.setAttachmentBinding();
			};

			var fnError = function(oResponse) {
				that.oView.attachmentCollection.setBusy(false);
			};

			oView.attachmentCollection.setBusy(true);
			Util.getModel().read(oView.attachmentPath, {
				success: fnSuccess,
				error: fnError
			});

		},

		setAttachmentBinding: function() {

			var oView = this.getView();
			// Attachments

			oView.attachmentCollection.bindAggregation("items", ({
				path: "/AttachmentSet",
				template: new sap.m.UploadCollectionItem({
					documentId: "{documentId}",
					mimeType: "{mimeType}",
					fileName: "{fileName}",
					enableDelete: "{enableDelete}",
					enableEdit: "{enableEdit}",
					visibleEdit: "{visibleEdit}",
					visibleDelete: "{visibleDelete}",
					url: "{url}",
					attributes: [{
						"title": this.bundle.getText("UPLOADED_BY"),
						"text": "{contributor}"
					}, {
						"title": this.bundle.getText("UPLOADED_ON"),
						"text": "{path: 'uploadDate',formatter: 'zwx.sm.itsm.keyuserincidents.util.Util.dateTime'}"
					}, {
						"title": this.bundle.getText("FILE_SIZE"),
						"text": "{path: 'fileSize',formatter: 'zwx.sm.itsm.keyuserincidents.util.Util.formatFileSizeAttribute'}"
					}]
				})
			}));

		},

		onChange: function(oEvent) {
			//r oView = this.getView();
			var oModel = zwx.sm.itsm.keyuserincidents.util.Util.getModel();
			var oUploadCollection = oEvent.getSource();

			var token = this.sToken || oModel.getSecurityToken();

			// If filename exceeds 40 characters, trim it
			var filename = oEvent.getParameter("mParameters").files[0].name;
			if (filename.length > 40) {
				var aFilenameParts = filename.split(".");
				if (aFilenameParts.length === 1) {
					filename = filename.substring(0, 40);
				} else {
					var filenameExtension = aFilenameParts[aFilenameParts.length - 1];
					aFilenameParts = aFilenameParts.slice(0, aFilenameParts.length - 1);
					var remainingCharacters = 39 - filenameExtension.length;
					filename = aFilenameParts.join(".").substring(0, remainingCharacters) + "." + filenameExtension;
				}
			}
			/* eslint-disable JS_ODATA_MANUAL_TOKEN */
			// Header Token
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});
			/* eslint-enable JS_ODATA_MANUAL_TOKEN */
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			// Header Content-Disposition
			var oCustomerHeaderContentDisp = new sap.m.UploadCollectionParameter({
				name: "content-disposition",
				value: "inline; filename=\"" + encodeURIComponent(filename) + "\""
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderContentDisp);
		},

		onUploadComplete: function(oEvent) {
			var that = this;
			var oView = this.getView();
			var fnSuccess = function(oResponse) {

				var hasDocumentId = function(a, docId) {

					for (var i = 0, len = a.length; i < len; i++) {

						if (a[i].documentId === docId) {
							return true;
						}

					}

				};

				var addedAttachments = [];

				$.each(oResponse.results, function(index, value) {
					oResponse.results[index].url = value.__metadata.media_src;
					oResponse.results[index].documentId = "refGuid=guid'" + value.refGuid + "',loioId='" + value.loioId + "',phioId='" + value.phioId +
						"'";

					if (hasDocumentId(that.oAttachmentSet, oResponse.results[index].documentId)) {
						// nothing to check
					} else {
						addedAttachments.push(oResponse.results[index]);
					}

				});

				$.each(addedAttachments, function(index, value) {

					that.addNewUploadCollectionItem(that.oView.attachmentCollection, value);

				});

				// that.jsonModelAttachments.setData({
				// 	AttachmentSet: that.oAttachmentSet
				// }, true);
				// that.oView.attachmentCollection.setBusy(false);
				//	that.setAttachmentBinding();
			};

			var fnError = function(oResponse) {
				that.oView.attachmentCollection.setBusy(false);
			};

			if (oEvent.getParameters().getParameter("status") !== 201) // Bad request
			{
				var errorMsg = $($.parseXML(oEvent.getParameters().getParameter("responseRaw"))).find("message").text();
				that.oView.attachmentCollection.setBusy(false);
				zwx.sm.itsm.keyuserincidents.util.Util.showErrorMessageBox(that.bundle, "ERROR_CONTACT_SYSADMIN",
					"ATTACHMENT_UPLOAD_ERROR", null, errorMsg);
			} else {

				zwx.sm.itsm.keyuserincidents.util.Util.getModel().read(oView.attachmentPath, {
					success: fnSuccess,
					error: fnError
				});

				//that.readAttachments(this.getView());

				sap.m.MessageToast.show(this.bundle.getText("ATTACHMENT_UPLOAD_SUCCESS"));

			}

			/*	var batchChanges = [];
				batchChanges.push(this.oView.getModel().createBatchOperation(this.oView.attachmentPath, "GET"));
				sm.itsm.myincidents.util.Util.getModel().setUseBatch(true);
				sm.itsm.myincidents.util.Util.getModel().addBatchReadOperations(batchChanges);
				sm.itsm.myincidents.util.Util.getModel().submitBatch(function(response) {
					var array = response.__batchResponses;
					that.oAttachmentSet = array[0].data.results;

					$.each(that.oAttachmentSet, function(index, value) {
						that.oAttachmentSet[index].url = value.__metadata.media_src;
						that.oAttachmentSet[index].documentId = "refGuid=guid'" + value.refGuid + "',loioId='" + value.loioId + "',phioId='" + value.phioId +
							"'";

					});

					that.jsonModelAttachments.setData({
						AttachmentSet: that.oAttachmentSet
					});

					that.oView.attachmentfltr.setCount(that.oAttachmentSet.length);
					that.jsonModelAttachments.refresh();
					that.setAttachmentBinding();
					//	this.readAttachmentsFromBackend(false);
					//  
				}, function() {});*/
		},

		onDeleteFile: function(oEvent) {
			//var oModel = this.getView().getModel();
			var that = this;
			var parameters = oEvent.getParameters();
			that.docIdToDelete = parameters.documentId;
			var removStartVal = "";
			removStartVal = parameters.documentId + ")";
			var path = "/AttachmentSet(";
			var url = path + removStartVal;
			var oView = this.getView();

			var fnError = function(oResponse) {

				that.oView.attachmentCollection.setBusy(false);
				sap.m.MessageToast.show(that.bundle.getText("ATTACHMENT_DELETE_FAILURE"));
			};

			var fnSuccess = function(oResponse) {

				var oModel = oView.attachmentCollection.getModel();
				var oData = oModel.getData();
				var aItems = oData.AttachmentSet;
				var bSetData = false;

				jQuery.each(aItems, function(index) {
					if (aItems[index] && aItems[index].documentId === that.docIdToDelete) {
						aItems.splice(index, 1);
						bSetData = true;

					}
				});
				if (bSetData === true) {
					oModel.setData(oData);
					oView.attachmentCollection.setModel(oModel);
					oModel.updateBindings(true);

					sap.m.MessageToast.show(that.bundle.getText("ATTACHMENT_DELETE_SUCCESS"));
				}

				that.oView.attachmentCollection.setBusy(false);

			};

			oView.attachmentCollection.setBusy(true);
			zwx.sm.itsm.keyuserincidents.util.Util.getModel().remove(url, {
				success: fnSuccess,
				error: fnError
			});
		},

		addNewUploadCollectionItem: function(oUploadCollection, item) {

			var oData = oUploadCollection.getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).AttachmentSet;

			var oItem = {
				documentId: item.documentId,
				mimeType: item.mimeType,
				fileName: item.fileName,
				enableDelete: item.enableDelete,
				enableEdit: item.enableEdit,
				visibleEdit: item.visibleEdit,
				visibleDelete: item.visibleDelete,
				url: item.url,
				contributor: item.contributor,
				uploadDate: item.uploadDate,
				fileSize: item.fileSize
			};

			aItems.unshift(oItem);
			oUploadCollection.getModel().setData({
				"AttachmentSet": aItems
			});

			this.oAttachmentSet = aItems;

		}

	});
});