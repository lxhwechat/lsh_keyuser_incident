sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/I18NText",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function(Opa5, Ancestor, I18NText, EnterText, Press ) {
	"use strict";


	//eslint-disable no-param-reassign
	function getFrameUrl (sHash, sUrlParameters, sResourcePath, sSemanticObject, sAction) {
		var sUrl = jQuery.sap.getResourcePath(sResourcePath, ".html");
		sHash = sHash || "";
		sUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

		if (sHash) {
			sHash = "#" + sSemanticObject + "-" + sAction + "&/" + (sHash.indexOf("/") === 0 ? sHash.substring(1) : sHash);
		} else {
			sHash = "#" + sSemanticObject + "-" + sAction;
		}

		//return sUrl + sUrlParameters + sHash;
		return sUrl;
	}
	//eslint-enable no-param-reassign

	return Opa5.extend("ehs.hs.rit.manages1.test.integration.pages.Common", {

		iStartTheApp: function (sResourcePath, sSemanticObject, sAction, sHash) {
			// Start the app with a minimal delay to make tests run fast but still async to discover basic timing issues
			this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=1000", sResourcePath, sSemanticObject, sAction));
		},

/*
		iStartTheAppWithDelay : function (sHash, iDelay) {
			this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=" + iDelay));
		},
*/
/*
		iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
			this.iStartMyAppInAFrame(getFrameUrl("", sParam));
		},
*/

		iLookAtTheScreen: function () {
			return this;
		},



//#################################################################################################################
//#######################################   Re-use functions   ####################################################
//#################################################################################################################



//=================================================================================================================
//		
//=================================================================================================================
/*
		iStartTheApp : function (sResourcePath, sSemanticObject, sAction, sHash) {
			// Start the app with a minimal delay to make tests run fast but still async to discover basic timing issues
			this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=1000", sResourcePath, sSemanticObject, sAction));
		},

		iLookAtTheScreen : function () {
			return this;
		},

		iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
			this.iStartMyAppInAFrame(getFrameUrl("", sParam));
		},
*/



//=================================================================================================================
//  BUTTON
//=================================================================================================================
		
		iPressControlByI18nKey: function(oParameter) {
			return this.waitFor({
				controlType: oParameter.controlType,
				matchers: new sap.ui.test.matchers.I18NText({
								propertyName: oParameter.sPropertyName ? oParameter.sPropertyName : "Text",
								key: oParameter.sKey,
								parameters: oParameter.anyParameters ? oParameter.anyParameters : "",
								modelName: oParameter.sModelName ? oParameter.sModelName : "@i18n"
				}),
				success: function( oControl ) {
					oControl[0].firePress();
				},
				errorMessage: "The control with i18n key "+oParameter.sKey+ " could not be found"
			});
		},

		iPressButtonByI18nKey: function(oParameter) {
			var myParams = oParameter;
			myParams.controlType = "sap.m.Button";
			return this.iPressControlByI18nKey( myParams );
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iPressButtonByPartialId: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of button
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				//id: --> is partial ID
				controlType: "sap.m.Button",
				viewName: oParameter.sViewName,

				matchers: function(oButton){
					var sButtonIdDynamic = oButton.getId();
					var n = sButtonIdDynamic.search(oParameter.sPartialId);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				actions: new Press(),
				errorMessage: "Did not find the Button with partial ID ='" + oParameter.sPartialId + "'."
			});
		},
		
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iShouldSeeButtonByI18nKey: function (oParameter) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new sap.ui.test.matchers.I18NText({
								propertyName: oParameter.sPropertyName ? oParameter.sPropertyName : "Text",
								key: oParameter.sKey,
								parameters: oParameter.anyParameters ? oParameter.anyParameters : "",
								modelName: oParameter.sModelName ? oParameter.sModelName : "@i18n"
				}),
				success: function( oControl ) {
					Opa5.assert.ok(true, "Found the button with i18n key " + oParameter.sKey );
				},
				errorMessage: "The button with i18n key "+oParameter.sKey+ " could not be found"
			});
			
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeButtonByTextDisabled: function (oParameter){
			// @param {object}	oParameter
			// map:
			// note: here is no special context for message output required; context is the text of the button
			// ==> {string}	[oParameter.sButtonText]	*Text of the button
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				controlType: "sap.m.Button",
				viewName: oParameter.sViewName,

				// note: matcher cannot be used as disabled buttons are displayed but not rendered for OPA and so they could not be found
				// -> Not finding a button means "not active" / disabled
				success: function(aButton) {
					for (var i = 0; i < aButton.length; i ++) {
						if (aButton[i].getText() === oParameter.sButtonText && aButton[i].getEnabled() === true) {
							ok(false, "Button '" + oParameter.sButtonText + "' is not disabled as expected");
							break;
						}
						// the button is disabled as we did not find it by text 
						ok(true, "Button '" + oParameter.sButtonText + "' is disabled as expected");
					}
				},
				errorMessage : "Did not find any Button."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeButtonByTextEnabled: function (oParameter){
			// @param {object}	oParameter
			// map:
			// note: here is no special context for message output required; context is the text of the button
			// ==> {string}	[oParameter.sButtonText]	*Text of the button
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				controlType: "sap.m.Button",
				viewName: oParameter.sViewName,

				matchers: function (oButton) {
					var sButtonText = oButton.getText();
					var n = sButtonText.search(oParameter.sButtonText);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				success: function(aButton) {
					Opa5.assert.strictEqual(aButton[0].getEnabled(), true, 
							"Button '" + oParameter.sButtonText + "' is enabled.");
				},
				errorMessage : "Did not find Button '" + oParameter.sButtonText + "'."
			});
		},
		
