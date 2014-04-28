define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/product/productViewTemplate.html',
	'models/product/ProductModel',
	'global',
	'constant',
], function(Backbone, contentTemplate, productViewTemplate, ProductModel, Global, Const){

	var ProductView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new ProductModel({id:option.id});
			this.model.on("change", function() {
				console.log('onChange: ProductModel');
				if(this.hasChanged('name')) {
					thisObj.displayProduct(this);
					this.off("change");
				}
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayProduct: function (productModel) {
			var innerTemplateVariables = {
				product:productModel,
				product_url:'#/'+Const.URL.PRODUCT,
				product_edit_url:'#/'+Const.URL.PRODUCT+'/'+Const.CRUD.EDIT,
			}
			var innerTemplate = _.template(productViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: productModel.get('name'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		events: {
			'click #delete' : 'removeProduct',
		},
		
		removeProduct: function (){
			var thisObj = this;
			
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    Global.getGlobalVars().app_router.navigate(Const.URL.PRODUCT, {trigger: true});
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},
		
	});

  return ProductView;
  
});