define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderAddTemplate.html',
	'text!templates/salesorder/salesOrderProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			contentTemplate,
			salesOrderAddTemplate,
			productItemTemplate,
			Global,
			Const
){

	var SalesOrderAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			ProductFieldClone: null,
		},
		
		initialize: function() {
			
		},
		
		render: function(){
			this.displayForm();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'so_url' : '#/'+Const.URL.SO,
			};
			var innerTemplate = _.template(salesOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Sales Order",
				h1_small: "add",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.addProduct();
		},
		
		addProduct: function () {
			
			if(this.options.ProductFieldClone == null) {
				var ProductTemplate = _.template(productItemTemplate, {});
				
				this.$el.find('#product-list tbody').append(ProductTemplate);
				var ProductItem = this.$el.find('#product-list tbody').find('.product-item:first-child');
				this.options.ProductFieldClone = ProductItem.clone();
				//this.initProductAutocomplete(ProductItem);
				//this.addIndexToProductFields(ProductItem);
			}
			else {
				var clone = this.options.ProductFieldClone.clone();
				//this.initProductAutocomplete(clone);
				//this.addIndexToProductFields(clone);
				this.$el.find('#product-list tbody').append(clone);
			}
				
			//this.addValidationToProduct();
		},
		
		events: {
			'click #add-so-product': 'addProduct',
			'click .remove-product': 'removeProduct',
		},
		
		removeProduct: function (ev) {
			$(ev.target).closest('tr').remove();
			
			if(!this.hasProduct())
				this.addProduct();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
	});

  return SalesOrderAddView;
  
});