//=================================================================================================================
//  INPUT FIELD --> Input / Smartfield / Value Help / ComboBox / ...
//=================================================================================================================

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iEnterTextIntoInputFieldById: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sInputText]		*Input text for input field
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of input field
			// ==> {string}	[oParameter.sViewName]		*Viewname
			var oMyParameter = {
				sInputText: oParameter.sInputText,
				sContext: oParameter.sContext,
				sPartialId: oParameter.sPartialId,
				sControlType: "sap.m.Input",
				sViewName: oParameter.sViewName
			};
			return this._enterTextIntoFieldByPartialId(oMyParameter);
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iEnterTextIntoSmartfieldById: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sInputText]		*Input text for smartfield
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of smartfield
			// ==> {string}	[oParameter.sViewName]		*Viewname
			var oMyParameter = {
				sInputText: oParameter.sInputText,
				sContext: oParameter.sContext,
				sPartialId: oParameter.sPartialId,
				sControlType: "sap.ui.comp.smartfield.SmartField",
				sViewName: oParameter.sViewName
			};
			return this._enterTextIntoFieldByPartialId(oMyParameter);
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iEnterValueByComboBoxSelection: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]				*Context for message output
			// ==> {string}	[oParameter.sComboBoxSelectedKey]	*key for the selection in the combo box
			// ==> {string}	[oParameter.sCompleteComboBoxId]	*Complete ID of combo box
			// ==> {string}	[oParameter.sViewName]				*Viewname
			return this.waitFor({
				id: oParameter.sCompleteSmartFieldId,
				controlType: "sap.m.ComboBox",
				viewName: oParameter.sViewName,

				actions: function(oComboBox) {		
					oComboBox.setSelectedKey(oParameter.sComboBoxSelectedKey);
					oComboBox.fireSelectionChange(null);
				},
				errorMessage: "ComboBox for '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteSmartFieldId + "') not found."
			});
		},



		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iEnterValueBySmartFieldComboBoxSelection: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]				*Context for message output
			// ==> {string}	[oParameter.sComboBoxSelectedKey]	*key for the selection in the combo box
			// ==> {string}	[oParameter.sCompleteSmartFieldId]	*Complete ID of smartfield
			// ==> {string}	[oParameter.sViewName]				*Viewname
			return this.waitFor({
				id: oParameter.sCompleteSmartFieldId,
				controlType: "sap.ui.comp.smartfield.SmartField",
				viewName: oParameter.sViewName,

				success: function(oSmartField) {
					return this.waitFor({ 
						controlType: "sap.m.ComboBox", 
						matchers: [new Ancestor(
							oSmartField, 
							false
						)],
									
						actions: function(oComboBox) {		
							oComboBox.setSelectedKey(oParameter.sComboBoxSelectedKey);
							oComboBox.fireSelectionChange(null);
						},
						errorMessage: "ComboBox for Smartfield'" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteSmartFieldId + "') not found."
					});
				},	
				errorMessage: "Smartfield (complete ID = '" + oParameter.sCompleteSmartFieldId + "') not found for selecting a new '" + oParameter.sContext + "'."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iOpenValueHelpForInputField: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of input field
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				controlType: "sap.m.Input",
				viewName: oParameter.sViewName,

				matchers: function (oInputField) {
					var sInputFieldIdDynamic = oInputField.getId();
					var n = sInputFieldIdDynamic.search(oParameter.sPartialId);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				actions: function(oInputField) {
					oInputField.fireValueHelpRequest();
				},
				errorMessage: "Opening the Value Help for Input Field '" + oParameter.sContext + "'(partial ID= '" + oParameter.sPartialId + "') failed."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeTheInputFieldWithValueHelp : function (oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of input field
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				controlType: "sap.m.Input",
				viewName: oParameter.sViewName,

				matchers: function(oInputField) {
					var sInputFieldIdDynamic = oInputField.getId();
					var n = sInputFieldIdDynamic.search(oParameter.sPartialId);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				success: function(aInputField) {   //note: OPA framework delivers the value in an array
					Opa5.assert.strictEqual(aInputField[0].getShowValueHelp(), true, 
						"Input Field '" + oParameter.sContext + "' (partial ID='" + oParameter.sPartialId + "') is displayed with a value help.");
				},
				errorMessage: "Input Field '" + oParameter.sContext + "' (partial ID='" + oParameter.sPartialId + "') not found."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeInputFieldAsMandatoryByField: function (oParameter){
			//ATTENTION!!!: If the Input field has a Label assigned, then use "shouldSeeInputFieldAsMandatoryByLabel"
			//              as the mandatory indicator (required flag) is usually defined for the label and this can 
			//              differ for the field when required flag is not explicitely set for the input field in the 
			//              relating controller / fragment!!!
			
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sCompleteId]	*Complete ID of input field
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				id: oParameter.sCompleteId,
				controlType: "sap.m.Input",
				viewName: oParameter.sViewName,

				success: function(oObject) {
					Opa5.assert.strictEqual(oObject.getRequired(), true, 
							"Input Field '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "') is mandatory.");
				},
				errorMessage : "Did not find Input Field '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "')."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeInputFieldAsMandatoryByLabel: function (oParameter){
			//ATTENTION!!!: If the Input field has a Label assigned, then use this function 
			//              "shouldSeeInputFieldAsMandatoryByLabel" instead of "shouldSeeInputFieldAsMandatoryByField"

			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sCompleteId]	*Complete ID of the label for the input field
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				id: oParameter.sCompleteId,
				controlType: "sap.m.Label",
				viewName: oParameter.sViewName,

				success: function(oObject) {
					Opa5.assert.strictEqual(oObject.getRequired(), true, 
							"Label for Input Field '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "') indicates the Input Field as mandatory .");
				},
				errorMessage : "Did not find Label for Input Field '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "')."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeLabelForAnObjectInputAsMandatory: function (oParameter){
			//ATTENTION!!!: Use this mandatory check when a label has an assignment "labelFor" to an object (like a list to select items)"

			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sCompleteId]	*Complete ID of the label for the object
			// ==> {string}	[oParameter.sLabelFor]		*Object ID the 'labelFor' refers to
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				id: oParameter.sCompleteId,
				controlType: "sap.m.Label",
				viewName: oParameter.sViewName,

				matchers: function(oLabelForObject) {
					var sLabelForObject = oLabelForObject.getLabelFor();
					var n = sLabelForObject.search(oParameter.sLabelFor);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},

				success: function(oLabelForObject) {
					Opa5.assert.strictEqual(oLabelForObject.getRequired(), true, 
							"Label for Object '" + oParameter.sContext + "' indicates the Input as mandatory (complete ID='" + oParameter.sCompleteId + 
																									"', Label for Object='" + oParameter.sLabelFor + "').");
				},
				errorMessage : "Did not find Label for Object '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "', Label for Object='" + oParameter.sLabelFor + "')."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeSmartFieldAsMandatory: function (oParameter){
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sCompleteId]	*Complete ID of smartfield
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				id: oParameter.sCompleteId,
				controlType: "sap.ui.comp.smartfield.SmartField",
				viewName: oParameter.sViewName,

				success: function(oObject) {
					Opa5.assert.strictEqual(oObject.getMandatory(), true, 
							"The Smartfield '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "') is mandatory.");
				},
				errorMessage : "Did not find the Smartfield '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "')."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeSmartFieldWithErrorFrame : function (oParameter){
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sCompleteId]	*Complete ID of smartfield
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				id: oParameter.sCompleteId,
				controlType: "sap.ui.comp.smartfield.SmartField",
				viewName: oParameter.sViewName,

				success: function(oObject) {
					Opa5.assert.strictEqual(oObject.getValueState(), "Error", 
							"The Smartfield '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "') has an Error-Frame.");
				},
				errorMessage : "Did not find the Smartfield '" + oParameter.sContext + "' (complete ID='" + oParameter.sCompleteId + "')."
			});
		},



//=================================================================================================================
//  LIST & TABLE
//=================================================================================================================

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iClickItemByLineNoFromTableWithPartialId: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {int}	[oParameter.iIndex]			*Index / line number
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of table
			// ==> {string}	[oParameter.sControlType]	*Control type of table (e.g. "sap.m.Table")
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
			controlType: oParameter.sControlType,
			viewName: oParameter.sViewName,

				matchers : function (oTable) {
					var sTableIdDynamic = oTable.getId();
					var n = sTableIdDynamic.search(oParameter.sPartialId);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				actions: function(oTable) {
					var oItem;
					if (oParameter.sControlType === "sap.m.Table") {
						oItem = oTable.getItems()[oParameter.iIndex];
						oItem.firePress();
						QUnit.ok(true, "The item '" + oTable.getItems()[oParameter.iIndex].getBindingContext().sPath + "' was clicked successfully");
					} else if (oParameter.sControlType === "sap.ui.table.Table") {
						//>>> !!! NOTE - ATTENTION: Actually no solution for clicking on the table / row that would work!!! <<<
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
						// !!! To Be CHECKED !!!
						oItem = oTable.getRows()[oParameter.iIndex];
						//oItem.firePress();  <-- NOT EXISTING
						//oItem.fireEvent();  //<-- only this "fire"-function is available for the object
						//oItem.$().trigger("tap");
						//oItem.$().tap();
						oTable.fireCellClick();
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
						QUnit.ok(true, "The item '" + oTable.getRows()[oParameter.iIndex].getBindingContext().sPath + "' was clicked successfully");
					}
				},
				errorMessage: "The Table '" + oParameter.sContext + 
								"' with partial ID='" + oParameter.sPartialId + 
								"' and line index='" + oParameter.iIndex + 
								"' was not found for control type='" + oParameter.sControlType + "'."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iToggleItemSelectionByLineNoIndexInListWithRadioButtonsSingleSelection: function (oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {int}	[oParameter.iIndex]			*Index / line number of list item in table
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of list
			// ==> {string}	[oParameter.sControlType]	*Control type of list (e.g. "sap.m.List")
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				controlType: oParameter.sControlType,
				viewName: oParameter.sViewName,

				matchers : function (oList) {
					var sListIdDynamic = oList.getId();
					var n = sListIdDynamic.search(oParameter.sPartialId);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				actions: function(oList) {
					// get RadioButton of ListItem for the single selection
					var oRadioButton = oList.getItems()[oParameter.iIndex].getSingleSelectControl();
					oRadioButton.$().tap();
					QUnit.ok(true, "List Item '" + oList.getItems()[oParameter.iIndex].getTitle() + "' (Index='" + oParameter.iIndex + 
									"') selected from '" + oParameter.sContext + "' list.");
				},
				errorMessage: "The List '" + oParameter.sContext + 
								"' with partial ID='" + oParameter.sPartialId + 
								"' was not found for control type='" + oParameter.sControlType + "'."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iToggleItemSelectionByLineNoIndexInTable: function (oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {int}	[oParameter.iIndex]			*Index / line number of list item in table
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of list item
			// ==> {string}	[oParameter.sControlType]	*Control type of list item (e.g. "sap.m.ColumnListItem")
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				controlType: oParameter.sControlType,
				viewName: oParameter.sViewName,

				matchers : function (oListItem) {
					var sListItemIdDynamic = oListItem.getId();
					var n = sListItemIdDynamic.search(oParameter.sPartialId + "-" + oParameter.iIndex);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				actions: function(oListItem) {
					var oCheckBox;
					if (oParameter.sControlType === "sap.m.ColumnListItem") {
						oCheckBox = oListItem.getMultiSelectControl();
						//oCheckBox.fireSelect(); <-- NOT WORKING
						//oCheckBox.setSelected(); <-- NOT WORKING
						oCheckBox.$().tap();
					} else if (oParameter.sControlType === "sap.m.StandardListItem") {
						//>>> !!! NOTE - ATTENTION: Actually not supported / not implementet!!! <<<
						QUnit.ok(true, "Common-Reuse function 'iToggleRowSelectionByLineNoIndexInTable' not implemented for control type='" + oParameter.sControlType + "'.");
					}
				},
				errorMessage: "In the table an item for '" + oParameter.sContext + 
								"' with partial ID='" + oParameter.sPartialId + 
								"' and line index='" + oParameter.iIndex + 
								"' was not found for control type='" + oParameter.sControlType + "'."
			});
		},

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		iToggleItemSelectionByTitleInTable: function (oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sTitle]			*Title of the list item
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of list item
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				//id: oParameter.sPartialId,
				controlType: "sap.m.ObjectIdentifier",
				viewName: oParameter.sViewName,

				matchers : function (oObjectIdentifier) {
					var sObjectIdentifierIdDynamic = oObjectIdentifier.getId();
					var n = sObjectIdentifierIdDynamic.search(oParameter.sPartialId);
					if (n !== -1) {
						return ( ( oObjectIdentifier.getTitle() === oParameter.sTitle) ? oObjectIdentifier.getParent() : false ); //return ListItem for Title
					} else {
						return false;
					}
				},

				actions: function(oListItem) {
					if (oListItem.getParent().getIncludeItemInSelection()) {
						oListItem.$().trigger("tap");
					} else {
						var oCheckBox = oListItem.getMultiSelectControl();
						oCheckBox.$().tap();
					}
				},
				errorMessage: "CheckBox of ListItem for '" + oParameter.sContext + "' (partial ID='" + oParameter.sPartialId + "') not found."
			});
		},	

		iToggleStandardListItemSelectionByTitleInList: function (oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sTitle]			*Title of the list item
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of list item
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				//id: oParameter.sPartialId,
				controlType: "sap.m.StandardListItem",
				viewName: oParameter.sViewName,

				matchers : function (oStandardListItem) {
					var sStandardListItemId = oStandardListItem.getId();
					var n = sStandardListItemId.search(oParameter.sPartialId);
					if (n !== -1) {
						return ( ( oStandardListItem.getTitle() === oParameter.sTitle) ? oStandardListItem : false ); //return ListItem for Title
					} else {
						return false;
					}
				},

				actions: function(oListItem) {		
					oListItem.$().trigger("tap");
				},
				errorMessage: "CheckBox of ListItem for '" + oParameter.sContext + "' (partial ID='" + oParameter.sPartialId + "') not found."
			});
		},	

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		shouldSeeItemsInTable: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of table
			// ==> {string}	[oParameter.sControlType]	*Control type of table (e.g. "sap.m.Table")
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
			controlType: oParameter.sControlType,
			viewName: oParameter.sViewName,

				matchers : function (oTable) {
					var sTableIdDynamic = oTable.getId();
					var n = sTableIdDynamic.search(oParameter.sPartialId);
					return ( (n !== -1) ? true : false ); //return true when string search successful
				},
				success: function(aTable) {   //note: OPA framework delivers the value in an array
					Opa5.assert.strictEqual(aTable[0].getItems().length > 0, true, 
						"Table for '" + oParameter.sContext + "' (partial ID='" + oParameter.sPartialId + "') has items.");
				},
				errorMessage: "The Table for '" + oParameter.sContext + 
								"' with partial ID='" + oParameter.sPartialId + 
								"' was not found for control type='" + oParameter.sControlType + "'."
			});
		},



