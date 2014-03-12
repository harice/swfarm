define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/product/productAddTemplate.html',
	'models/product/ProductModel',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, productAddTemplate, ProductModel, Global, Const){

	var ProductAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			//console.log('ProductAdd.js:init');
		},
		
		render: function(){
			var innerTemplateVariables = {
				'product_url' : '#/'+Const.URL.PRODUCT
			};
			var innerTemplate = _.template(productAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Product",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#addProductForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					console.log(data);
					var productModel = new ProductModel(data);
					productModel.save(null, {success: function (model, response, options) {
						Global.getGlobalVars().app_router.navigate(Const.URL.PRODUCT, {trigger: true});
					}, error: function (model, response, options) {
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					},
					headers: productModel.getAuth(),});
				}
			});
		},
		
	});

  return ProductAddView;
  
});