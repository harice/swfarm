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
	'models/purchaseorder/PurchaseOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddTemplate.html',
	'text!templates/purchaseorder/purchaseOrderProductItemTemplate.html',
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
			this.initSubContainer();
			var thisObj = this;
			this.isBid = false;
			this.isConvertToPO = false;
			this.poId = option.id;
			this.h1Title = 'Purchase Order';
			this.h1Small = 'edit';
			this.inits();
			
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
			Backbone.View.prototype.refreshTitle('Purchase Order','edit');
		},
		
		supplyPOData: function () {
			var thisObj = this;
			
			var account = this.model.get('account');
			var address = [this.model.get('orderaddress')];
			var products = this.model.get('productorder');
			
			this.$el.find('#ponumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
            if (this.model.get('location') !== null) {
                this.$el.find('[name="location_id"][value="'+this.model.get('location').id+'"]').attr('checked', true);
            }
			this.producerAutoCompleteView.autoCompleteResult = [{name:account.name, id:account.id, address:address}];
			this.$el.find('#account').val(account.name);
			this.$el.find('#account_id').val(account.id);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states.state);
			this.$el.find('#city').val(address[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofpurchase').val(this.convertDateFormat(this.model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
			
			if(!this.isBid) {
				if(this.model.get('transportdatestart')) {
					var startDate = this.convertDateFormat(this.model.get('transportdatestart').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
					this.$el.find('#start-date .input-group.date').datepicker('update', startDate);
					this.$el.find('#end-date .input-group.date').datepicker('setStartDate', startDate);
				}
				
				if(this.model.get('transportdateend')) {
					var endDate = this.convertDateFormat(this.model.get('transportdateend').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
					this.$el.find('#end-date .input-group.date').datepicker('update', endDate);
					this.$el.find('#start-date .input-group.date').datepicker('setEndDate', endDate);
				}
			}
			this.$el.find('#notes').val(this.model.get('notes'));
			
			var i= 0;
			_.each(products, function (product) {
				var productFields = (i > 0)? thisObj.addProduct(): thisObj.$el.find('#product-list tbody .product-item:first-child');
				i++;
				
				productFields.find('.id').val(product.id);
				productFields.find('.product_id').val(product.product.id);
				productFields.find('.description').val(product.description);
				productFields.find('.stacknumber').val(product.stacknumber);
				productFields.find('.unitprice').val(thisObj.addCommaToNumber(parseFloat(product.unitprice).toFixed(2)));
				productFields.find('.tons').val(thisObj.addCommaToNumber(parseFloat(product.tons).toFixed(4)));
				productFields.find('.bales').val(thisObj.addCommaToNumber(product.bales));
				productFields.find('.ishold').val(product.ishold);
				productFields.find('.rfv').val(product.rfv);
				
				if(product.upload.length > 0) {
					productFields.find('.uploadedfile').val(product.upload[0].file_id);
					productFields.find('.uploadedfile').attr('data-filename', product.upload[0].files[0].name);
					productFields.find('.attach-pdf').removeClass('no-attachment');
				}
				
				var unitPrice = parseFloat(product.unitprice) * parseFloat(product.tons);
				productFields.find('.unit-price').val(thisObj.addCommaToNumber(unitPrice.toFixed(2)));
			});
			
			this.computeTotals();
		},
		
		otherInitializations: function () {
			this.initCancelConfirmation();
		},
		
		initCancelConfirmation: function () {
			var verifyMsg = (!this.isBid)? 'Are you sure you want to cancel this Purchase Order?' : 'Are you sure you want to cancel this Bid?';
			var verifyButtonLabel = (!this.isBid)? 'Cancel Purchase Order' : 'Cancel Bid';
			this.initConfirmationWindow(verifyMsg,
										'confirm-cancel-po',
										verifyButtonLabel);
		},
		
		postDisplayForm: function () {
			if(this.subContainerExist())
				this.supplyPOData();
		},
		
		otherInitializations: function () {
			this.initConvertToPOWindow();
		},
	});

  return PurchaseOrderEditView;
  
});