define([
	'backbone',
	'views/base/ListView',
	'models/trucker/TruckerModel',
	'collections/trailer/TrailerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/inventory/inventoryListTemplate.html',
	'text!templates/inventory/inventoryInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			TruckerModel,
			TrailerCollection,
			contentTemplate,
			inventoryListTemplate,
			inventoryInnerListTemplate,
			Const
){

	var InventoryListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			this.h1Title = 'Inventory';
			this.h1Small = 'list';
			
			this.collection = new TrailerCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayInventory();
			this.renderList(1);
			Backbone.View.prototype.refreshTitle(this.h1Title,this.h1Small);
		},
		
		displayInventory: function () {
			var innerTemplateVar = {
				'inventory_add_url' : '#/'+Const.URL.INVENTORY+'/'+Const.CRUD.ADD,
			};
			var innerTemplate = _.template(inventoryListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Trailer',
				h1_small: 'list',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this Trucker?',
										'confirm-delete-trucker',
										'Delete',
										'Delete Trucker');
		},
		
		displayList: function () {
			
			var data = {
				inventory_edit_url: '#/'+Const.URL.INVENTORY+'/'+Const.CRUD.EDIT,
				inventory: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(inventoryInnerListTemplate, data);
			this.subContainer.find("#inventory-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .delete-trucker': 'preShowConfirmationWindow',
			'click #confirm-delete-trucker': 'deleteTrucker'
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-trucker').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteTrucker: function (ev) {
			var thisObj = this;
			var truckerModel = new TruckerModel({id:$(ev.currentTarget).attr('data-id')});
			
            truckerModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: truckerModel.getAuth(),
            });
		},
	});

	return InventoryListView;
  
});