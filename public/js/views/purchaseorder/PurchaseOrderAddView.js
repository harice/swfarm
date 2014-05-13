define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
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
			AppView,
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

	var PurchaseOrderAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		producerAutoCompleteView: null,
		
		initialize: function() {
			var thisObj = this;
			this.isBid = false;
			this.isConvertToPO = false;
			this.poId = null;
			this.h1Title = 'Purchase Order';
			this.h1Small = 'add';
			
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'description', 'stacknumber', 'unitprice', 'tons', 'bales', 'ishold', 'id'],
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
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.destinationCollection.getModels();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'po_url' : '#/'+Const.URL.PO,
			};
			
			if(this.isBid)
				innerTemplateVariables['is_bid'] = true;
			
			if(this.poId != null)
				innerTemplateVariables['po_id'] = this.poId;
			
			var innerTemplate = _.template(purchaseOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initValidateForm();
			
			this.generateDestination();
			this.initProducerAutocomplete();
			this.initCalendar();
			this.addProduct();
			
			this.otherInitializations();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#poForm').validate({
				submitHandler: function(form) {
					console.log($(form).serializeObject());
					var data = thisObj.formatFormField($(form).serializeObject());
					//console.log(data);
					if(typeof data['transportdatestart'] != 'undefined')
						data['transportdatestart'] = thisObj.convertDateFormat(data['transportdatestart'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					if(typeof data['transportdateend'] != 'undefined')
						data['transportdateend'] = thisObj.convertDateFormat(data['transportdateend'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					
					if(thisObj.isBid)
						data['isfrombid'] = '1';
					
					if(thisObj.isConvertToPO)
						data['createPO'] = '1';
					
					//console.log(data);
					
					var purchaseOrderModel = new PurchaseOrderModel(data);
					
					purchaseOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.isConvertToPO = false;
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.PO, {trigger: true});
							},
							error: function (model, response, options) {
								thisObj.isConvertToPO = false;
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: purchaseOrderModel.getAuth(),
						}
					);
				},
				invalidHandler: function (event, validator) {
					thisObj.isConvertToPO = false;
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
		
		generateDestination: function () {
			var destinationTemplate = _.template(purchaseOrderDestinationTemplate, {'destinations': this.destinationCollection.models});
			this.$el.find('#po-destination').html(destinationTemplate);
			this.$el.find('#po-destination .radio-inline:first-child input[type="radio"]').attr('checked', true);
		},
		
		initProducerAutocomplete: function () {
			var thisObj = this;
			
			if(this.producerAutoCompleteView != null)
				this.producerAutoCompleteView.deAlloc();
			
			var accountProducerCollection = new AccountProducerCollection();
			this.producerAutoCompleteView = new CustomAutoCompleteView({
                input: $('#account'),
				hidden: $('#account_id'),
                collection: accountProducerCollection,
				fields: ['address'],
            });
			
			this.producerAutoCompleteView.onSelect = function (model) {
				var address = model.get('address');
				thisObj.$el.find('#street').val(address[0].street);
				thisObj.$el.find('#state').val(address[0].address_states[0].state);
				thisObj.$el.find('#city').val(address[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
			};
			
			this.producerAutoCompleteView.typeInCallback = function (result) {
				var address = result.address;
				thisObj.$el.find('#street').val(address[0].street);
				thisObj.$el.find('#state').val(address[0].address_states[0].state);
				thisObj.$el.find('#city').val(address[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
			},
			
			this.producerAutoCompleteView.typeInEmptyCallback = function () {
				thisObj.$el.find('#street').val('');
				thisObj.$el.find('#state').val('');
				thisObj.$el.find('#city').val('');
				thisObj.$el.find('#zipcode').val('');
			},
			
			this.producerAutoCompleteView.render();
		},
		
		initCalendar: function () {
			this.$el.find('#start-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			});
			
			this.$el.find('#end-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			});
		},
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
				};
				
				if(this.isBid)
					productTemplateVars['is_bid'] = true;
				
				var productTemplate = _.template(productItemTemplate, productTemplateVars);
				
				this.$el.find('#product-list tbody').append(productTemplate);
				var productItem = this.$el.find('#product-list tbody').find('.product-item:first-child');
				this.options.productFieldClone = productItem.clone();
				//this.initProductAutocomplete(productItem);
				this.addIndexToProductFields(productItem);
				clone = productItem;
			}
			else {
				var clone = this.options.productFieldClone.clone();
				//this.initProductAutocomplete(clone);
				this.addIndexToProductFields(clone);
				this.$el.find('#product-list tbody').append(clone);
			}
				
			this.addValidationToProduct(clone);
            // this.styleSelect(clone);
            // this.styleRadio();
            this.maskInputs();
			return clone;
		},
                
        maskInputs: function () {
            // $(".unitprice").mask('0,000.00', {reverse: true});
            $(".tons").mask('0,000.00', {reverse: true});
            $(".bales").mask('0,000', {reverse: true});
            // $(".unit-price").mask('000,000.00', {reverse: true});
        },
                
        // TO DO: Remove
        styleSelect: function (clone) {
            clone.find(".select2").select2({
                width: '100%',
                minimumResultsForSearch: -1
            });
        },
                
        // TO DO: Remove
        styleRadio: function () {
            $('.icheck').iCheck({
                checkboxClass: 'icheckbox_flat-blue',
                radioClass: 'iradio_flat-blue'
            });

            $('.iradio_flat-green').first().addClass('checked');
        },
		
        // TO DO: Remove
		styleSelect: function (clone) {
            clone.find(".select2").select2({
                width: '100%',
                minimumResultsForSearch: -1
            });
        },
		
		initProductAutocomplete: function (productItem) {
			var thisObj = this;
			
			var products = this.productAutoCompletePool;
			
			productItem.find('.productname').autocomplete({
				source:products,
				select: function (ev, ui) {
					var productField = $(ev.target);
					productField.siblings('.product_id').val(ui.item.id);
					productField.val(ui.item.label);
					return false;
				},
			});
		},
		
		getProductDropdown: function () {
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.productCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		addIndexToProductFields: function (bidProductItem) {
			var productFieldClass = this.options.productFieldClass;
			for(var i=0; i < productFieldClass.length; i++) {
				var field = bidProductItem.find('.'+productFieldClass[i]);
				var name = field.attr('name');
				field.attr('name', name + this.options.productFieldSeparator + this.options.productFieldCounter);
			}
			
			this.options.productFieldCounter++;
		},
		
		addValidationToProduct: function (clone) {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				clone.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},
		
		formatFormField: function (data) {
			var formData = {products:[]};
			var productFieldClass = this.options.productFieldClass;
			
			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.productFieldSeparator);
					
					if(arrayKey.length < 2)
						formData[key] = value;
					else {
						if(arrayKey[0] == productFieldClass[0]) {
							var index = arrayKey[1];
							var arrayBidProductFields = {};
							
							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0) {
									
									var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+index];
									if(!(productFieldClass[i] == 'id' && fieldValue == ''))
										arrayBidProductFields[productFieldClass[i]] = fieldValue;
								}
							}
								
							formData.products.push(arrayBidProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #add-product': 'addProduct',
			'click .remove-product': 'removeProduct',
			//'blur .productname': 'validateProduct',
			'blur .unitprice': 'onBlurUnitPrice',
			'keyup .unitprice': 'onKeyUpUnitPrice',
			'keyup .tons': 'onKeyUpTons',
			'click #convert-po': 'convertPO',
			'click #cancel-po': 'showConfirmationWindow',
			'click #confirm-cancel-po': 'cancelPO',
		},
		
		removeProduct: function (ev) {
			$(ev.currentTarget).closest('tr').remove();
			
			if(!this.hasProduct())
				this.addProduct();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
		
		validateProduct: function (ev) {
			var field = $(ev.target);
			var name = field.val();
			var id = field.siblings('.product_id').val();
			var product = this.isInProductAutoCompletePool(name);
			
			if(product === false) {
				this.emptyProductFields(field);
			}
			else {
				field.val(product.name);
				field.siblings('.product_id').val(product.id);
			}
		},
		
		isInProductAutoCompletePool: function (value) {
			for(var i = 0; i < this.productAutoCompletePool.length; i++) {
				if(this.productAutoCompletePool[i].value.toLowerCase() == value.toLowerCase()) {
					return {id:this.productAutoCompletePool[i].id, name:this.productAutoCompletePool[i].value};
				}
			}
			return false;
		},
		
		emptyProductFields: function (field) {
			field.val('');
			field.siblings('.product_id').val('');
		},
		
		onBlurUnitPrice: function (ev) {
			var field = $(ev.target);
			var bidPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.tons');
			var tons = (!isNaN(parseFloat(tonsField.val())))? parseFloat(tonsField.val()) : 0;
			
			field.val(bidPrice);
			this.toFixedValue(field, 2)
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpUnitPrice: function (ev) {
			var field = $(ev.target);
			var bidPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.tons');
			var tons = (!isNaN(parseFloat(tonsField.val())))? parseFloat(tonsField.val()) : 0;
			
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpTons: function (ev) {
			var field = $(ev.target);
			
			var tons = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var bidPriceField = field.closest('.product-item').find('.unitprice');
			var bidPrice = (!isNaN(parseFloat(bidPriceField.val())))? parseFloat(bidPriceField.val()) : 0;
			
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		computeUnitePrice: function (bidPrice, tonsOrBales, unitePriceField) {
			var unitPrice = 0;
			unitPrice = tonsOrBales * bidPrice;
			unitePriceField.val(unitPrice.toFixed(2));
		},
		
		cancelPO: function () {
			if(this.poId != null) {
				var thisObj = this;
				var purchaseOrderModel = new PurchaseOrderModel({id:this.poId});
                purchaseOrderModel.setCancelURL();
                purchaseOrderModel.save(
                    null, 
                    {
                        success: function (model, response, options) {
                            thisObj.displayMessage(response);
                            Global.getGlobalVars().app_router.navigate(Const.URL.PO, {trigger: true});
                        },
                        error: function (model, response, options) {
                            if(typeof response.responseJSON.error == 'undefined')
                                validate.showErrors(response.responseJSON);
                            else
                                thisObj.displayMessage(response);
                        },
                        headers: purchaseOrderModel.getAuth(),
                    }
                );
			}
			return false;
		},
		
		convertPO: function () {
			this.isConvertToPO = true;
			$('#poForm').submit();
		},
		
		otherInitializations: function () {},
	});

  return PurchaseOrderAddView;
  
});