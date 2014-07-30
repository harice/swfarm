define([
	'backbone',
	'bootstrapdatepicker',
	'views/purchaseorder/PurchaseOrderAddView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountProducerCollection',
	'collections/purchaseorder/DestinationCollection',
	'collections/product/ProductCollection',
	'collections/contact/ContactCollection',
	'collections/inventory/StackNumberCollection',
	'collections/stack/LocationCollection',
	'models/purchaseorder/PurchaseOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddTemplate.html',
	'text!templates/purchaseorder/purchaseOrderProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderSubProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			PurchaseOrderAddView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			AccountProducerCollection,
			DestinationCollection,
			ProductCollection,
			ContactCollection,
			StackNumberCollection,
			LocationCollection,
			PurchaseOrderModel,
			contentTemplate,
			purchaseOrderAddTemplate,
			productItemTemplate,
			productSubItemTemplate,
			purchaseOrderDestinationTemplate,
			Global,
			Const
){

	var BidAddView = PurchaseOrderAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		producerAutoCompleteView: null,
		
		initialize: function() {
			Backbone.View.prototype.refreshTitle('Bid','add');
			this.initSubContainer();
			var thisObj = this;
			this.isBid = true;
			this.isConvertToPO = false;
			this.poId = null;
			this.h1Title = 'Bid';
			this.h1Small = 'add';
			
			this.bidTransportdateStart = null;
			this.bidTransportdateEnd = null;
			this.bidLocationId = null;
			
			this.currentProducerId = null;
			this.producerAccountContactId = null;
			
			this.productAutoCompletePool = [];
			this.stackNumberByProductPool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'unitprice', 'tons', 'id'],
				productFieldClassRequired: ['product_id', 'unitprice', 'tons'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				productSubFieldClone: null,
				productSubFieldCounter: 0,
				productSubFieldClass: ['stacknumber', 'section_id', 'description', 'tons', 'bales', 'id'],
				productSubFieldClassRequired: ['stacknumber', 'section_id', 'tons', 'bales'],
				productSubFieldExempt: [],
				productSubFieldSeparator: '.',
				removeComma: ['unitprice', 'tons', 'bales'],
				fileFileClone: null,
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
				
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.producerAccountCollection = new ContactCollection();
			this.producerAccountCollection.on('sync', function() {
				thisObj.generateProducerAccountContacts();
                thisObj.hideFieldThrobber();
			});
			this.producerAccountCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.stackNumberCollection = new StackNumberCollection();
			this.stackNumberCollection.on('sync', function(data, textStatus, jqXHR, option) {
				
				var autocompleteData = [];
				_.each(data, function (s) {
					autocompleteData.push(s.stacknumber);
				});
				thisObj.stackNumberByProductPool[option.id] = autocompleteData;
				
				thisObj.initStackNumberAutocomplete(thisObj.subContainer.find('.product-stack-table tbody[data-id="'+option.dataId+'"] .stacknumber'), option.id);
				thisObj.hideFieldThrobber('.product-stack-table tbody[data-id="'+option.dataId+'"] .stacknumber');
			});
			this.stackNumberCollection.on('error', function(collection, response, options) {
			});
			
			this.locationCollection = new LocationCollection();
			this.locationCollection.on('sync', function() {
				thisObj.generateLocationFromDropDown();
				thisObj.hideFieldThrobber('.section_id');
			});
			this.locationCollection.on('error', function(collection, response, options) {
				
			});
		},
	});

  return BidAddView;
  
});