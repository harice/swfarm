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
	'text!templates/purchaseorder/purchaseOrderViewTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewProductItemTemplate.html',
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
			this.isBid = false;
			this.h1Title = 'Purchase Order';
			this.h1Small = 'view';
			
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
				if(parseInt(this.get('isfrombid')) == 1 && this.get('status').name.toLowerCase() == 'pending') {
					thisObj.isBid = true;
					thisObj.h1Title = 'Bid';
				}
				else
					thisObj.isBid = false;
				
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
				'po_edit_url' : '#/'+Const.URL.PO+'/'+Const.CRUD.EDIT+'/'+this.poId,
			};
			
			if(this.model.get('status').name.toLowerCase() == 'pending' || this.model.get('status').name.toLowerCase() == 'open')
				innerTemplateVariables['editable'] = true;
				
			if(this.isBid)
				innerTemplateVariables['is_bid'] = true;
			
			var innerTemplate = _.template(purchaseOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		supplyPOData: function () {
			var thisObj = this;
			
			var account = this.model.get('account');
			var address = [this.model.get('orderaddress')];
			var products = this.model.get('productorder');
			
			this.$el.find('#ponumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
			this.$el.find('#destination').val(this.model.get('location').location);
			this.$el.find('#account').val(account.name);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states[0].state);
			this.$el.find('#city').val(address[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofpurchase').val(this.convertDateFormat(this.model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
			if(!thisObj.isBid) {
				if(this.model.get('transportdatestart')) {
					var date = this.convertDateFormat(this.model.get('transportdatestart').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
					this.$el.find('#transportdatestart').val(date);
				}
				if(this.model.get('transportdateend')) {
					var date = this.convertDateFormat(this.model.get('transportdateend').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
					this.$el.find('#transportdateend').val(date);
				}
			}
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
					ishold: (parseInt(product.ishold) == 1)? 'Yes' : 'No',
				};
				
				if(thisObj.isBid)
					variables['is_bid'] = true;
				
				var template = _.template(productItemTemplate, variables);
				thisObj.$el.find('#product-list tbody').append(template);
			});
		},
		
		events:{
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

  return PurchaseOrderEditView;
  
});