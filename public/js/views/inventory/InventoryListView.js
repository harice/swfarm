define([
	'backbone',
	'views/base/ListView',
	'models/inventory/InventoryModel',
	'collections/inventory/InventoryCollection',
	'collections/product/ProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/inventory/inventoryListTemplate.html',
	'text!templates/inventory/inventoryInnerListTemplate.html',
	'text!templates/inventory/productFilterTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			InventoryModel,
			InventoryCollection,
			ProductCollection,
			contentTemplate,
			inventoryListTemplate,
			inventoryInnerListTemplate,
			productFilterTemplate,
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
			
			this.collection = new InventoryCollection();
			this.collection.listView.searchURLForFilter = false;
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				thisObj.displayInventory();
				thisObj.renderList(thisObj.collection.listView.currentPage);
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.productCollection.getAllModel();
			Backbone.View.prototype.refreshTitle(this.h1Title,this.h1Small);
		},
		
		displayInventory: function () {
			var productTemplate = _.template(productFilterTemplate, {'products': this.productCollection.models});
			var innerTemplateVar = {
				'inventory_add_url' : '#/'+Const.URL.INVENTORY+'/'+Const.CRUD.ADD,
				'product_filters' : productTemplate,
			};
			var innerTemplate = _.template(inventoryListTemplate, innerTemplateVar);
			
			var variables = {
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.setListOptions();
		},
		
		displayList: function () {
			
			var data = {
				stacknumber_url: '#/'+Const.URL.STACKNUMBER,
				inventory: this.collection.models,
				_: _ 
			};
			
			_.extend(data,Backbone.View.prototype.helpers);
			
			var innerListTemplate = _.template(inventoryInnerListTemplate, data);
			this.subContainer.find("#inventory-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		setListOptions: function () {
			var options = this.collection.listView;
			//console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);
				
			if(options.filters.productId != '')
				this.$el.find('[name="product_id"][value="'+options.filters.productId+'"]').attr('checked', true);
		},
		
		events: {
			'change .product_id' : 'filterByProduct',
		},
		
		filterByProduct: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('productId', filter)
			this.renderList(1);
			return false;
		},
	});

	return InventoryListView;
  
});