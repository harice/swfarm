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
	'models/document/DocumentModel',
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
			DocumentModel,
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
				
				if(parseInt(this.get('isfrombid')) == 1 && this.get('status').name.toLowerCase() == 'pending') {
					thisObj.isBid = true;
					thisObj.h1Title = 'Bid';
					Backbone.View.prototype.refreshTitle(thisObj.h1Title,'edit');
				}
				else
					thisObj.isBid = false;

				if(this.get('location') && parseInt(this.get('location').id) == parseInt(Const.PO.DESTINATION.DROPSHIP)){					
					thisObj.contractByAccountCollection.getContractByAccount(this.get('contract').account.id);
				}
				else
					thisObj.locationCollection.getLocationByAccount(this.get('account_id'));
				
				
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
			var contract = this.model.get('contract');			
			
			this.$el.find('#ponumber').val(this.model.get('order_number'));
			this.$el.find('#status').val(this.model.get('status').name);
            if (this.model.get('location') !== null) {                	
                this.$el.find('[name="location_id"][value="'+this.model.get('location').id+'"]').attr('checked', true);
                if(this.model.get('location_id') == Const.PO.DESTINATION.SWFARMS)
                	$("#save-and-check-in").hide();
            }
			this.producerAutoCompleteView.autoCompleteResult = [{name:account.name, id:account.id, address:address}];
			this.$el.find('#account').val(account.name);
			this.$el.find('#account_id').val(account.id);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states.state);
			this.$el.find('#city').val(address[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofpurchase').val(this.convertDateFormat(this.model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
			
			if(this.model.get('location') && parseInt(this.model.get('location').id) == parseInt(Const.PO.DESTINATION.DROPSHIP)) {						
				this.toggleSOFields(this.model.get('location').id);
				this.customerAutoCompleteView.autoCompleteResult = [{name:contract.account.name, id:contract.account.id}];
				this.$el.find('#account_customer').val(contract.account.name);
				this.$el.find('#account_id_customer').val(contract.account.id);
				this.generateContract();
				if(this.model.get('contract') && typeof this.model.get('contract').id != 'undefined')
					this.$el.find('#contract_id').val(this.model.get('contract').id);
			}
			
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
					productFields = thisObj.$el.find('#product-list > tbody').children();
					productFields.find('.product_id').html(thisObj.getProductDropdown());
				}
				i++;
				
				productFields.find('.id').val(product.id);
				productFields.find('.product_id').val(product.productname.id);
				//productFields.find('.unitprice').val(thisObj.addCommaToNumber(parseFloat(product.unitprice).toFixed(2)));
				productFields.find('.product-item-field.tons').val(thisObj.addCommaToNumber(parseFloat(product.tons).toFixed(3)));
				//var unitPrice = parseFloat(product.unitprice) * parseFloat(product.tons);
				//productFields.find('.unit-price').val(thisObj.addCommaToNumber(unitPrice.toFixed(2)));
				
				var totalTonsPerProduct = 0;
				var totalTotalPriceProduct = 0;
				var j = 0;
				_.each(product.productorder, function (productSub) {
					var productSubFields = null;
					
					if(j > 0)
						productSubFields = thisObj.addProductSub(productFields.next('.product-stack').find('.product-stack-table'));
					else
						productSubFields = productFields.next('.product-stack').find('.product-stack-table > tbody .product-stack-item:first');
					j++;
					
					productSubFields.find('.id').val(productSub.id);
					//thisObj.initStackNumberAutocomplete(productSubFields.find('.stacknumber'), product.productname.id);
					productSubFields.find('.stacknumber').val(productSub.stacknumber);
					productSubFields.find('.section_id').val(productSub.section_id);
					productSubFields.find('.description').val(productSub.description);
					productSubFields.find('.bales').val(productSub.bales);
					
					if(productSub.tons != null && typeof productSub.tons !== 'undefined') { 
						totalTonsPerProduct += parseFloat(productSub.tons);
						productSubFields.find('.tons').val(thisObj.addCommaToNumber(parseFloat(productSub.tons).toFixed(3)));
					}
					
					if(productSub.unitprice != null && typeof productSub.unitprice !== 'undefined')
						productSubFields.find('.unitprice').val(thisObj.addCommaToNumber(parseFloat(productSub.unitprice).toFixed(2)));
					
					var unitPriceXTons = parseFloat(productSub.unitprice) * parseFloat(productSub.tons);
					productSubFields.find('.unit-price').val(thisObj.addCommaToNumber(unitPriceXTons.toFixed(2)));
					totalTotalPriceProduct += parseFloat(unitPriceXTons);
					
					productSubFields.find('.ishold').val(productSub.ishold);
					productSubFields.find('.rfv').val(productSub.rfv);
					
					if(productSub.document != null) {
						productSubFields.find('.uploadedfile').val(productSub.document.id);
						productSubFields.find('.attach-pdf').removeClass('no-attachment');
					}
				});
				var formattedTotalTotalPriceProduct = thisObj.addCommaToNumber(totalTotalPriceProduct.toFixed(2));
				productFields.find('.product-item-field.unit-price').val(formattedTotalTotalPriceProduct);
				productFields.find('.product-stack-table tfoot .total-price').val(formattedTotalTotalPriceProduct);
				productFields.find('.product-stack-table tfoot .total-tons').val(thisObj.addCommaToNumber(totalTonsPerProduct.toFixed(3)));
				
			});
			
			this.computeTotals();
		},		
		
		postDisplayForm: function () {
			if(this.subContainerExist())
				this.supplyPOData();
		},
		
		otherInitializations: function () {
			if(this.model.get('isfrombid'))
				this.initConvertToPOWindow();	
		},
	});

  return PurchaseOrderEditView;
  
});