define([
	'backbone',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/AccountProducerAutoCompleteView',
	'collections/bid/BidDestinationCollection',
	'collections/account/AccountProducerCollection',
	'collections/address/AddressCollection',
	'collections/product/ProductCollection',
	'models/bid/BidModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/bid/bidAddTemplate.html',
	'text!templates/bid/bidDestinationTemplate.html',
	'text!templates/bid/bidProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			AccountProducerAutoCompleteView,
			BidDestinationCollection,
			AccountProducerCollection,
			AddressCollection,
			ProductCollection,
			BidModel,
			contentTemplate,
			bidAddTemplate,
			bidDestinationTemplate,
			bidProductItemTemplate,
			Global,
			Const
){

	var BidAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.producerAutoCompleteResult = [];
			this.productAutoCompletePool = [];
			this.options = {
				bidProductFieldClone: null,
				bidProductFieldCounter: 0,
				bidProductFieldClass: ['product', 'productname', 'stacknumber', 'bidprice', 'tons', 'bales', 'ishold'],
				bidProductFieldClassRequired: ['productname', 'stacknumber', 'bidprice', 'tons', 'bales'],
				bidProductFieldExempt: ['productname'],
				bidProductFieldSeparator: '.',
			};
			
			var thisObj = this;
			
			this.bidDestinationCollection = new BidDestinationCollection();
			this.bidDestinationCollection.on('sync', function() {
				thisObj.generateDestination(this.models);
				this.off('sync');
			});
			this.bidDestinationCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.addressCollection = new AddressCollection();
			this.addressCollection.on('sync', function() {
				thisObj.generateProducerAddressType(this.models);
			});
			this.addressCollection.on('error', function(collection, response, options) {
			});
			
			this.productSynced = false;
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
				thisObj.productSynced = true;
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.bidDestinationCollection.getModels();
			this.productCollection.getAllModel();
			
			var thisObj = this;
			
			var innerTemplateVariables = {
				'bid_url' : '#/'+Const.URL.BID,
			};
			var innerTemplate = _.template(bidAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Bid",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#bidUserForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					console.log(data);
					
					var bidModel = new BidModel(data);
					
					bidModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.BID, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: bidModel.getAuth(),
						}
					);
				},
			});
			
			this.initProducerAutocomplete();
		},
		
		initProducerAutocomplete: function () {
			var thisObj = this;
			
			var accountProducerCollection = new AccountProducerCollection();
			this.producerAutoCompleteView = new AccountProducerAutoCompleteView({
                input: $('#producer'),
				hidden: $('#producer-id'),
                collection: accountProducerCollection,
            });
			
			this.producerAutoCompleteView.on('loadResult', function () {
				thisObj.producerAutoCompleteResult = [];
				_.each(accountProducerCollection.models, function (producerModel) {
					thisObj.producerAutoCompleteResult.push({id:producerModel.get('id'), name:producerModel.get('name')});
				});
			});
			
			this.producerAutoCompleteView.onSelect = function (model) {
				thisObj.getProducerAddress(model.get('id'));
			};
			
			this.producerAutoCompleteView.render();
		},
		
		initProductAutocomplete: function (bidProductItem) {
			var thisObj = this;
			
			var products = this.productAutoCompletePool;
			
			bidProductItem.find('.productname').autocomplete({
				source:products,
				select: function (ev, ui) {
					var productField = $(ev.target);
					productField.closest('.product-item').find('.product-description').val(ui.item.desc);
					productField.siblings('.product_id').val(ui.item.id);
					productField.val(ui.item.label);
					return false;
				},
			});
		},
		
		events: {
			'click #add-bid-product': 'addBidProduct',
			'click .remove-bid-product': 'removeBidProduct',
			//'blur #producer': 'selectFirstProducerItem',
			'blur #producer': 'validateProducer',
			'blur .productname': 'validateProduct',
			'change #address': 'displaySelectedAddress',
			'blur .bidprice': 'onBlurBidPrice',
			'keyup .bidprice': 'onKeyUpBidPrice',
			'keyup .tons': 'onKeyUpTons',
		},
		
		generateDestination: function (destinationModels) {
			var destinationTemplate = _.template(bidDestinationTemplate, {'destinations': destinationModels});
			this.$el.find('#bid-destination').html(destinationTemplate);
			this.$el.find('#bid-destination .radio-inline:first-child input[type="radio"]').attr('checked', true);
		},
		
		addBidProduct: function () {
			if(this.productSynced) {
				
				if(!this.hasProduct())
					this.$el.find('#bid-product-list tbody').empty();
				
				if(this.options.bidProductFieldClone == null) {
					var bidProductTemplate = _.template(bidProductItemTemplate, {});
					
					this.$el.find('#bid-product-list tbody').append(bidProductTemplate);
					var bidProductItem = this.$el.find('#bid-product-list tbody').find('.product-item:first-child');
					this.options.bidProductFieldClone = bidProductItem.clone();
					this.initProductAutocomplete(bidProductItem);
					this.addIndexToBidProductFields(bidProductItem);
				}
				else {
					var clone = this.options.bidProductFieldClone.clone();
					this.initProductAutocomplete(clone);
					this.addIndexToBidProductFields(clone);
					this.$el.find('#bid-product-list tbody').append(clone);
				}
					
				this.addValidationToBidProduct();
			}
			else {
				this.displayGrowl('Fetching product data. Retry in a while.');
			}
		},
		
		removeBidProduct: function (ev) {
			$(ev.target).closest('tr').remove();
			
			if(!this.hasProduct())
				this.$el.find('#bid-product-list tbody').append('<tr><td colspan="8">No products added.</td></tr>');
		},
		
		addValidationToBidProduct: function () {
			var thisObj = this;
			var bidProductFieldClassRequired = this.options.bidProductFieldClassRequired;
			for(var i=0; i < bidProductFieldClassRequired.length; i++) {
				$('.'+bidProductFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},
		
		addIndexToBidProductFields: function (bidProductItem) {
			var bidProductFieldClass = this.options.bidProductFieldClass;
			for(var i=0; i < bidProductFieldClass.length; i++) {
				var field = bidProductItem.find('.'+bidProductFieldClass[i]);
				var name = field.attr('name');
				field.attr('name', name + this.options.bidProductFieldSeparator + this.options.bidProductFieldCounter);
			}
			
			this.options.bidProductFieldCounter++;
		},
		
		selectFirstProducerItem: function (ev) {
			var labelField = $(ev.target);
			var idField = labelField.siblings('#producer-id');
		
			if(!this.producerAutoCompleteView.$el.is(':hover') && !this.producerIsInFetchedData(idField.val(), labelField.val())) {
				var resultList = labelField.siblings('.autocomplete');
				var li = resultList.find('li');
				if(li.length > 0) {
					var firstItem = resultList.find('li:first-child a');
					labelField.val(firstItem.text());
					idField.val(firstItem.attr('data-id'));
					this.getProducerAddress(firstItem.attr('data-id'));
				}
				else {
					labelField.val('');
					idField.val('');
					this.resetProducerAddress();
				}
				resultList.hide();
			}
		},
		
		validateProducer: function (ev) {
			var labelField = $(ev.target);
			var idField = labelField.siblings('#producer-id');
			var producer = this.producerIsInFetchedData(labelField.val(), idField.val());
			
			if(!this.producerAutoCompleteView.$el.is(':hover')) {
				if(producer !== false) {
					if(producer.id != null) {
						labelField.val(producer.name);
						idField.val(producer.id);
						this.resetProducerAddress();
						this.getProducerAddress(producer.id);
					}
					else
						labelField.val(producer.name);
				}
				else {
					labelField.val('');
					idField.val('');
					this.resetProducerAddress();
				}
				labelField.siblings('.autocomplete').hide();
			}
		},
		
		producerIsInFetchedData: function (name, id) {
			if(name != null) {
				for(var i = 0; i < this.producerAutoCompleteResult.length; i++) {
					if(this.producerAutoCompleteResult[i].name.toLowerCase() == name.toLowerCase()) {
						
						if(id != null && id != '' && parseInt(id) == parseInt(this.producerAutoCompleteResult[i].id))
							return {name:this.producerAutoCompleteResult[i].name};
						
						return {name:this.producerAutoCompleteResult[i].name, id:this.producerAutoCompleteResult[i].id};
					}
				}
			}
			return false;
		},
		
		validateProduct: function (ev) {
			var field = $(ev.target);
			var name = field.val();
			var id = field.siblings('.product_id').val();
			var product = this.isInProductAutoCompletePool(name);
			
			if(product === false) {
				//field.val('');
				//field.siblings('.product_id').val('');
				this.emptyProductFields(field);
			}
			else {
				field.val(product.name);
				field.siblings('.product_id').val(product.id);
			}
		},
		
		productIsInFetchedData: function (id, name) {
			for(var i = 0; i < this.productAutoCompletePool.length; i++) {
				if(parseInt(this.productAutoCompletePool[i].id) == parseInt(id) &&
					this.productAutoCompletePool[i].value.toLowerCase() == name.toLowerCase()) {
					return true;
				}
			}
			return false;
		},
		
		isInProductAutoCompletePool: function (value) {
			for(var i = 0; i < this.productAutoCompletePool.length; i++) {
				if(this.productAutoCompletePool[i].value.toLowerCase() == value.toLowerCase()) {
					return {id:this.productAutoCompletePool[i].id, name:this.productAutoCompletePool[i].value};
				}
			}
			return false;
		},
		
		getProducerAddress: function (producerId) {
			this.addressCollection.fetchAddresses(producerId);
		},
		
		resetProducerAddress: function () {
			this.emptyProducerAddressType();
			this.emptyProducerAddressFields();
		},
		
		emptyProducerAddressType: function () {
			$('#address').find('option:gt(0)').remove();
		},
		
		emptyProducerAddressFields: function () {
			$('#street').val('');
			$('#state').val('');
			$('#city').val('');
			$('#zipcode').val('');
		},
		
		generateProducerAddressType: function (models) {
			this.resetProducerAddress();
			
			var addressTypeField = $('#address');
			
			_.each(models, function (addressType){
				addressTypeField.append($('<option></option>')
					.attr('value', addressType.get('id'))
					.text(addressType.get('address_type')[0].name));
			});
		},
		
		displaySelectedAddress: function (ev) {
			this.emptyProducerAddressFields();
			var addressId = $(ev.target).val();
			if(addressId != null && addressId != '') {
				var selectedAddress = this.addressCollection.get(addressId);
				$('#street').val(selectedAddress.get('street'));
				$('#state').val(selectedAddress.get('address_states')[0].state);
				$('#city').val(selectedAddress.get('address_city')[0].city);
				$('#zipcode').val(selectedAddress.get('zipcode'));
			}
		},
		
		emptyProductFields: function (field) {
			field.val('');
			field.siblings('.product_id').val('');
			field.closest('.product-item').find('.product-description').val('');
		},
		
		hasProduct: function () {
			return (this.$el.find('#bid-product-list tbody .product-item').length)? true : false;
		},
		
		formatFormField: function (data) {
			var formData = {products:[]};
			var bidProductFieldClass = this.options.bidProductFieldClass;
			
			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.bidProductFieldSeparator);
					
					if(arrayKey.length < 2)
						formData[key] = value;
					else {
						if(arrayKey[0] == bidProductFieldClass[0] && this.options.bidProductFieldExempt.indexOf(arrayKey[0]) < 0) {
							var index = arrayKey[1];
							var arrayBidProductFields = {};
							
							for(var i = 0; i < bidProductFieldClass.length; i++)
								arrayBidProductFields[bidProductFieldClass[i]] = data[bidProductFieldClass[i]+this.options.bidProductFieldSeparator+index];
								
							formData.products.push(arrayBidProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		onBlurBidPrice: function (ev) {
			var field = $(ev.target);
			var bidPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.tons');
			var tons = (!isNaN(parseFloat(tonsField.val())))? parseFloat(tonsField.val()) : 0;
			
			field.val(bidPrice.toFixed(2));
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpBidPrice: function (ev) {
			var field = $(ev.target);
			var bidPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.tons');
			var tons = (!isNaN(parseFloat(tonsField.val())))? parseFloat(tonsField.val()) : 0;
			
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpTons: function (ev) {
			var field = $(ev.target);
			var tons = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var bidPriceField = field.closest('.product-item').find('.bidprice');
			var bidPrice = (!isNaN(parseFloat(bidPriceField.val())))? parseFloat(bidPriceField.val()) : 0;
			
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		computeUnitePrice: function (bidPrice, tons, unitePriceField) {
			var unitPrice = 0;
			unitPrice = tons * bidPrice;
			unitePriceField.val(unitPrice.toFixed(2));
		},
	});

  return BidAddView;
  
});