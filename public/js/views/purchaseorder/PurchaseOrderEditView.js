define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/purchaseorder/PurchaseOrderAddView',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountProducerCollection',
	'collections/purchaseorder/DestinationCollection',
	'collections/product/ProductCollection',
	'models/purchaseorder/PurchaseOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddTemplate.html',
	'text!templates/purchaseorder/purchaseOrderProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			PurchaseOrderAddView,
			CustomAutoCompleteView,
			AccountProducerCollection,
			DestinationCollection,
			ProductCollection,
			PurchaseOrderModel,
			contentTemplate,
			purchaseOrderAddTemplate,
			productItemTemplate,
			purchaseOrderDestinationTemplate,
			Global,
			Const
){

	var PurchaseOrderEditView = PurchaseOrderAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		producerAutoCompleteView: null,
		
		initialize: function(option) {
			var thisObj = this;
			
			this.poId = option.id;
			
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'description', 'stacknumber', 'unitprice', 'tons', 'bales', 'ishold'],
				productFieldClassRequired: ['product_id', 'stacknumber', 'unitprice', 'tons', 'bales'],
				productFieldExempt: [],
				productFieldSeparator: '.',
			};
			
			this.destinationCollection = new DestinationCollection();
			this.destinationCollection.on('sync', function() {	
				thisObj.productCollection.getModels();
				this.off('sync');
			});
			
			this.destinationCollection.on('error', function(collection, response, options) {
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
				thisObj.supplyPOData();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new PurchaseOrderModel({id:this.poId});
			this.model.on('change', function() {
				thisObj.destinationCollection.getModels();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'po_url' : '#/'+Const.URL.PO,
			};
			
			if(this.poId != null)
				innerTemplateVariables['po_id'] = this.poId;
			
			var innerTemplate = _.template(purchaseOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Purchase Order",
				h1_small: "edit",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initValidateForm();
			
			this.generateDestination();
			this.initProducerAutocomplete();
			this.initCalendar();
			this.addProduct();
		},
		
		supplyPOData: function () {
			var thisObj = this;
			
			var account = this.model.get('account');
			var address = [this.model.get('orderaddress')];
			var products = this.model.get('productorder');
			
			this.$el.find('#ponumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
			this.$el.find('[name="location_id"][value="'+this.model.get('location').id+'"]').attr('checked', true);
			this.producerAutoCompleteView.autoCompleteResult = [{name:account.name, id:account.id, address:address}];
			this.$el.find('#account').val(account.name);
			this.$el.find('#account_id').val(account.id);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states[0].state);
			this.$el.find('#city').val(address[0].address_city[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofpurchase').val(this.model.get('created_at').split(' ')[0]);
			this.$el.find('#start-date .input-group.date').datepicker('update', this.model.get('transportdatestart').split(' ')[0]);
			this.$el.find('#end-date .input-group.date').datepicker('update', this.model.get('transportdateend').split(' ')[0]);
			this.$el.find('#notes').val(this.model.get('notes'));
			
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
				productFields.find('.ishold').val(product.ishold);
				productFields.find('.unitprice').blur();
			});
		},
	});

  return PurchaseOrderEditView;
  
});