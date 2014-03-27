define([
	'backbone',
	'views/base/ListView',
	'models/product/ProductModel',
	'collections/product/ProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/product/productListTemplate.html',
	'text!templates/product/productInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, ProductModel, ProductCollection, contentTemplate, productListTemplate, productInnerListTemplate, Const){

	var ProductListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
		
			var thisObj = this;
			
			this.collection = new ProductCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayProduct();
			this.renderList(1);
		},
		
		displayProduct: function () {
			var innerTemplate = _.template(productListTemplate, {'product_add_url' : '#/'+Const.URL.PRODUCT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Products",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function () {
			var data = {
				product_url: '#/'+Const.URL.PRODUCT,
				product_edit_url: '#/'+Const.URL.PRODUCT+'/'+Const.CRUD.EDIT,
				products: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( productInnerListTemplate, data );
			$("#product-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .sort-name' : 'sortName',
		},
            
		sortName: function () {
			this.sortByField('name');
		},
	});

  return ProductListView;
  
});