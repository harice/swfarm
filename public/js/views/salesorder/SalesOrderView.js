define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/salesorder/SalesOrderAddView',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/product/ProductCollection',
	'models/salesorder/SalesOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderViewTemplate.html',
	'text!templates/salesorder/salesOrderViewProductItemTemplate.html',
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
			SalesOrderAddView,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			OriginCollection,
			NatureOfSaleCollection,
			ProductCollection,
			SalesOrderModel,
			contentTemplate,
			salesOrderViewTemplate,
			productItemTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			Global,
			Const
){

	var SalesOrderView = SalesOrderAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		customerAutoCompleteView: null,
		
		initialize: function(option) {
			var thisObj = this;
			
			this.soId = option.id;
			
			this.model = new SalesOrderModel({id:this.soId});
			this.model.on('change', function() {
				thisObj.displayForm();
				thisObj.supplySOData();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'so_url' : '#/'+Const.URL.SO,
				'so_edit_url' : '#/'+Const.URL.SO+'/'+Const.CRUD.EDIT+'/'+this.soId,
			};
			
			var innerTemplate = _.template(salesOrderViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: 'Sales Order',
				h1_small: '',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		supplySOData: function () {
			var thisObj = this;
			
			var customer = this.model.get('customer');
			var address = [this.model.get('address')];
			var products = this.model.get('products');
			
			this.$el.find('#sonumber').val(this.model.get('so_number'));
			this.$el.find('#status').val(this.model.get('status'));
			this.$el.find('#origin').val(this.model.get('origin').origin);
			this.$el.find('#nos').val(this.model.get('nature_of_sale').nature_of_sale);
			this.$el.find('#customer').val(customer.name);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states[0].state);
			this.$el.find('#city').val(address[0].address_city[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofsale').val(this.model.get('date_of_sale').split(' ')[0]);
			this.$el.find('#delivery_date_start').val(this.model.get('delivery_date_start').split(' ')[0]);
			this.$el.find('#delivery_date_end').val(this.model.get('delivery_date_end').split(' ')[0]);
			this.$el.find('#notes').val(this.model.get('notes'));
			
			/*var i= 0;
			_.each(products, function (product) {
				var productFields = (i > 0)? thisObj.addProduct(): thisObj.$el.find('#product-list tbody .product-item:first-child');
				i++;
				
				productFields.find('.id').val(product.id);
				productFields.find('.productname').val(product.product.name);
				productFields.find('.product_id').val(product.product.id);
				productFields.find('.description').val(product.description);
				productFields.find('.stacknumber').val(product.stacknumber);
				productFields.find('.unitprice').val(product.unitprice);
				productFields.find('.tons').val(product.tons);
				productFields.find('.bales').val(product.bales);
				productFields.find('.unitprice').blur();
				
				var variables = {
					h1_title: 'Sales Order',
					h1_small: '',
					sub_content_template: innerTemplate,
				};
				var template = _.template(productItemTemplate, variables);
				this.$el.find('#product-list tbody').append(template);
			});*/
		},
	});

  return SalesOrderView;
  
});