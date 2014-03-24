define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'text!templates/layout/contentTemplate.html',
	'text!templates/product/productAddTemplate.html',
	'models/product/ProductModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, contentTemplate, productAddTemplate, ProductModel, NotificationView, Global, Const){

	var ProductAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			//console.log('ProductAdd.js:init');
		},
		
		render: function(){
			// var thisObj = this;
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
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			
			var validate = $('#addProductForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var productModel = new ProductModel(data);
					productModel.save(
                        null,
                        {
                        success:
                            function (model, response, options) {
                                // Display message
                                // thisObj.displayMessage('Added new product. ', 'success');
                                var message = new NotificationView({ type: 'success', text: 'Product has been created.' });
                                Global.getGlobalVars().app_router.navigate(Const.URL.PRODUCT, {trigger: true});
                            },
                        error:
                            function (model, response, options) {
                                var message = new NotificationView({ type: 'error', text: 'Sorry! An error occurred in the process.' });
                                if(typeof response.responseJSON.error == 'undefined')
                                    validate.showErrors(response.responseJSON);
                                else
                                    // Display message
                                    // thisObj.displayMessage('Failed adding new product. ', 'error');
                                    var message = new NotificationView({ type: 'error' });
                            },
                        headers: productModel.getAuth(),
                        }
                    );
				}
			});
		},
		
	});

  return ProductAddView;
  
});