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
			
			if(this.model.get('status').name.toLowerCase() == 'open')
				innerTemplateVariables['editable'] = true;
			
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
			
			var account = this.model.get('account');
			var address = [this.model.get('orderaddress')];
			var products = this.model.get('productorder');
			
			this.$el.find('#sonumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
			this.$el.find('#origin').val(this.model.get('location').location);
			this.$el.find('#nos').val(this.model.get('natureofsale').name);
			this.$el.find('#account').val(account.name);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states[0].state);
			this.$el.find('#city').val(address[0].address_city[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofsales').val(this.convertDateFormat(this.model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
			this.$el.find('#transportdatestart').val(this.convertDateFormat(this.model.get('transportdatestart').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
			this.$el.find('#transportdateend').val(this.convertDateFormat(this.model.get('transportdateend').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
			this.$el.find('#notes').val(this.model.get('notes'));
			
			_.each(products, function (product) {
				var unitprice = (!isNaN(product.unitprice))? product.unitprice : 0;
				var tons = (!isNaN(product.tons))? product.tons : 0;
				var totalprice = parseFloat(unitprice * tons).toFixed(2);
				
				var variables = {
					productname: product.product.name,
					description: product.description,
					stacknumber: product.stacknumber,
					unitprice: parseFloat(unitprice).toFixed(2),
					tons: parseFloat(tons).toFixed(2),
					bales: product.bales,
					totalprice: totalprice,
				};
				
				var template = _.template(productItemTemplate, variables);
				thisObj.$el.find('#product-list tbody').append(template);
			});
		},
	});

  return SalesOrderView;
  
});