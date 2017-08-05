sap.ui.define([], function() {
	"use strict";

	return {
		SearchProject_init: function (selectButton){
			selectButton.getCustomData()[0].getValue();
			
		},
		SearchProject_OnProjectFilterchange: function (){
			
		},
		SearchProject_OnProjectSelected: function (oEvent,selectButton){
			var contextPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			oEvent.getSource().getParent().getCustomData()[0].setValue(contextPath);
			selectButton.getCustomData()[0].setValue(contextPath);
			
		},
		SearchProject_OnFavoriteChange: function (){
			
		}
		
	};

});