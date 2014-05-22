define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'collections/product/ProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/weightInfoAddTemplate.html',
	'text!templates/purchaseorder/weightInfoProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			ProductCollection,
			contentTemplate,
			weightInfoAddTemplate,
			weightInfoProductItemTemplate,
			Global,
			Const
){

	var WeightInfoAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.h1Title = 'Weight Info';
			this.h1Small = 'add';
			
			this.options = {
				routeType: ['pickup', 'dropoff'],
				productFieldClassRequired: ['bales', 'pounds'],
				separator: '-',
			};
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.productCollection.getScheduleProducts(this.schedId);
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
			};
			
			var innerTemplate = _.template(weightInfoAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initValidateForm();
			this.addProducts();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#poWeightInfoFrom').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					//var data = thisObj.formatFormField($(form).serializeObject());
					console.log(data);
				},
			});
		},
		
		addProducts: function () {
			var thisObj = this;
			
			_.each(this.options.routeType, function (type) {
				var ctr = 0;
				_.each(thisObj.productCollection.models, function (model) {
					var templateVariables = {
						id: model.get('transportschedule_id'),
						stock_number: model.get('productorder').stacknumber,
						name: model.get('productorder').product.name,
						net: '0.00',
						route_type: type+thisObj.options.separator,
						number: '.'+ctr++,
					};
					var productItemTemplate = _.template(weightInfoProductItemTemplate, templateVariables);
					thisObj.$el.find('#'+type+'-product-list tbody').append(productItemTemplate);
				});
			});
			
			this.addValidationToProduct();
		},
		
		addValidationToProduct: function () {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				this.$el.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

	return WeightInfoAddView;
});