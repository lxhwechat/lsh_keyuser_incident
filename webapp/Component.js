jQuery.sap.declare("zwx.sm.itsm.keyuserincidents.Component");
sap.ui.getCore().loadLibrary("sap.ui.generic.app");
jQuery.sap.require("sap.ui.generic.app.AppComponent");

sap.ui.generic.app.AppComponent.extend("zwx.sm.itsm.keyuserincidents.Component", {
	metadata: {
		"manifest": "json"
	},

	init: function() {

		sap.ui.generic.app.AppComponent.prototype.init.apply(this, arguments);

		var that = this;
		this.getModel().callFunction('/validateProcessor', {
			success: function(data) {
				if (!data.validateProcessor.valid) {
					that._showErrorMessageBox("CONTACT_ADMIN_AND_CLOSE", "NOT_PROCESSOR", that._onNotProcessor);
				}
			},
			error: function() {
				console.error(arguments);
			}
		});

	},

	_showErrorMessageBox: function(message, messageTitle, fnClose) {

		var errorMessage, errorMessageTitle;
		var resourceBundle = this.getModel("i18n").getResourceBundle();
		errorMessage = resourceBundle.getText(message);
		errorMessageTitle = resourceBundle.getText(messageTitle);

		sap.m.MessageBox.show(errorMessage, {
			icon: sap.m.MessageBox.Icon.ERROR,
			title: errorMessageTitle,
			actions: resourceBundle.getText("CLOSE_POPUP"),
			onClose: fnClose,
			initialFocus: null
		});
	},

	_onNotProcessor: function() {
		history.back();
  	// window.close();
	},

});
