sap.ui.define([
	"zwx/sm/itsm/keyuserincidents/util/Util"
], function(Util) {
	"use strict";

	return sap.ui.controller("zwx.sm.itsm.keyuserincidents.ext.controllers.ListReportExtension", {

		onInit: function() {

			var that = this;

			//  Change filter of Processor suggestion item
			this.getView().byId("ProcessorFilter").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				// return oItem.getText().match(new RegExp(sTerm, "i"));
				return oItem.getText();

			});

			var oTimeFrameCombobox = this.byId("TimeFrame-combobox");
			if (oTimeFrameCombobox) {
				oTimeFrameCombobox.setSelectedKey("N");
			}

			var oFavoritesFilteCombobox = this.byId("FavoritesFilter-combobox");
			if (oFavoritesFilteCombobox) {
				oFavoritesFilteCombobox.setSelectedKey("A");
			}

		},

		onAfterRendering: function() {
			this.getView().byId("ProcessorFilter").getBinding("suggestionItems").attachDataReceived(
				function(oEvent) {

					if (oEvent.getParameter("data")) {

						if (oEvent.getParameter("data").results.length === 1) {
							var aTokens = this.getView().byId("ProcessorFilter").getTokens();

							var newToken = new sap.m.Token("Token" + oEvent.getParameter(
								"data").results[0].Partner);
							newToken.setKey(oEvent.getParameter(
								"data").results[0].Partner);
							newToken.setText(oEvent.getParameter(
								"data").results[0].Name);

							aTokens.push(newToken);
							this.getView().byId("ProcessorFilter").insertToken(newToken);
							// this._oView.getModel().setProperty(this._oView.byId("Processor").getBindingContext().sPath + "/PersonResp", oEvent.getParameter(
							// 	"data").results[0].Partner);

							this.getView().byId("ProcessorFilter").setValue("");
							//	this.getView().byId("ProcessorFilter").destroySuggestionItems();

						}

					}

				}, this
			);

			this.getView().byId("SupportTeamFilter").getBinding("suggestionItems").attachDataReceived(
				function(oEvent) {

					if (oEvent.getParameter("data")) {

						if (oEvent.getParameter("data").results.length === 1) {
							var aTokens = this.getView().byId("SupportTeamFilter").getTokens();

							var newToken = new sap.m.Token("Token" + oEvent.getParameter(
								"data").results[0].Partner);
							newToken.setKey(oEvent.getParameter(
								"data").results[0].Partner);
							newToken.setText(oEvent.getParameter(
								"data").results[0].Name);

							aTokens.push(newToken);
							this.getView().byId("SupportTeamFilter").insertToken(newToken);
							// this._oView.getModel().setProperty(this._oView.byId("Processor").getBindingContext().sPath + "/PersonResp", oEvent.getParameter(
							// 	"data").results[0].Partner);

							this.getView().byId("SupportTeamFilter").setValue("");
							//	this.getView().byId("ProcessorFilter").destroySuggestionItems();

						}

					}

				}, this
			);
		},

		onBeforeRebindTableExtension: function(oEvent) {

			//this.oRouter = sap.ui.core.UIComponent.getRouterFor(this.getView());
			Util.init(this.getView());
			Util.setModel(this.getView().getModel());
			//this.oRouter.attachRoutePatternMatched(Util.readAttachments);

			var oBindingParams = oEvent.getParameter("bindingParams");
			oBindingParams.parameters = oBindingParams.parameters || {};

			var oSmartTable = oEvent.getSource();
			var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());

			if (oSmartFilterBar instanceof sap.ui.comp.smartfilterbar.SmartFilterBar) {

				var oCustomControl = oSmartFilterBar.getControlByKey("PriorityFilter");
				if (oCustomControl instanceof sap.m.MultiComboBox) {
					var items = oCustomControl.getSelectedKeys();

					for (var i = 0; i < items.length; i++) {
						oBindingParams.filters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, items[i]));
					}
				}

				var oStatusControl = oSmartFilterBar.getControlByKey("StatusFilter");
				if (oStatusControl instanceof sap.m.MultiComboBox) {
					var StatusItems = oStatusControl.getSelectedKeys();

					for (var m = 0; m < StatusItems.length; m++) {
						oBindingParams.filters.push(new sap.ui.model.Filter("DescriptiveStatusCode", sap.ui.model.FilterOperator.EQ, StatusItems[m]));
					}
				}

				var oDateControl = oSmartFilterBar.getControlByKey("DateRangeSelectorFilter");
				if (oDateControl instanceof sap.m.DateRangeSelection) {
					var dateValue = oDateControl.getDateValue();
					var Date1 = new Date(dateValue);
					var timezoneOffset = Date1.getTimezoneOffset();

					Date1.setMinutes(Date1.getMinutes() - timezoneOffset);

					var secondDateValue = oDateControl.getSecondDateValue();
					var Date2 = new Date(secondDateValue);
					Date2.setMinutes(Date2.getMinutes() - timezoneOffset);

					if (dateValue && secondDateValue) {
						oBindingParams.filters.push(new sap.ui.model.Filter("PostingDate", sap.ui.model.FilterOperator.BT, Date1, Date2));
					}
				}

				var oTimeFrameControl = oSmartFilterBar.getControlByKey("TimeFrameFilter");
				if (oTimeFrameControl instanceof sap.m.ComboBox) {
					var timeframe = oTimeFrameControl.getSelectedKey();

					if (timeframe) {
						oBindingParams.filters.push(new sap.ui.model.Filter("TimeFrameId", sap.ui.model.FilterOperator.EQ, timeframe));
					}
				}

				var oProcessorControl = oSmartFilterBar.getControlByKey("ProcessorFilter");
				if (oProcessorControl instanceof sap.m.Input) {
					var oProcessorFilter = this.getView().byId("ProcessorFilter");
					if (!oProcessorFilter.getTokens()) {
						this.sValueProcessor = "";
					} else {

						$.each(oProcessorFilter.getTokens(), function(index, value) {
							var processorFilter = oProcessorFilter.getTokens()[index].getKey();
							if (processorFilter) {
								oBindingParams.filters.push(new sap.ui.model.Filter("PersonResp", sap.ui.model.FilterOperator.EQ, processorFilter));
							}
						});

					}
				}

				var oSupportTeamControl = oSmartFilterBar.getControlByKey("SupportTeamFilter");
				if (oSupportTeamControl instanceof sap.m.Input) {
					var oSupportTeamFilter = this.getView().byId("SupportTeamFilter");
					if (!oSupportTeamFilter.getTokens()) {
						this.sValueSupportTeam = "";
					} else {

						$.each(oSupportTeamFilter.getTokens(), function(index, value) {
							var supportTeamFilter = oSupportTeamFilter.getTokens()[index].getKey();
							if (supportTeamFilter) {
								oBindingParams.filters.push(new sap.ui.model.Filter("ServiceTeam", sap.ui.model.FilterOperator.EQ, supportTeamFilter));
							}
						});

					}
				}

				// var oFavoritesControl = oSmartFilterBar.getControlByKey("FavoritesFilter");
				// if (oFavoritesControl instanceof sap.m.CheckBox) {

				// 	var Favorites = oFavoritesControl.getSelected();

				// 	if (Favorites === "X") {
				// 		oBindingParams.filters.push(new sap.ui.model.Filter("IsFavorite", sap.ui.model.FilterOperator.EQ, "X"));
				// 	}
				// }

				var oFavoritesFilterControl = oSmartFilterBar.getControlByKey("FavoritesOptionFilter");
				if (oFavoritesFilterControl instanceof sap.m.ComboBox) {
					var FavoritesValue = oFavoritesFilterControl.getSelectedKey();

					if (FavoritesValue === "X") {
						oBindingParams.filters.push(new sap.ui.model.Filter("IsFavorite", sap.ui.model.FilterOperator.EQ, FavoritesValue));
					}
				}

				var oProcessTypeFilterControl = oSmartFilterBar.getControlByKey("ProcessTypeFilter");
				if (oProcessTypeFilterControl instanceof sap.m.MultiComboBox) {
					var ProcessTypes = oProcessTypeFilterControl.getSelectedKeys();

					for (var n = 0; n < ProcessTypes.length; n++) {
						oBindingParams.filters.push(new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, ProcessTypes[n]));
					}
				}

			}
		},

		getCustomAppStateDataExtension: function(oCustomData) {
			// the content of the custom field shall be stored in
			// the app state, so that it can be restored later again
			// e.g. after a back navigation. The developer has to
			// ensure, that the content of the field is stored in
			// the object that is returned by this method.
			// Example:
			var oPriorityComboBox = this.byId("PriorityList-multicombobox");
			if (oPriorityComboBox) {
				oCustomData.CustomPriorityFilter = oPriorityComboBox.getSelectedKeys();
			}
			var oStatusComboBox = this.byId("StatusList-multicombobox");
			if (oStatusComboBox) {
				oCustomData.CustomStatusFilter = oStatusComboBox.getSelectedKeys();
			}

			var oDateRangeSelector = this.byId("DateRangeSelector");
			if (oDateRangeSelector) {
				oCustomData.CustomDateRangeFilterDate1 = oDateRangeSelector.getDateValue();
				oCustomData.CustomDateRangeFilterDate2 = oDateRangeSelector.getSecondDateValue();
			}

			var oTimeFrameCombobox = this.byId("TimeFrame-combobox");
			if (oTimeFrameCombobox) {
				oCustomData.CustomTimeFrameFilter = oTimeFrameCombobox.getSelectedKey();
			}

			var oFavoritesFilterControl = this.byId("FavoritesFilter-combobox");
			if (oFavoritesFilterControl) {
				oCustomData.CustomFavoritesFilter = oFavoritesFilterControl.getSelectedKey();
			}

			var oProcessTypeComboBox = this.byId("ProcessTypeList-multicombobox");
			if (oProcessTypeComboBox) {
				oCustomData.CustomProcessTypeFilter = oProcessTypeComboBox.getSelectedKeys();
			}

			var oProcessorTypeMultiInput = this.byId("ProcessorFilter");
			if (oProcessorTypeMultiInput) {

				var aTokens = oProcessorTypeMultiInput.getTokens();

				var aTokenContainer = [];

				$.each(aTokens, function(index, token) {

					var oTokenContainer = {};
					oTokenContainer.key = aTokens[index].getKey();
					oTokenContainer.text = aTokens[index].getText();

					aTokenContainer.push(oTokenContainer);
				});
				oCustomData.CustomProcessorFilter = aTokenContainer;
			}

			var oSupportTeamTypeMultiInput = this.byId("SupportTeamFilter");
			if (oSupportTeamTypeMultiInput) {

				var aTokensST = oSupportTeamTypeMultiInput.getTokens();

				var aTokenContainerST = [];

				$.each(aTokensST, function(index, token) {

					var oTokenContainerST = {};
					oTokenContainerST.key = aTokensST[index].getKey();
					oTokenContainerST.text = aTokensST[index].getText();

					aTokenContainerST.push(oTokenContainerST);
				});
				oCustomData.CustomSupportTeamFilter = aTokenContainerST;
			}

			// var oFavoritesSwitch = this.byId("Favorites-switch");
			// if (oFavoritesSwitch) {
			// 	oCustomData.CustomFavoritesFilter = oFavoritesSwitch.getSelected();
			// }
		},

		restoreCustomAppStateDataExtension: function(oCustomData) {
			// in order to to restore the content of the custom
			// field in the filter bar e.g. after a back navigation,
			// an object with the content is handed over to this
			// method and the developer has to ensure, that the
			// content of the custom field is set accordingly
			// also, empty properties have to be set
			// Example:
			if (oCustomData.CustomPriorityFilter !== undefined) {
				if (this.byId("PriorityList-multicombobox")) {
					this.byId("PriorityList-multicombobox").setSelectedKeys(oCustomData.CustomPriorityFilter);
				}
			}
			if (oCustomData.CustomStatusFilter !== undefined) {
				if (this.byId("StatusList-multicombobox")) {
					this.byId("StatusList-multicombobox").setSelectedKeys(oCustomData.CustomStatusFilter);
				}
			}

			if (oCustomData.CustomDateRangeFilterDate1 !== undefined) {

				if (oCustomData.CustomDateRangeFilterDate1 == null ) {
					this.byId("DateRangeSelector").setDateValue(oCustomData.CustomDateRangeFilterDate1);
				} else {
					this.byId("DateRangeSelector").setDateValue(new Date(oCustomData.CustomDateRangeFilterDate1));
				}

				if (oCustomData.CustomDateRangeFilterDate2 == null ) {
					this.byId("DateRangeSelector").setSecondDateValue(oCustomData.CustomDateRangeFilterDate2);
				} else {
					this.byId("DateRangeSelector").setSecondDateValue(new Date(oCustomData.CustomDateRangeFilterDate2));
				}

			}

			if (oCustomData.CustomTimeFrameFilter !== undefined) {
				this.byId("TimeFrame-combobox").setSelectedKey(oCustomData.CustomTimeFrameFilter);
			}

			// if (oCustomData.CustomFavoritesFilter !== undefined) {
			// 	this.byId("Favorites-switch").setSelected(oCustomData.CustomFavoritesFilter);
			// }

			if (oCustomData.CustomFavoritesFilter !== undefined) {
				this.byId("FavoritesFilter-combobox").setSelectedKey(oCustomData.CustomFavoritesFilter);
			}

			if (oCustomData.CustomProcessTypeFilter !== undefined) {
				if (this.byId("ProcessTypeList-multicombobox")) {
					this.byId("ProcessTypeList-multicombobox").setSelectedKeys(oCustomData.CustomProcessTypeFilter);
				}
			}

			if (oCustomData.CustomProcessorFilter !== undefined) {
				if (this.byId("ProcessorFilter")) {

					var aTokenContainer = [];
					$.each(oCustomData.CustomProcessorFilter, function(index) {

						var oToken = new sap.m.Token();
						oToken.setText(oCustomData.CustomProcessorFilter[index].text);
						oToken.setKey(oCustomData.CustomProcessorFilter[index].key);

						aTokenContainer.push(oToken);
					});

					this.byId("ProcessorFilter").setTokens(aTokenContainer);
				}
			}

			if (oCustomData.CustomSupportTeamFilter !== undefined) {
				if (this.byId("SupportTeamFilter")) {

					var aTokenContainerST = [];
					$.each(oCustomData.CustomSupportTeamFilter, function(index) {

						var oTokenST = new sap.m.Token();
						oTokenST.setText(oCustomData.CustomSupportTeamFilter[index].text);
						oTokenST.setKey(oCustomData.CustomSupportTeamFilter[index].key);

						aTokenContainerST.push(oTokenST);
					});

					this.byId("SupportTeamFilter").setTokens(aTokenContainerST);
				}
			}

		},

		handlePrioritySelection: function(oEvent) {

		},

		handleStatusSelection: function(oEvent) {

		},

		handleTimeFrameChange: function(oEvent) {
			//			Disable Date Range Picker if Time Frame has been set
			var vSelectedKey = this.byId("TimeFrame-combobox").getSelectedKey();
			if (vSelectedKey === "N") {
				this.byId("DateRangeSelector").setEnabled(true);
			} else {
				this.byId("DateRangeSelector").setEnabled(false);
			}

		},

		handleDateRangeChange: function(oEvent) {
			var vDate1 = this.byId("DateRangeSelector").getDateValue();
			if (vDate1 === null) {
				this.byId("TimeFrame-combobox").setEnabled(true);
			} else {
				this.byId("TimeFrame-combobox").setEnabled(false);
			}
		},

		handleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm.value !== "") {
				aFilters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sTerm));
				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			}
		},

		suggestionProcessorItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sBp = oSelected.data("type");
			var oView = this.getView();
			var oInput = oView.byId("ProcessorFilter");

			$.each(oInput.getTokens(), function(index, value) {
				if (oSelected.getProperty("text") === oInput.getTokens()[index].getProperty("text"))
				// Store BP in corresponding Token
				{
					oInput.getTokens()[index].data("type", sBp);
					oInput.getTokens()[index].setKey(sBp);
				}

			});
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		suggestionSupportTeamItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sBp = oSelected.data("type");
			var oView = this.getView();
			var oInput = oView.byId("SupportTeamFilter");

			$.each(oInput.getTokens(), function(index, value) {
				if (oSelected.getProperty("text") === oInput.getTokens()[index].getProperty("text"))
				// Store BP in corresponding Token
				{
					oInput.getTokens()[index].data("type", sBp);
					oInput.getTokens()[index].setKey(sBp);
				}

			});
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		onValidatedFieldLiveChange: function(oEvent) {

			if (oEvent.getParameters().newValue === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			} else {
				oEvent.getSource().data("type", "");
			}

		},

		onValueHelpSupportTeam: function(oEvent) {

			var oModel = this.getView().getModel();

			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
						label: this.getView().getModel("i18n").getResourceBundle().getText("BP_ID"),
						template: "Partner"
					}, {
						label: this.getView().getModel("i18n").getResourceBundle().getText("BP_NAME"),
						template: "Name"
					}

				]
			});
			var title = this.getView().getModel("i18n").getResourceBundle().getText("LBL_SUPPORT_TEAM");
			var oValueHelpDialog = Util.getPartnerValueHelp(oEvent, "/SupportTeamSet", oModel, oColModel, true, title);

			oValueHelpDialog.open();
			oValueHelpDialog.update();

		},

		onValueHelpProcessor: function(oEvent) {

			var oModel = this.getView().getModel();

			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
						label: this.getView().getModel("i18n").getResourceBundle().getText("BP_ID"),
						template: "Partner"
					}, {
						label: this.getView().getModel("i18n").getResourceBundle().getText("BP_NAME"),
						template: "Name"
					}

				]
			});
			var title = this.getView().getModel("i18n").getResourceBundle().getText("LBL_PROCESSOR");
			var oValueHelpDialog = Util.getPartnerValueHelp(oEvent, "/ProcessorSet", oModel, oColModel, true, title);

			oValueHelpDialog.open();
			oValueHelpDialog.update();

		},

		markFavorite: function(event) {

			var model = Util.getModel();

			var source = event.getSource();

			var curentSrc = source.getSrc();

			var value;

			// var value = source.data("favoriteValue");

			//		Toggle value
			if (curentSrc === "sap-icon://favorite") {

				source.setSrc("sap-icon://unfavorite");
				value = "";

			} else {

				value = "X";
				source.setSrc("sap-icon://favorite");

			}

			var ct = source.getBindingContext();

			var path = ct.getPath();

			model.update(path, {
				IsFavorite: value
			}, {
				success: function() {

					// var curentSrc = source.getSrc();

					// if (curentSrc === "sap-icon://favorite") {

					// 	source.setSrc("sap-icon://unfavorite");

					// } else {

					// 	source.setSrc("sap-icon://favorite");

					// }
				},

				error: function() {

					sap.m.MessageToast.show("{i18n>ERROR_FAVORITE}");

					if (curentSrc === "sap-icon://favorite") {

						source.setSrc("sap-icon://unfavorite");

					} else {

						source.setSrc("sap-icon://favorite");

					}

				},
				async: true
			});
		}

	});
});
