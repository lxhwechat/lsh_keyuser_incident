jQuery.sap.declare("zwx.sm.itsm.keyuserincidents.util.Util");

zwx.sm.itsm.keyuserincidents.util.Util = {

	init: function(oView) {

		if (!this.Executed) {

			var that = this;
			that.oView = oView;
			this.Executed = true;
			this.incidentData = undefined;
			this.busyDialogBuffer = [];

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
			this.oRouter.attachRoutePatternMatched(

				function(oEvent) {
					if (oEvent.getParameter("name") === "IncidentSet") {

						var sPath = "/" + oEvent.getParameter("name") + "(" + oEvent.getParameter("arguments").keys1 + ")";
						that.setPath(sPath);

					}

				}

			);
		}
	},

	setObjectAPI: function(api) {
		this.ObjectAPI = api;
	},

	getObjectAPI: function() {
		return this.ObjectAPI;
	},

	setPath: function(sPath) {
		this.sPath = sPath;
	},

	getPath: function() {
		return this.sPath;
	},

	setModel: function(oModel) {
		this.oModel = oModel;
	},

	getModel: function() {
		return this.oModel;
	},

	setView: function(oView) {
		this.oView = oView;
	},

	getView: function() {
		return this.oView;
	},

	getGuidFromContext: function(Context) {
		// var guid = Context.sPath.split("'");
		// guid = guid[1];
		// var guid2 = guid.replace(/-/g, "");
		// return guid;

		var guid = Context.sPath.split("(");
		guid = guid[1].split(")");
		guid = guid[0];
		var guid2 = guid.replace(/guid/gi, "");
		var guid3 = guid2.replace(/'/gi, "");

		return guid3;

	},

	dateTime: function(oDate) {
		var oDate2 = (oDate instanceof Date) ? oDate : new Date(oDate);
		var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
			pattern: "dd.MM.yyyy HH:mm"
		});
		return dateFormat.format(oDate2);
	},

	formatFileSizeAttribute: function(sValue) {
		jQuery.sap.require("sap.ui.core.format.FileSizeFormat");
		if (jQuery.isNumeric(sValue)) {
			return sap.ui.core.format.FileSizeFormat.getInstance({
				binaryFilesize: false,
				maxFractionDigits: 1,
				maxIntegerDigits: 3
			}).format(sValue);
		} else {
			return sValue;
		}
	},
	oDataServiceErrorHandling: function(controller, resourceBundle, response, title) {

		// JSON data to load
		var data;

		// if the JSON data is found in the typical place for a response
		try {
			// then grab it from there
			data = response.responseText;
		}
		// else assume that the response itself is the JSON data
		catch (exception) {
			data = response;
		}

		var model = new sap.ui.model.json.JSONModel();
		model.setJSON(data);

		var errorCode = null;
		var errorMessage = null;
		if (model.getData().error.innererror) {
			errorCode = model.getData().error.innererror.errordetails[0].code;
			errorMessage = model.getData().error.innererror.errordetails[0].message;
		} else {
			errorCode = model.getData().error.code;
			errorMessage = model.getData().error.message.value;
		}

		switch (errorCode) {
			case "CRM_ORDER/013":
				zwx.sm.itsm.keyuserincidents.util.Util.showErrorMessageBox(resourceBundle, "TEXT_POST_FAILURE_LOCK", title, false,
					errorMessage);
				break;
			default:
				zwx.sm.itsm.keyuserincidents.util.Util.showErrorMessageBox(resourceBundle, errorMessage, title, false, null);
				break;
		}
	},

	showErrorMessageBox: function(resourceBundle, message, messageTitle, goBack, details) {

		var errorMessage, errorMessageTitle;
		if (resourceBundle) {
			errorMessage = resourceBundle.getText(message);
			errorMessageTitle = resourceBundle.getText(messageTitle);
		} else {
			errorMessage = message;
		}

		// if the optional details parameter has been specified
		if (!details) {
			sap.m.MessageBox.show(errorMessage, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: errorMessageTitle,
				actions: resourceBundle.getText("CLOSE_POPUP"),
				onClose: null,
				initialFocus: null

			});
		}
		//
		else {
			sap.m.MessageBox.show(errorMessage, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: errorMessageTitle,
				actions: resourceBundle.getText("CLOSE_POPUP"),
				onClose: null,
				initialFocus: null,
				verticalScrolling: true,
				horizontalScrolling: true,
				details: details
			});
		}
	},

	getPartnerValueHelp: function(oEvent, sPathSet, oModel, oColModel, multi, title, entityPath) {
		var that = this;
		var oMultiInput = oEvent.getSource();

		var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({

			title: title,
			supportMultiselect: multi,
			supportRanges: false,
			supportRangesOnly: false,

			stretch: sap.ui.Device.system.phone,

			ok: function(oControlEvent) {
				that.aTokens = oControlEvent.getParameter("tokens");
				if (oMultiInput instanceof sap.m.MultiInput) {
					oMultiInput.setTokens(that.aTokens);
				} else if (oMultiInput instanceof sap.m.Input) {
					if (that.aTokens[0]) {
						oMultiInput.setValue(that.aTokens[0].getText());
						oModel.setProperty(oMultiInput.getBindingContext().sPath + entityPath, that.aTokens[0].getKey());
					}

				}
				oValueHelpDialog.close();
			},

			cancel: function(oControlEvent) {
				oValueHelpDialog.close();
			},

			afterClose: function() {
				oValueHelpDialog.destroy();
			}
		});

		if (oMultiInput instanceof sap.m.MultiInput) {
			// set already selected Tokens
			oValueHelpDialog.setTokens(oMultiInput.getTokens());
		}

		oValueHelpDialog.getTable().setModel(oColModel, "columns");
		oValueHelpDialog.setTokenDisplayBehaviour(sap.ui.comp.smartfilterbar.DisplayBehaviour.descriptionOnly);
		oValueHelpDialog.setDescriptionKey("Name");
		oValueHelpDialog.setKey("Partner");
		// var oRowsModel = new sap.ui.model.json.JSONModel();
		// oRowsModel.setData(this.aItems);
		oValueHelpDialog.getTable().setModel(oModel);

		if (oValueHelpDialog.getTable().bindRows) {
			oValueHelpDialog.getTable().bindRows(sPathSet);
		}
		if (oValueHelpDialog.getTable().bindItems) {
			var oTable = oValueHelpDialog.getTable();

			oTable.bindAggregation("items", sPathSet, function(sId, oContext) {
				var aCols = oTable.getModel("columns").getData().cols;

				return new sap.m.ColumnListItem({
					cells: aCols.map(function(column) {
						var colname = column.template;
						return new sap.m.Label({
							text: "{" + colname + "}"
						});
					})
				});
			});
		}

		var fnSearch = function(oEvt) {
			// add filter for search
			var aFilters = [];
			var sQuery = sap.ui.getCore().byId(this.getFilterBar().getBasicSearch()).getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			var binding;
			// update list binding
			if (oValueHelpDialog.getTable().bindRows) {
				binding = this.getTable().getBinding("rows");
			}
			if (oValueHelpDialog.getTable().bindItems) {
				binding = this.getTable().getBinding("items");
			}
			binding.filter(aFilters);
		};

		//	oValueHelpDialog.getTable().bindAggregation("rows", sPathSet);

		var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
			advancedMode: true,
			filterBarExpanded: false,
			showGoOnFB: !sap.ui.Device.system.phone,

			search: jQuery.proxy(fnSearch, oValueHelpDialog)
		});

		if (oFilterBar.setBasicSearch) {
			oFilterBar.setBasicSearch(new sap.m.SearchField({
				showSearchButton: sap.ui.Device.system.phone,
				placeholder: "Search",
				search: jQuery.proxy(fnSearch, oValueHelpDialog)
			}));
		}
		oValueHelpDialog.setFilterBar(oFilterBar);
		return oValueHelpDialog;
	},

	getIncidentFavoriteValue: function(isFavorite) {

		if (isFavorite === "X") {
			return "sap-icon://favorite";
		}

		return "sap-icon://unfavorite";
	},

	getCategoryDescription: function(oModel, catId, procType, oInputCategory) {
		var that = this;
		var fnSuccess = function(oData) {

			if (oData.getCategoryDescription.catDescription) {
				that.oInputCategory.setValue(oData.getCategoryDescription.catDescription);
				that.oInputCategory.data("CategoryId", oData.getCategoryDescription.catID);
				that.oInputCategory.data("CategoryCatalogType", oData.getCategoryDescription.catCatalogType);
				that.oInputCategory.data("CategoryAspId", oData.getCategoryDescription.catAspectID);

			}
		};

		var fnError = function(oError) {};

		that.oInputCategory = oInputCategory;
		var url = "/getCategoryDescription";

		oModel.callFunction(url, {
			method: "GET",
			urlParameters: {
				"catId": catId,
				"procType": procType
			},
			success: fnSuccess,
			error: fnError
		});
	},

	getDefaultPriority: function(oModel, procType, oInputPrio) {
		var that = this;

		var fnSuccess = function(oData) {

			if (oData.getDefaultPriority.defaultPrio) {
				that.oInputPrio.setSelectedKey(oData.getDefaultPriority.defaultPrio);
			}
		};

		var fnError = function(oError) {};

		that.oInputPrio = oInputPrio;

		var url = "/getDefaultPriority";

		oModel.callFunction(url, {
			method: "GET",
			urlParameters: {
				"ProcessType": procType
			},
			success: fnSuccess,
			error: fnError
		});
	},

	validateComponent: function(oModel, compId, oInputComponent) {
		var that = this;
		var fnSuccess = function(oData) {
			if (!oData.validateComponent.valid) {
				that.oInputComponent.setValue("");
			}
		};

		var fnError = function(oError) {};

		that.oInputComponent = oInputComponent;

		oModel.setUseBatch(false);
		var url = "/validateComponent";

		oModel.callFunction(url, {
			method: "GET",
			urlParameters: {
				"compId": compId
			},
			success: fnSuccess,
			error: fnError
		});
		oModel.setUseBatch(true);
	},

	validateConfigItem: function(oModel, configItemId, oInputConfigItem) {
		var that = this;
		var fnSuccess = function(oData) {
			if (!oData.validateConfigItem.valid) {
				that.oInputConfigItem.setValue("");
			}
		};

		var fnError = function(oError) {};

		that.oInputConfigItem = oInputConfigItem;

		oModel.setUseBatch(false);
		var url = "/validateConfigItem";

		oModel.callFunction(url, {
			method: "GET",
			urlParameters: {
				"configItemId": configItemId
			},
			success: fnSuccess,
			error: fnError
		});
		oModel.setUseBatch(true);
	},

	validateContactPerson: function(oModel, bpId, oInputContactPerson) {
		var that = this;
		var fnSuccess = function(oData) {
			if (!oData.validateContactPerson.valid) {
				that.oInputContactPerson.setValue("");
			}
		};

		var fnError = function(oError) {};

		that.oInputContactPerson = oInputContactPerson;

		oModel.setUseBatch(false);
		var url = "/validateContactPerson";

		oModel.callFunction(url, {
			method: "GET",
			urlParameters: {
				"bpId": bpId
			},
			success: fnSuccess,
			error: fnError
		});
		oModel.setUseBatch(true);

	},

	getConfigItemDescription: function(oModel, configItemId, oInputConfigItem) {
		var that = this;
		var fnSuccess = function(oData) {
			if (!oData.getConfigItemDescription.configItemDescription) {
				that.oInputConfigItem.setValue("");
			} else {
				that.oInputConfigItem.setValue(oData.getConfigItemDescription.configItemDescription);
				that.oInputConfigItem.data("type", oData.getConfigItemDescription.configItemId);
			}
		};

		var fnError = function(oError) {};

		that.oInputConfigItem = oInputConfigItem;

		oModel.setUseBatch(false);
		var url = "/getConfigItemDescription";

		oModel.callFunction(url, {
			method: "GET",
			urlParameters: {
				"configItemId": configItemId
			},
			success: fnSuccess,
			error: fnError
		});
		oModel.setUseBatch(true);
	},

	getContactPersonDescription: function(oModel, bpId, oInputContactPerson) {
		var that = this;
		var fnSuccess = function(oData) {
			if (!oData.getContactPersonDescription.contactPersonDescription) {
				that.oInputContactPerson.setValue("");
			} else {
				that.oInputContactPerson.setValue(oData.getContactPersonDescription.contactPersonDescription);
				that.oInputContactPerson.data("type", oData.getContactPersonDescription.contactPersonId);
			}
		};

		var fnError = function(oError) {};

		that.oInputContactPerson = oInputContactPerson;

		oModel.setUseBatch(false);
		var url = "/getContactPersonDescription";

		oModel.callFunction(url, {
			method: "GET",
			urlParameters: {
				"bpId": bpId
			},
			success: fnSuccess,
			error: fnError
		});
		oModel.setUseBatch(true);

	},

	getBusyDialog: function(id, oTitle, oView, oController) {

		var oDialog;

		// $.each(this.busyDialogBuffer, function(index, value) {
		// 	if (value.id === id) {

		// 		oDialog = {
		// 			id: value.id,
		// 			title: value.title,
		// 			view: value.view,
		// 			dialog: value.dialog

		// 		};
		// 	}
		// });

		// // instantiate dialog
		// if (!oDialog) {
		oDialog = sap.ui.xmlfragment(id, "zwx.sm.itsm.keyuserincidents.ext.fragments.BusyDialog", oController);
		oView.addDependent(oDialog);
		oDialog.setTitle(oTitle);
		jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, oDialog);
		// oDialog = {
		// 	id: id,
		// 	title: oTitle,
		// 	view: oView,
		// 	dialog: oDialog

		// };

		// this.busyDialogBuffer.push(oDialog);

		// }

		return oDialog;

	},

	getProcTypeDesc: function() {
		return this.ProcTypeDescription;
	},
	setProcTypeDesc: function(sProcTypeDescription) {
		this.ProcTypeDescription = sProcTypeDescription;
	},

	getIncidentData: function() {
		return this.incidentData;
	},

	setIncidentData: function(incidentData) {
		this.incidentData = incidentData;
	},

	removeProcessor: function() {
		if (this.incidentData) {
			this.incidentData.PersonResp = undefined;
			this.incidentData.PersonRespName = undefined;
		}
	},
	
	removeConfigItem: function() {
		if (this.incidentData) {
			this.incidentData.ConfigItemId = undefined;
		}
	},	

	removeSupportTeam: function() {
		if (this.incidentData) {
			this.incidentData.ServiceTeam = undefined;
			this.incidentData.ServiceTeamList = undefined;
		}
	}

};