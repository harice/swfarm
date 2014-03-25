define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'text!templates/layout/contentTemplate.html',
	'text!templates/product/productAddTemplate.html',
	'models/product/ProductModel',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, contentTemplate, productAddTemplate, ProductModel, Global, Const){

	var ProductEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new ProductModel({id:option.id});
			this.model.on("change", function() {
				if(this.hasChanged('name')) {
					thisObj.displayProduct(this);
					this.off("change");
				}
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayProduct: function(productModel) {
			var thisObj = this;
			
			var innerTemplateVariables = {
				product_id: productModel.get('id'),
				'product_url' : '#/'+Const.URL.PRODUCT,
			};
			var innerTemplate = _.template(productAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Edit Product",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			
			this.$el.find('#name').val(productModel.get('name'));
			this.$el.find('#description').val(productModel.get('description'));
			
			var validate = $('#addProductForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var productModel = new ProductModel(data);
					productModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.PRODUCT, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: productModel.getAuth(),
						}
					);
				}
			});
		},
	});

  return ProductEditView;
  
});