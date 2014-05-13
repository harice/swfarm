define([
	'backbone',
	'views/product/ProductAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'text!templates/layout/contentTemplate.html',
	'text!templates/product/productAddTemplate.html',
	'models/product/ProductModel',
	'global',
	'constant',
], function(Backbone, ProductAddView, Validate, TextFormatter, contentTemplate, productAddTemplate, ProductModel, Global, Const){

	var ProductEditView = ProductAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			this.productId = option.id;
			this.h1Title = 'Product';
			this.h1Small = 'edit';
			
			this.model = new ProductModel({id:option.id});
			this.model.on("change", function() {
				if(this.hasChanged('name')) {
					thisObj.displayForm();
					thisObj.supplyProductData();
					this.off("change");
				}
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyProductData: function () {
			this.$el.find('#name').val(this.model.get('name'));
			this.$el.find('#description').val(this.model.get('description'));
		},
	});

  return ProductEditView;
  
});