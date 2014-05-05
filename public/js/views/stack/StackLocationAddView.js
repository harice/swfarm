define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/stack/StackLocationModel',
	'collections/product/ProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stack/stackLocationAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			StackLocationModel,
			ProductCollection,
			contentTemplate,
			stackLocationAddTemplate,
			Global,
			Const
){

	var StackLocationAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			this.slId = null;
			this.h1Title = 'Stack Location';
			this.h1Small = 'add';
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				thisObj.displayForm();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.productCollection.getAllModel();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'sl_url' : '#/'+Const.URL.STACKLOCATION,
			};
			
			if(this.slId != null)
				innerTemplateVariables['sl_id'] = this.slId;
			
			var innerTemplate = _.template(stackLocationAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.generateProduct();
			this.focusOnFirstField();
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.initValidateForm();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#soForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					var stackLocationModel = new StackLocationModel(data);
					
					stackLocationModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.STACKLOCATION, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: stackLocationModel.getAuth(),
						}
					);
				},
			});
		},
		
		generateProduct: function () {
			var options = '';
			_.each(this.productCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			this.$el.find('#product_id').html(options);
		},
	});

	return StackLocationAddView;
  
});