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
	'collections/contact/ContactCollection',
	'models/purchaseorder/PurchaseOrderModel',
	'models/file/FileModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddTemplate.html',
	'text!templates/purchaseorder/purchaseOrderProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'text!templates/purchaseorder/convertToPOFormTemplate.html',
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
			ContactCollection,
			PurchaseOrderModel,
			FileModel,
			contentTemplate,
			purchaseOrderAddTemplate,
			productItemTemplate,
			purchaseOrderDestinationTemplate,
			convertToPOFormTemplate,
			Global,
			Const
){

	var PurchaseOrderAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		producerAutoCompleteView: null,
		
		initialize: function() {
			this.initSubContainer();
			this.isBid = false;
			this.isConvertToPO = false;
			this.poId = null;
			this.h1Title = 'Purchase Order';
			this.h1Small = 'add';
			
			this.inits();
		},
		
		inits: function () {
			var thisObj = this;
			
			this.bidTransportdateStart = null;
			this.bidTransportdateEnd = null;
			this.bidLocationId = null;
			
			this.currentProducerId = null;
			this.producerAccountContactId = null;
			
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'description', 'stacknumber', 'unitprice', 'tons', 'bales', 'ishold', 'id', 'rfv', 'uploadedfile'],
				productFieldClassRequired: ['product_id', 'stacknumber', 'unitprice', 'tons', 'bales'],
				productFieldExempt: [],
				productFieldSeparator: '.',
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
		},
		
		render: function(){
			this.destinationCollection.getModels();
			Backbone.View.prototype.refreshTitle('Purchase Order','add');
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
			this.subContainer.html(compiledTemplate);
			
			this.initValidateForm();
			
			this.generateDestination();
			this.initProducerAutocomplete();
			this.initCalendar();
			this.addProduct();
            this.initPDFUpload();
			this.options.fileFileClone = $('#pdf-file').clone(true);
			
			this.otherInitializations();
			this.postDisplayForm();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#poForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					
					if(thisObj.isBid)
						data['isfrombid'] = '1';
					
					if(thisObj.isConvertToPO) {
						data['createPO'] = '1';
						data['transportdatestart'] = thisObj.bidTransportdateStart;
						data['transportdateend'] = thisObj.bidTransportdateEnd;
						data['location_id'] = thisObj.bidLocationId;
					}
					
					if(typeof data['transportdatestart'] != 'undefined')
						data['transportdatestart'] = thisObj.convertDateFormat(data['transportdatestart'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					if(typeof data['transportdateend'] != 'undefined')
						data['transportdateend'] = thisObj.convertDateFormat(data['transportdateend'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					
					// console.log(data);
					
					var purchaseOrderModel = new PurchaseOrderModel(data);
					
					purchaseOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								if(thisObj.isConvertToPO) {
									thisObj.isConvertToPO = false;
									thisObj.hideConfirmationWindow('modal-with-form-confirm', function () {
										thisObj.displayMessage(response);
										Backbone.history.history.back();
									});
								}
								else {
									thisObj.isConvertToPO = false;
									thisObj.displayMessage(response);
									Backbone.history.history.back();
								}
							},
							error: function (model, response, options) {
								if(thisObj.isConvertToPO) {
									thisObj.hideConfirmationWindow('modal-with-form-confirm');
								}
								
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
		
		getDestination: function () {
			return _.template(purchaseOrderDestinationTemplate, {'destinations': this.destinationCollection.models});
		},
		
		generateDestination: function () {
			var destinationTemplate = this.getDestination();
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
				
				if(thisObj.currentProducerId != model.get('id')) {
					thisObj.currentProducerId = model.get('id');
					thisObj.showFieldThrobber('#contact_id');
					thisObj.resetSelect(thisObj.subContainer.find('#contact_id'));
					thisObj.producerAccountCollection.getContactsByAccountId(thisObj.currentProducerId);
				}
			};
			
			this.producerAutoCompleteView.typeInCallback = function (result) {
				var address = result.address;
				thisObj.$el.find('#street').val(address[0].street);
				if(address[0].address_states.length > 0 && typeof address[0].address_states[0].state != 'undefined')
					thisObj.$el.find('#state').val(address[0].address_states[0].state);
				else if(typeof address[0].address_states.state != 'undefined')
					thisObj.$el.find('#state').val(address[0].address_states.state);
				thisObj.$el.find('#city').val(address[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
				
				if(thisObj.currentProducerId != result.id) {
					thisObj.currentProducerId = result.id;
					thisObj.showFieldThrobber('#contact_id');
					thisObj.resetSelect(thisObj.subContainer.find('#contact_id'));
					thisObj.producerAccountCollection.getContactsByAccountId(thisObj.currentProducerId);
				}
			},
			
			this.producerAutoCompleteView.typeInEmptyCallback = function () {
				thisObj.$el.find('#street').val('');
				thisObj.$el.find('#state').val('');
				thisObj.$el.find('#city').val('');
				thisObj.$el.find('#zipcode').val('');
				
				thisObj.resetSelect(thisObj.subContainer.find('#contact_id'));
			},
			
			this.producerAutoCompleteView.render();
		},
		
		initCalendar: function () {
			var thisObj = this;
			
			this.$el.find('#start-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#start-date .input-group.date input').val();
				thisObj.$el.find('#end-date .input-group.date').datepicker('setStartDate', selectedDate);
			});
			
			this.$el.find('#end-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#end-date .input-group.date input').val();
				thisObj.$el.find('#start-date .input-group.date').datepicker('setEndDate', selectedDate);
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
			return clone;
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
				var rules = {};
				
				if(productFieldClassRequired[i] == 'rfv')
					rules = {require_rfv: true};
				else
					rules = {required: true};
				
				clone.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', rules);
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
						if(this.options.removeComma.indexOf(key) < 0)
							formData[key] = value;
						else
							formData[key] = this.removeCommaFromNumber(value);
					else {
						if(arrayKey[0] == productFieldClass[0]) {
							var index = arrayKey[1];
							var arrayProductFields = {};
							
							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0) {
									var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+index];
									
									if(!(productFieldClass[i] == 'id' && fieldValue == '')) {
										if(this.options.removeComma.indexOf(productFieldClass[i]) < 0)
											arrayProductFields[productFieldClass[i]] = fieldValue;
										else
											arrayProductFields[productFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
									}
								}
							}
								
							formData.products.push(arrayProductFields);
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
			'keyup .unitprice': 'onKeyUpUnitPrice',
			'blur .unitprice': 'onBlurMoney',
			'keyup .tons': 'onKeyUpTons',
			'blur .tons': 'onBlurTon',
			'keyup .bales': 'onKeyUpBales',
			//'click #convert-po': 'convertPO',
			'click #convert-po': 'showConvertToPOConfirmationWindow',
			'click #confirm-convert-po': 'convertPO',
			'click #cancel-po': 'showConfirmationWindow',
			'click #confirm-cancel-po': 'cancelPO',
			'click .attach-pdf': 'attachPDF',
			
			'change #pdf-file': 'readFile',
			'click #remove-pdf-filename': 'resetImageField',
			'click #undo-remove': 'undoRemove',
		},
		
		removeProduct: function (ev) {
			$(ev.currentTarget).closest('tr').remove();
			
			if(!this.hasProduct())
				this.addProduct();
				
			this.computeTotals();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
		
		computeTotals: function () {
			this.computeTotalUnitPrice();
			this.computeTotalTons();
			this.computeTotalBales();
			
			this.subContainer.find('#product-list tbody .product-item').each(function () {
				$(this).find('.unitprice').trigger('keyup');
			});
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
			// this.toFixedValue(field, 2);
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpUnitPrice: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 2);
			
			var bidPricefield = $(ev.target);
			var bidPricefieldVal = this.removeCommaFromNumber(bidPricefield.val());
			var bidPrice = (!isNaN(parseFloat(bidPricefieldVal)))? parseFloat(bidPricefieldVal) : 0;
			var tonsField = bidPricefield.closest('.product-item').find('.tons');
			var tonsFieldVal = this.removeCommaFromNumber(tonsField.val());
			var tons = (!isNaN(parseFloat(tonsFieldVal)))? parseFloat(tonsFieldVal) : 0;
			
			this.computeUnitePrice(bidPrice, tons, bidPricefield.closest('.product-item').find('.unit-price'));
			
			this.computeTotalUnitPrice();
		},
		
		computeTotalUnitPrice: function () {
			var thisObj = this;
			var total = 0;
			this.subContainer.find('#product-list .unitprice').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			this.subContainer.find('#total-unitprice').val(thisObj.addCommaToNumber(total.toFixed(2)));
		},
		
		onKeyUpTons: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
			
			var tonsfield = $(ev.target);
			var tonsfieldVal = this.removeCommaFromNumber(tonsfield.val());
			var tons = (!isNaN(parseFloat(tonsfieldVal)))? parseFloat(tonsfieldVal) : 0;
			var bidPriceField = tonsfield.closest('.product-item').find('.unitprice');
			var bidPriceFieldVal = this.removeCommaFromNumber(bidPriceField.val());
			var bidPrice = (!isNaN(parseFloat(bidPriceFieldVal)))? parseFloat(bidPriceFieldVal) : 0;
			
			this.computeUnitePrice(bidPrice, tons, tonsfield.closest('.product-item').find('.unit-price'));
			
			this.computeTotalTons();
		},
		
		computeTotalTons: function () {
			var thisObj = this;
			var total = 0;
			this.subContainer.find('#product-list .tons').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			this.subContainer.find('#total-tons').val(thisObj.addCommaToNumber(total.toFixed(4)));
		},
		
		computeUnitePrice: function (bidPrice, tonsOrBales, unitePriceField) {
			var unitPrice = 0;
			unitPrice = tonsOrBales * bidPrice;
			unitePriceField.val(this.addCommaToNumber(unitPrice.toFixed(2)));
			
			this.computeTotalPrice();
		},
		
		computeTotalPrice: function () {
			var thisObj = this;
			var total = 0;
			this.subContainer.find('#product-list .unit-price').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			this.subContainer.find('#total-price').val(thisObj.addCommaToNumber(total.toFixed(2)));
		},
		
		onKeyUpBales: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target);
			
			this.computeTotalBales();
		},
		
		computeTotalBales: function () {
			var thisObj = this;
			var total = 0;
			this.subContainer.find('#product-list .bales').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseInt(value)))? parseInt(value) : 0;
			});
			this.subContainer.find('#total-bales').val(thisObj.addCommaToNumber(total));
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
                            //Global.getGlobalVars().app_router.navigate(Const.URL.PO, {trigger: true});
							Backbone.history.history.back();
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
		
		initPDFUpload: function () {
			var thisObj = this;
			this.initAttachPDFWindow();
			
			this.$el.find('#modal-attach-pdf').on('hidden.bs.modal', function (e) {
				var fieldName = thisObj.$el.find('#pdf-field').val();
				var field = thisObj.$el.find('[name="'+fieldName+'"]');
				
				if(thisObj.$el.find('#upload-field-cont').css('display') != 'none') {
					//console.log('empty');
					field.val('');
					field.attr('data-filename', '');
					field.closest('td').find('.attach-pdf').addClass('no-attachment');
				}
				else {
					//console.log('not empty');
					var pdfFilenameElement = thisObj.$el.find('#pdf-filename');
					field.val(pdfFilenameElement.attr('data-id'));
					field.attr('data-filename', pdfFilenameElement.text());
					field.closest('td').find('.attach-pdf').removeClass('no-attachment');
				}
			});
		},
		
		attachPDF: function (ev) {
			var field = $(ev.currentTarget).closest('td').find('.uploadedfile');
			this.$el.find('#pdf-field').val(field.attr('name'));
			
			var clone = this.options.fileFileClone.clone(true);
			this.$el.find("#pdf-file").replaceWith(clone);
			
			if(field.val() == '') {
				this.$el.find('#pdf-icon-cont').hide();
				this.$el.find('#undo-remove').hide();
				this.$el.find('#upload-field-cont').show();
			}
			else {
				this.$el.find('#upload-field-cont').hide();
				this.$el.find('#pdf-icon-cont').show();
				this.$el.find('#pdf-filename').text(field.attr('data-filename'));
				this.$el.find('#pdf-filename').attr('data-id', field.val());
				
				this.$el.find('#previous-upload').val(field.attr('data-filename'));
				this.$el.find('#previous-upload').attr('data-id', field.val());
			}
			
			this.$el.find('#upload-error').hide();
			this.showConfirmationWindow('modal-attach-pdf');
			return false;
		},
		
		readFile: function (ev) {
			this.$el.find('#upload-error').hide();
			
			var thisObj = this;
			var file = ev.target.files[0];
			
			if(file.type != Const.MIMETYPE.PDF) {
				var clone = this.options.fileFileClone.clone(true);
				this.$el.find('#pdf-file').replaceWith(clone);
				this.$el.find('#upload-error').text('only upload a PDF file').show();
			}
			else {
				var reader = new FileReader();
				reader.onload = function (event) {
					//console.log('onload');
					//console.log(event);
					
					thisObj.uploadFile({
						type: file.type,
						size: file.size,
						name: file.name,
						content: event.target.result
					});
				};
				reader.readAsDataURL(file);
			}
		},
		
		uploadFile: function (data) {
			this.disableCloseButton('modal-attach-pdf');
			this.showFieldThrobber('#pdf-file');
			
			var thisObj = this;
			var fileModel = new FileModel(data);
			fileModel.save(
				null, 
				{
					success: function (model, response, options) {
						data['id'] = response;
						//console.log(response);
						thisObj.generatePDFIcon(data);
						thisObj.enableCloseButton('modal-attach-pdf');
						thisObj.hideFieldThrobber();
					},
					error: function (model, response, options) {
						thisObj.enableCloseButton('modal-attach-pdf');
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							thisObj.displayMessage(response);
						thisObj.hideFieldThrobber();
					},
					headers: fileModel.getAuth(),
				}
			);
		},
		
		generatePDFIcon: function (data) {
			var clone = this.options.fileFileClone.clone(true);
			this.$el.find("#pdf-file").replaceWith(clone);
			this.$el.find('#pdf-filename').text(data.name);
			this.$el.find('#pdf-filename').attr('data-id', data.id);
			
			this.$el.find('#previous-upload').val(data.name);
			this.$el.find('#previous-upload').attr('data-id', data.id);
			
			this.$el.find('#upload-field-cont').hide();
			this.$el.find('#pdf-icon-cont').show();
		},
		
		resetImageField: function () {
			var clone = this.options.fileFileClone.clone(true);
			this.$el.find("#pdf-file").replaceWith(clone);
			
			this.$el.find('#pdf-icon-cont').hide();
			this.$el.find('#undo-remove').show();
			this.$el.find('#upload-field-cont').show();
			
			return false;
		},
		
		undoRemove: function () {
			var field = this.$el.find('#previous-upload');
			
			this.$el.find('#pdf-filename').text(field.val());
			this.$el.find('#pdf-filename').attr(field.attr('data-id'));
			
			this.$el.find('#upload-field-cont').hide();
			this.$el.find('#pdf-icon-cont').show();
			
			return false;
		},
		
		showConvertToPOConfirmationWindow: function (ev) {
			this.showConfirmationWindow('modal-with-form-confirm');
			return false;
		},
		
		initConvertToPOWindow: function () {
			var thisObj = this;
			var form = _.template(convertToPOFormTemplate, {'destination': this.getDestination()});
			
			this.initConfirmationWindowWithForm('',
										'confirm-convert-po',
										'Convert To PO',
										form,
										'Convert To Purchase Order');
			
			this.$el.find('#bid-destination .radio-inline:first-child input[type="radio"]').attr('checked', true);
			$('#modal-with-form-confirm .i-circle.warning').remove();
			$('#modal-with-form-confirm h4').remove();
			
			this.initConvertPOCalendar();
			
			var validate = $('#convertToPOForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					//console.log(data);
					
					thisObj.bidTransportdateStart = data.transportdatestart;
					thisObj.bidTransportdateEnd = data.transportdateend;
					thisObj.bidLocationId = data.location_id;
					
					thisObj.isConvertToPO = true;
					thisObj.subContainer.find('#poForm').submit();
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
		
		convertPO: function () {
			this.subContainer.find('#convertToPOForm').submit();
			return false;
		},
		
		initConvertPOCalendar: function () {
			var thisObj = this;
			
			this.$el.find('#bid-start-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#bid-start-date .input-group.date input').val();
				thisObj.$el.find('#bid-end-date .input-group.date').datepicker('setStartDate', selectedDate);
			}).on('show', function (ev) {
				setTimeout(function(){
					$('.datepicker.datepicker-dropdown.dropdown-menu').css('z-index', 99999999999999);
				}, 0);
			});
			
			this.$el.find('#bid-end-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#bid-end-date .input-group.date input').val();
				thisObj.$el.find('#bid-start-date .input-group.date').datepicker('setEndDate', selectedDate);
			}).on('show', function (ev) {
				setTimeout(function(){
					$('.datepicker.datepicker-dropdown.dropdown-menu').css('z-index', 99999999999999);
				}, 0);
			});
		},
		
		generateProducerAccountContacts: function () {
			var dropDown = '';
			_.each(this.producerAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#contact_id').append(dropDown);
			
			if(typeof this.producerAccountContactId != 'undefined' && this.producerAccountContactId != null) {
				this.$el.find('#contact_id').val(this.producerAccountContactId);
				this.producerAccountContactId = null;
			}
			else {
				if(this.producerAccountCollection.models.length == 1)
					this.$el.find('#contact_id').val(this.producerAccountCollection.models[0].get('id')).change();
			}
		},
		
		otherInitializations: function () {},
		postDisplayForm: function () {},
	});

  return PurchaseOrderAddView;
  
});