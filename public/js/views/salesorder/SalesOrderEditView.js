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
			
			/*this.currentCustomerId = null;
			this.customerAccountContactId = null;
			
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'unitprice', 'tons', 'id'],
				productFieldClassRequired: ['product_id', 'unitprice', 'tons'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				productSubFieldClone: null,
				productSubFieldCounter: 0,
				productSubFieldClass: ['stacknumber', 'description', 'tons', 'bales', 'id'],
				productSubFieldClassRequired: ['stacknumber', 'tons', 'bales'],
				productSubFieldExempt: [],
				productSubFieldSeparator: '.',
				removeComma: ['unitprice', 'tons', 'bales'],
			};
			
			this.natureOfSaleCollection = new NatureOfSaleCollection();
			this.natureOfSaleCollection.on('sync', function() {
				thisObj.productCollection.getAllModel();
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
            
            this.contractByAccountCollection = new ContractByAccountCollection();
            this.contractByAccountCollection.on('sync', function() {
				if(!thisObj.isInitProcess)
					thisObj.generateContract();
				else
					thisObj.contractProductsCollection.getContractProducts(thisObj.model.get('contract_id'));
				//this.off('sync');
			});
			this.contractByAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				_.each(this.models, function (productModels) {
					thisObj.productAutoCompletePool.push({
						label:productModels.get('name'),
						value:productModels.get('name'),
						id:productModels.get('id'),
						desc:productModels.get('description'),
					});
				});
				
				if()
				
				if(thisObj.subContainerExist()) {
					thisObj.isInitProcess = false;
					thisObj.displayForm();
					thisObj.supplySOData();
				}
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.contractProductsCollection = new ProductCollection();
			this.contractProductsCollection.on('sync', function() {
				if(!thisObj.isInitProcess)
					thisObj.generateContractProductDropdown();
				else
					thisObj.natureOfSaleCollection.getModels();
				//this.off('sync');
			});
			this.contractProductsCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.customerAccountCollection = new ContactCollection();
			this.customerAccountCollection.on('sync', function() {
				thisObj.generateCustomerAccountContacts();
                thisObj.hideFieldThrobber();
			});
			this.customerAccountCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});*/
			
			this.model = new SalesOrderModel({id:this.soId});
			this.model.on('change', function() {
				_.each(this.get('productsummary'), function (product) {
					thisObj.soProducts.push(product.productname.id);
				});
				
				console.log(thisObj.soProducts);
				
				if(this.get('contract_id'))
					thisObj.contractByAccountCollection.getContractByAccount(this.get('account').id);
				else
					thisObj.stackNumberCollection.getStackNumbersByProduct({id:thisObj.soProducts[thisObj.soProductsIndex]});
					//thisObj.natureOfSaleCollection.getModels();
				
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
			
			this.$el.find('#sonumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
			this.$el.find('[name="natureofsale_id"][value="'+this.model.get('natureofsale').id+'"]').attr('checked', true);
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
				productFields.find('.unitprice').val(thisObj.addCommaToNumber(parseFloat(product.unitprice).toFixed(2)));
				productFields.find('.tons').val(thisObj.addCommaToNumber(parseFloat(product.tons).toFixed(4)));
				var unitPrice = parseFloat(product.unitprice) * parseFloat(product.tons);
				productFields.find('.unit-price').val(thisObj.addCommaToNumber(unitPrice.toFixed(2)));
				
				var j = 0;
				_.each(product.productorder, function (productSub) {
					var productSubFields = null;
					
					if(j > 0)
						productSubFields = thisObj.addProductSub(productFields.find('.product-stack-table'));
					else
						productSubFields = productFields.next('.product-stack').find('.product-stack-table > tbody .product-stack-item:first');
					j++;
					
					productSubFields.find('.id').val(productSub.id);
					//productSubFields.find('.stacknumber').val(productSub.stacknumber);
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