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
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new ProductCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayProduct();
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Products','list');
		},
		
		displayProduct: function () {
			var innerTemplate = _.template(productListTemplate, {'product_add_url' : '#/'+Const.URL.PRODUCT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Products",
				h1_small: "list",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this product?',
										'confirm-delete-product',
										'Delete',
										'Delete Product');

			this.setListOptions();
		},
		
		displayList: function () {
			var data = {
				product_url: '#/'+Const.URL.PRODUCT,
				product_edit_url: '#/'+Const.URL.PRODUCT+'/'+Const.CRUD.EDIT,
				products: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( productInnerListTemplate, data );
			this.subContainer.find("#product-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},

		setListOptions: function () {
			var options = this.collection.listView;
			//console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);
			
		},
		
		events: {
			'click .sort-name' : 'sortName',
			'change .checkall' : 'checkAll',
			'click .delete-product': 'preShowConfirmationWindow',
			'click #confirm-delete-product': 'deleteProduct',
		},		
        
        checkAll: function () {
			if($('.checkall').is(':checked')) {
				$('.productids').prop('checked',true);
			} else {
				$('.productids').prop('checked',false);
			}
		},

		sortName: function () {
			this.sortByField('name');
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-product').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteProduct: function (ev) {
			var thisObj = this;
			var productModel = new ProductModel({id:$(ev.currentTarget).attr('data-id')});
			
            productModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(thisObj.collection.listView.currentPage);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: productModel.getAuth(),
            });
		},
	});

  return ProductListView;
  
});