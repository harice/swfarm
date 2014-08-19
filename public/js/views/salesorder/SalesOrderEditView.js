define([
	'backbone',
	'bootstrapdatepicker',
	'views/salesorder/SalesOrderAddView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/product/ProductCollection',
	'collections/contact/ContactCollection',
    'collections/contract/ContractByAccountCollection',
	'models/salesorder/SalesOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderAddTemplate.html',
	'text!templates/salesorder/salesOrderProductItemTemplate.html',
	'text!templates/salesorder/salesOrderSubProductItemTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'text!templates/salesorder/salesOrderContractTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			SalesOrderAddView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			NatureOfSaleCollection,
			ProductCollection,
			ContactCollection,
            ContractByAccountCollection,
			SalesOrderModel,
			contentTemplate,
			salesOrderAddTemplate,
			productItemTemplate,
			productSubItemTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			contractTemplate,
			Global,
			Const
){

	var SalesOrderEditView = SalesOrderAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		customerAutoCompleteView: null,
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.soId = option.id;
			this.h1Title = 'Sales Order';
			this.h1Small = 'edit';
			this.isInitProcess = true;
			this.soProducts = [];
			this.soProductsIndex = 0;
			this.inits();
			
			this.model = new SalesOrderModel({id:this.soId});
			this.model.on('change', function() {
				if(this.get('verified') == 1)
					thisObj.verified = true;
				
				_.each(this.get('productsummary'), function (product) {
					thisObj.soProducts.push(product.productname.id);
				});
				
				thisObj.contractByAccountCollection.getContractByAccount(this.get('account').id);
				
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Sales Order','edit');
		},
		
		supplySOData: function () {
			var thisObj = this;
			
			var account = this.model.get('account');
			var address = [this.model.get('orderaddress')];
			var products = this.model.get('productsummary');
			var nos = this.model.get('natureofsale').id;
			
			this.$el.find('#sonumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
			
			if(this.isFromPODropship())
				this.showOnlyReservation();
			else
				this.$el.find('[name="natureofsale_id"][value="'+nos+'"]').attr('checked', true);
			
			this.customerAutoCompleteView.autoCompleteResult = [{name:account.name, id:account.id, address:address}];
			this.$el.find('#account').val(account.name);
			this.$el.find('#account_id').val(account.id);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states.state);
			this.$el.find('#city').val(address[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			
			this.currentCustomerId = account.id;
			this.customerAccountContactId = this.model.get('contact_id');
			this.showFieldThrobber('#contact_id');
			this.customerAccountCollection.getContactsByAccountId(account.id);
			
			this.$el.find('#dateofsale').val(this.convertDateFormat(this.model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
            
			this.generateContract();
			if(this.model.get('contract') && typeof this.model.get('contract').id != 'undefined')
				this.$el.find('#contract_id').val(this.model.get('contract').id);
			this.toggleContract(nos);
			
			this.$el.find('#notes').val(this.model.get('notes'));
			
			var startDate = this.convertDateFormat(this.model.get('transportdatestart').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
			var endDate = this.convertDateFormat(this.model.get('transportdateend').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
			this.$el.find('#start-date .input-group.date').datepicker('update', startDate);
			this.$el.find('#start-date .input-group.date').datepicker('setEndDate', endDate);
			this.$el.find('#end-date .input-group.date').datepicker('update', endDate);
			this.$el.find('#end-date .input-group.date').datepicker('setStartDate', startDate);
			
			var i= 0;
			_.each(products, function (product) {
				var productFields = null;
				if(i > 0)
					productFields = thisObj.addProduct();
				else {
					productFields = thisObj.$el.find('#product-list > tbody .product-item:first');
					productFields.find('.product_id').html(thisObj.getProductDropdown());
				}
				i++;
				
				productFields.find('.id').val(product.id);
				productFields.find('.product_id').val(product.productname.id);
				
				var unitprice = 0;
				if(typeof product.unitprice !== 'undefined' && product.unitprice != null) {
					unitprice = parseFloat(product.unitprice);
					productFields.find('.unitprice').val(thisObj.addCommaToNumber(unitprice.toFixed(2)));
				}
				
				var tons = 0
				if(typeof product.tons !== 'undefined' && product.tons != null) {
					tons = parseFloat(product.tons);
					productFields.find('.tons').val(thisObj.addCommaToNumber(tons.toFixed(4)));
				}
				
				var unitPrice = unitprice * tons;
				productFields.find('.unit-price').val(thisObj.addCommaToNumber(unitPrice.toFixed(2)));
				
				thisObj.convertProductFieldToReadOnly(productFields, product.productname.id);
				/*if(thisObj.verified) {
					productFields.find('.product_id_dummy').val(product.productname.id);
					productFields.find('.unitprice').attr('readonly', true);
					productFields.siblings('.product-item').find('.tons').attr('readonly', true);
					productFields.find('.unit-price').attr('readonly', true);
				}*/
				
				var j = 0;
				_.each(product.productorder, function (productSub) {
					var productSubFields = null;
					
					if(j > 0)
						productSubFields = thisObj.addProductSub(productFields.next('.product-stack').find('.product-stack-table'));
					else
						productSubFields = productFields.next('.product-stack').find('.product-stack-table > tbody .product-stack-item:first');
					j++;
					
					productSubFields.find('.id').val(productSub.id);
					thisObj.generateStackNumberDropdown(productSubFields.find('.stacknumber'), product.productname.id, productSub.stacknumber);
					thisObj.generateLocationFromDropDown(productSub.stacknumber, product.productname.id, productSubFields.find('.section_id'), product.productorder[0].section_id);
					productSubFields.find('.description').val(productSub.description);
					productSubFields.find('.tons').val(productSub.tons);
					productSubFields.find('.bales').val(productSub.bales);
				});
			});
			
			this.computeTotals();
		},
		
		postDisplayForm: function () {
			if(this.subContainerExist())
				this.supplySOData();
		},
	});

  return SalesOrderEditView;
  
});