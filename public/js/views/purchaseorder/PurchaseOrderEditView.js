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
	'models/purchaseorder/PurchaseOrderModel',
	'models/file/FileModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddTemplate.html',
	'text!templates/purchaseorder/purchaseOrderProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderSubProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'text!templates/purchaseorder/convertToPOFormTemplate.html',
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
			PurchaseOrderModel,
			FileModel,
			contentTemplate,
			purchaseOrderAddTemplate,
			productItemTemplate,
			productSubItemTemplate,
			purchaseOrderDestinationTemplate,
			convertToPOFormTemplate,
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
			this.isInitProcess = true;
			this.soProducts = [];
			this.soProductsIndex = 0;
			this.inits();
			
			this.model = new PurchaseOrderModel({id:this.poId});
			this.model.on('change', function() {
				_.each(this.get('productsummary'), function (product) {
					thisObj.soProducts.push(product.productname.id);
				});
				
				console.log(thisObj.soProducts);
				
				if(parseInt(this.get('isfrombid')) == 1 && this.get('status').name.toLowerCase() == 'pending') {
					thisObj.isBid = true;
					thisObj.h1Title = 'Bid';
				}
				else
					thisObj.isBid = false;

				thisObj.locationCollection.getLocationByAccount(this.get('account_id'));
				//thisObj.stackNumberCollection.getStackNumbersByProduct({id:thisObj.soProducts[thisObj.soProductsIndex]});
				
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
			var products = this.model.get('productsummary');
			
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
			
			this.currentProducerId = account.id;
			this.producerAccountContactId = this.model.get('contact_id');
			this.showFieldThrobber('#contact_id');
			this.producerAccountCollection.getContactsByAccountId(account.id);
			this.generateLocationFromDropDown();
			
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
					//thisObj.initStackNumberAutocomplete(productSubFields.find('.stacknumber'), product.productname.id);
					productSubFields.find('.stacknumber').val(productSub.stacknumber);
					productSubFields.find('.section_id').val(productSub.section_id);
					productSubFields.find('.description').val(productSub.description);
					productSubFields.find('.tons').val(productSub.tons);
					productSubFields.find('.bales').val(productSub.bales);
					productSubFields.find('.ishold').val(productSub.ishold);
					productSubFields.find('.rfv').val(productSub.rfv);
					
					if(productSub.upload.length > 0) {
						productSubFields.find('.uploadedfile').val(productSub.upload[0].file_id);
						productSubFields.find('.uploadedfile').attr('data-filename', productSub.upload[0].files[0].name);
						productSubFields.find('.attach-pdf').removeClass('no-attachment');
					}
				});
			});
			
			this.computeTotals();
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