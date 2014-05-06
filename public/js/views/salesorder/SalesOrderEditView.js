define([
	'backbone',
	'views/salesorder/SalesOrderAddView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/product/ProductCollection',
	'models/salesorder/SalesOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderAddTemplate.html',
	'text!templates/salesorder/salesOrderProductItemTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'global',
	'constant',
], function(Backbone,
			SalesOrderAddView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			OriginCollection,
			NatureOfSaleCollection,
			ProductCollection,
			SalesOrderModel,
			contentTemplate,
			salesOrderAddTemplate,
			productItemTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			Global,
			Const
){

	var SalesOrderEditView = SalesOrderAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		customerAutoCompleteView: null,
		
		initialize: function(option) {
			var thisObj = this;
			this.soId = option.id;
			this.h1Title = 'Sales Order';
			this.h1Small = 'edit';
			
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'description', 'stacknumber', 'unitprice', 'tons', 'bales', 'id'],
				productFieldClassRequired: ['product_id', 'stacknumber', 'unitprice', 'tons', 'bales'],
				productFieldExempt: [],
				productFieldSeparator: '.',
			};
			
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
				thisObj.productCollection.getAllModel();
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
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
				thisObj.displayForm();
				thisObj.supplySOData();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new SalesOrderModel({id:this.soId});
			this.model.on('change', function() {
				thisObj.originCollection.getModels();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#soForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					
					var salesOrderModel = new SalesOrderModel(data);
					
					salesOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.SO, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: salesOrderModel.getAuth(),
						}
					);
				},
				errorPlacement: function(error, element) {
					if(element.hasClass('form-date')) {
						element.closest('.calendar-cont').siblings('.error-msg-cont').html(error);
					}
					else if(element.hasClass('price')) {
						element.closest('.input-group').siblings('.error-msg-cont').html(error);
					}
					else {
						error.insertAfter(element);
					}
				},
			});
		},
		
		supplySOData: function () {
			var thisObj = this;
			
			var account = this.model.get('account');
			var address = [this.model.get('orderaddress')];
			var products = this.model.get('productorder');
			
			this.$el.find('#sonumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
			this.$el.find('[name="location_id"][value="'+this.model.get('location').id+'"]').attr('checked', true);
			this.customerAutoCompleteView.autoCompleteResult = [{name:account.name, id:account.id, address:address}];
			this.$el.find('#account').val(account.name);
			this.$el.find('#account_id').val(account.id);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states[0].state);
			this.$el.find('#city').val(address[0].address_city[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofsale').val(this.model.get('created_at').split(' ')[0]);
			this.$el.find('#notes').val(this.model.get('notes'));
			this.$el.find('#start-date .input-group.date').datepicker('update', this.model.get('transportdatestart').split(' ')[0]);
			this.$el.find('#end-date .input-group.date').datepicker('update', this.model.get('transportdateend').split(' ')[0]);
			
			var i= 0;
			_.each(products, function (product) {
				var productFields = (i > 0)? thisObj.addProduct(): thisObj.$el.find('#product-list tbody .product-item:first-child');
				i++;
				
				productFields.find('.id').val(product.id);
				productFields.find('.product_id').val(product.product.id);
				productFields.find('.description').val(product.description);
				productFields.find('.stacknumber').val(product.stacknumber);
				productFields.find('.unitprice').val(product.unitprice);
				productFields.find('.tons').val(product.tons);
				productFields.find('.bales').val(product.bales);
				productFields.find('.unitprice').blur();
			});
		},
	});

  return SalesOrderEditView;
  
});