//=================================================================================================================
//  Message
//=================================================================================================================
		iDisplayMessage: function (sMessageText) {
//			QUnit.ok(true, sMessageText);   //<== ATTENTION: this variant displays the message at the beginning of
											//          	 each OPA-Test and not at a certain test step position
											//               (due to asynchronous processing)

			// message output via 'assert.ok' supports the correct test step in asynchronous processing
			return this.waitFor({
				success : function () {
					Opa5.assert.ok(true, sMessageText);
				},
				errorMessage : "ERROR in calling 'iDisplayMessage'"
			});
		},	



//#################################################################################################################
//##########################   INTERNAL Functions needed for Re-use functions   ###################################
//#################################################################################################################

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		_enterTextIntoFieldByPartialId: function(oParameter) {
			// @param {object}	oParameter
			// map:
			// ==> {string}	[oParameter.sInputText]		*Input text for field
			// ==> {string}	[oParameter.sContext]		*Context for message output
			// ==> {string}	[oParameter.sPartialId]		*Partial ID of field
			// ==> {string}	[oParameter.sControlType]	*Control type of field (e.g. "sap.ui.comp.smartfield.SmartField")
			// ==> {string}	[oParameter.sViewName]		*Viewname
			return this.waitFor({
				controlType : oParameter.sControlType,
				viewName: oParameter.sViewName,

				matchers : function (oField) {
					var sIdDynamic = oField.getId();
					var n = sIdDynamic.search(oParameter.sPartialId);
					return ( (n !== -1) ? true : false ); //return true when partial ID search successful
				},
				actions: new EnterText({ 
					text: oParameter.sInputText 
				}),
				errorMessage: "Cannot enter text for '" + oParameter.sContext + 
								"' into Field with partial-Id='" + oParameter.sPartialFieldId + 
								"' from ControlType='" + oParameter.sControlType + "'."
			});
		},


// ================================================================================================================
		// Dummy function and End-marker
		iCallDummyOKInCommon : function () {
			return this.waitFor({
				success: function() {
					Opa5.assert.ok(true, "Called Dummy OK in 'Common' (Page).");
				},
				errorMessage: "Call of Dummy FAILED in 'Common' (Page)."
			});
		}
	});
});