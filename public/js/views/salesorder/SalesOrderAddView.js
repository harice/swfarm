define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderAddTemplate.html',
	'text!templates/salesorder/salesOrderProductItemTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			OriginCollection,
			NatureOfSaleCollection,
			contentTemplate,
			salesOrderAddTemplate,
			productItemTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			Global,
			Const
){

	var SalesOrderAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			productFieldClone: null,
			customerAutoCompleteView: null,
		},
		
		initialize: function() {
			var thisObj = this;
		
			this.originCollection = new OriginCollection();
			this.originCollection.on('sync', function() {	
				thisObj.natureOfSaleCollection.getModels();
				this.off('sync');
			});
			this.originCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.natureOfSaleCollection = new NatureOfSaleCollection();
			this.natureOfSaleCollection.on('sync', function() {
				thisObj.displayForm();
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.originCollection.getModels();
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
			this.generateOrigin();
			this.generateNatureOfSale();
			this.initCustomerAutocomplete();
		},
		
		generateOrigin: function () {
			var originTemplate = _.template(salesOrderOriginTemplate, {'origins': this.originCollection.models});
			this.$el.find('#so-origin').html(originTemplate);
			this.$el.find('#so-origin .radio-inline:first-child input[type="radio"]').attr('checked', true);
		},
		
		generateNatureOfSale: function () {
			var NOSTemplate = _.template(salesOrderNatureOfSaleTemplate, {'natureOfSales': this.natureOfSaleCollection.models});
			this.$el.find('#so-nos').html(NOSTemplate);
			this.$el.find('#so-nos .radio-inline:first-child input[type="radio"]').attr('checked', true);
		},
		
		initCustomerAutocomplete: function () {
			if(this.customerAutoCompleteView != null)
				this.customerAutoCompleteView.deAlloc();
			
			var accountCustomerCollection = new AccountCustomerCollection();
			this.customerAutoCompleteView = new CustomAutoCompleteView({
                input: $('#customer'),
				hidden: $('#customer-id'),
                collection: accountCustomerCollection,
            });
			
			this.customerAutoCompleteView.render();
		},
		
		addProduct: function () {
			
			if(this.options.productFieldClone == null) {
				var ProductTemplate = _.template(productItemTemplate, {});
				
				this.$el.find('#product-list tbody').append(ProductTemplate);
				var ProductItem = this.$el.find('#product-list tbody').find('.product-item:first-child');
				this.options.productFieldClone = ProductItem.clone();
				//this.initProductAutocomplete(ProductItem);
				//this.addIndexToProductFields(ProductItem);
			}
			else {
				var clone = this.options.productFieldClone.clone();
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