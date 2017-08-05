sap.ui.define([], function() {
	"use strict";

	return {
		SearchProject_init: function(controler, container, selectButton, hideElemnt, visibleElement) {

			var fragment = sap.ui.xmlfragment(controler.getView().getId(), "com.vinci.timesheet.admin.view.SearchProject", controler);
			controler._setProjectSearchFragment(fragment.getId());
			//	fragment.getCustomData()[1].setValue(returnRef.getId()); 

			var hideContainer = container.getItems()[0];
			hideContainer.setVisible(false);
			container.addItem(fragment);

			selectButton.getCustomData()[0].setValue("");

			// Hide Element from previous screen
			for (var k = 0; k < hideElemnt.length; k++) {
				hideElemnt[k].setVisible(false);
			}

			// Visible Element from Project Search
			for (var l = 0; l < hideElemnt.length; l++) {
				visibleElement[l].setVisible(true);
			}

		},
		SearchProject_destroy: function(fragmentObject, hideElemnt, visibleElement) {
			//var currentProjectContext = fragment.getCustomData()[0].getValue("");
			var container = fragmentObject.getParent();
			var hideContainer = container.getItems()[0];
			hideContainer.setVisible(true);
			fragmentObject.destroy(true);
			// Hide Element from previous screen
			for (var k = 0; k < hideElemnt.length; k++) {
				hideElemnt[k].setVisible(false);
			}

			// Visible Element from Project Search
			for (var l = 0; l < hideElemnt.length; l++) {
				visibleElement[l].setVisible(true);
			}

		},
		SearchProject_getProjectContext: function(fragmentObject) {
			return fragmentObject.getCustomData()[0].getValue();
		},
		SearchProject_OnProjectFilterchange: function() {

		},
		SearchProject_OnProjectSelected: function(oEvent, selectButton) {
			var contextPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			oEvent.getSource().getParent().getCustomData()[0].setValue(contextPath);
			selectButton.getCustomData()[0].setValue(contextPath);

		},
		SearchProject_OnFavoriteChange: function(oEvent, model) {
			var icon = oEvent.getSource();
			var currentState = model.getProperty(icon.getBindingContext().getPath() + '/Favorite');
			if (currentState) // to become unfav
			{
				model.setProperty(icon.getBindingContext().getPath() + '/Favorite', false);
				model.update(icon.getBindingContext().getPath(), {
					Favorite: false
				});

			} else // to become Fav
			{
				model.setProperty(icon.getBindingContext().getPath() + '/Favorite', true);
				model.update(icon.getBindingContext().getPath(), {
					Favorite: true
				});
			}
		},
		SearchProject_onProjectSearchFinished: function(oEvent, projectModel, resourceModel) {
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = resourceModel.getText("projectSearchHeaderCount", [iTotalItems]);
			} else {
				sTitle = resourceModel.getText("projectSearchHeader");
			}
			projectModel.setProperty("/worklistTableTitle", sTitle);
		},
		SelectProject_afterSelection: function(projectContext) {
			this.selectProjectcontext[0].bindElement(projectContext); // Label
			this.selectProjectcontext[0].setVisible(true);           // Label
			this.selectProjectcontext[1].setVisible(false);         // ownIntialButton
			this.selectProjectcontext[2].setVisible(true);        // ownRefreshButton
		},
		SelectProject_OnProjectSearch: function(oEvent, controler, container, selectButton, hideElemnt, visibleElement) {

			var ownHBox = oEvent.getSource().getParent();
			this.selectProjectcontext = ownHBox.getItems();
			this.SearchProject_init(controler, container, selectButton, hideElemnt, visibleElement);
		},
		SelectProject_OnProjectRefresh: function(oEvent, controler, container, selectButton, hideElemnt, visibleElement) {
			this.SearchProject_init(controler, container, selectButton, hideElemnt, visibleElement);
		}
		
		

	};

});