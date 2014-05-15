define([
	'backbone',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'text!templates/layout/contentTemplate.html',
	'text!templates/product/productAddTemplate.html',
	'models/product/ProductModel',
	'global',
	'constant',
], function(Backbone, AppView, Validate, TextFormatter, contentTemplate, productAddTemplate, ProductModel, Global, Const){

	var ProductAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.productId = null;
			this.h1Title = 'Product';
			this.h1Small = 'add';
		},
		
		render: function(){
            this.displayForm();
		},
		
		displayForm: function(){
			var thisObj = this;
            var innerTemplateVariables = {
				'product_url' : '#/'+Const.URL.PRODUCT
			};
			
			if(this.productId != null)
				innerTemplateVariables['product_id'] = this.productId;
			
			var innerTemplate = _.template(productAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			
			this.initValidateForm();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#addProductForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var productModel = new ProductModel(data);
					productModel.save(
                        null,
                        {
							success: function (model, response, options) {
                                console.log(response);
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.PRODUCT, {trigger: true});
								Backbone.history.history.back();
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
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

  return ProductAddView;
  
});