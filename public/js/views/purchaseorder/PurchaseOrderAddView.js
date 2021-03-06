define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'base64',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountProducerCollection',
	'collections/account/AccountCustomerCollection',
	'collections/purchaseorder/DestinationCollection',
	'collections/product/ProductCollection',
	'collections/contact/ContactCollection',
	'collections/inventory/StackNumberCollection',
	'collections/stack/LocationCollection',
	'collections/contract/ContractByAccountCollection',	
	'models/purchaseorder/PurchaseOrderModel',
	'models/document/DocumentModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddTemplate.html',
	'text!templates/purchaseorder/purchaseOrderProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderSubProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'text!templates/purchaseorder/convertToPOFormTemplate.html',
	'text!templates/salesorder/salesOrderContractTemplate.html',	
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			Base64,
			CustomAutoCompleteView,
			AccountProducerCollection,
			AccountCustomerCollection,
			DestinationCollection,
			ProductCollection,
			ContactCollection,
			StackNumberCollection,
			LocationCollection,
			ContractByAccountCollection,			
			PurchaseOrderModel,
			DocumentModel,
			contentTemplate,
			purchaseOrderAddTemplate,
			productItemTemplate,
			productSubItemTemplate,
			purchaseOrderDestinationTemplate,
			convertToPOFormTemplate,
			contractTemplate,			
			Global,
			Const
){

	var PurchaseOrderAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			this.isBid = false;
			this.isConvertToPO = false;
			this.poId = null;
			this.h1Title = 'Purchase Order';
			this.h1Small = 'add';
			this.isInitProcess = false;
			this.soProducts = [];
			this.soProductsIndex = 0;
			this.inits();
		},
		
		inits: function () {
			var thisObj = this;
			
			this.producerAutoCompleteView = null;
			this.customerAutoCompleteView = null;
			this.isInitCustomerAutoCompleteView = false;
			
			this.isSaveAndCheckIn = false;
			
			this.bidTransportdateStart = null;
			this.bidTransportdateEnd = null;
			this.bidLocationId = null;
			this.bidContractId = null;

			this.currentProducerId = null;
			this.currentCustomerId = null;
			this.producerAccountContactId = null;
			
			this.productAutoCompletePool = [];
			this.stackNumberByProductPool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'tons', 'id'],
				productFieldClassRequired: ['product_id', 'tons'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				productSubFieldClone: null,
				productSubFieldCounter: 0,
				productSubFieldClass: ['stacknumber', 'section_id', 'description', 'unitprice', 'tons', 'bales', 'id', 'ishold', 'rfv', 'uploadedfile'],
				productSubFieldClassRequired: ['stacknumber', 'section_id', 'unitprice', 'tons', 'bales'],
				productSubFieldExempt: [],
				productSubFieldSeparator: '.',
				removeComma: ['unitprice', 'tons', 'bales'],
				fileFileClone: null,
			};			
			
			this.destinationCollection = new DestinationCollection();
			this.destinationCollection.on('sync', function() {	
				thisObj.productCollection.getAllModel();
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
				
				if(thisObj.subContainerExist()) {
					thisObj.isInitProcess = false;
					thisObj.displayForm();
				}
				
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
				
				if(!thisObj.isInitProcess) {
					thisObj.initStackNumberAutocomplete(thisObj.subContainer.find('.product-stack-table tbody[data-id="'+option.dataId+'"] .stacknumber'), option.id);
					thisObj.hideFieldThrobber('.product-stack-table tbody[data-id="'+option.dataId+'"] .stacknumber');
				}
				else {
					thisObj.soProductsIndex++;
					if(thisObj.soProductsIndex < thisObj.soProducts.length)
						this.getStackNumbersByProduct({id:thisObj.soProducts[thisObj.soProductsIndex]});
					else
						thisObj.destinationCollection.getModels();
				}
			});
			this.stackNumberCollection.on('error', function(collection, response, options) {
			});
			
			this.locationCollection = new LocationCollection();
			this.locationCollection.on('sync', function() {
				if(!thisObj.isInitProcess) {
					thisObj.generateLocationFromDropDown();
					thisObj.hideFieldThrobber('.section_id');
				}
				else
					thisObj.stackNumberCollection.getStackNumbersByProduct({id:thisObj.soProducts[thisObj.soProductsIndex]});
			});
			this.locationCollection.on('error', function(collection, response, options) {
				
			});
			
			this.contractByAccountCollection = new ContractByAccountCollection();
            this.contractByAccountCollection.on('sync', function() {
				if(!thisObj.isInitProcess)
					thisObj.generateContract();
				else
					thisObj.contractProductsCollection.getContractProducts(thisObj.model.get('contract_id'));
				//this.off('sync');
			});
			this.contractByAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.contractProductsCollection = new ProductCollection();
			this.contractProductsCollection.on('sync', function() {
				if(!thisObj.isInitProcess)
					thisObj.generateContractProductDropdown();
				else
					thisObj.locationCollection.getLocationByAccount(thisObj.model.get('account_id'));
				//this.off('sync');
			});
			this.contractProductsCollection.on('error', function(collection, response, options) {
				this.off('error');
			});			
			
		},
		
		render: function(){
			this.destinationCollection.getModels();	
			this.updatePageTitle();
		},

		updatePageTitle: function(){
			if(this.isBid){
				Backbone.View.prototype.refreshTitle('BID','add');	
			}
			else {
				Backbone.View.prototype.refreshTitle('Purchase Order','add');
			}
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'po_url' : '#/'+Const.URL.PO,
			};
			
			if(this.isBid){
				innerTemplateVariables['is_bid'] = true;
			}
			
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
						
			this.postDisplayForm();

			this.otherInitializations();	

			//Changes to hide Customer/Customer Contract fields
			if(!this.isBid && typeof this.model != "undefined" && this.model.get('location').id == Const.PO.DESTINATION.DROPSHIP){
				this.toggleSOFields(thisObj.subContainer.find('input[name=location_id]:checked').val());
			}
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#poForm').validate({
				submitHandler: function(form) {					
					var data = thisObj.formatFormField($(form).serializeObject());
					
					if(thisObj.isBid)
						data['isfrombid'] = '1';
					
					if(thisObj.isConvertToPO) {
						data['isfrombid'] = '0';
						data['createPO'] = '1';
						data['transportdatestart'] = thisObj.bidTransportdateStart;
						data['transportdateend'] = thisObj.bidTransportdateEnd;
						data['location_id'] = thisObj.bidLocationId;
						data['contract_id'] = thisObj.bidContractId;
					}
					else if(thisObj.isSaveAndCheckIn)
						data['checkinorder'] = true;
					
					if(typeof data['transportdatestart'] != 'undefined')
						data['transportdatestart'] = thisObj.convertDateFormat(data['transportdatestart'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					if(typeof data['transportdateend'] != 'undefined')
						data['transportdateend'] = thisObj.convertDateFormat(data['transportdateend'], thisObj.dateFormat, 'yyyy-mm-dd', '-');					

					var purchaseOrderModel = new PurchaseOrderModel(data);
					
					purchaseOrderModel.save(
						null, 
						{
							success: function (model, response, options) { //console.log(response);
								if(thisObj.isConvertToPO) {
									thisObj.isConvertToPO = false;
									thisObj.hideConfirmationWindow('modal-with-form-confirm', function () {
										thisObj.displayMessage(response);
										Backbone.history.history.back();
									});
								}
								else if(thisObj.isSaveAndCheckIn) {
									thisObj.isSaveAndCheckIn = false;
									thisObj.hideConfirmationWindow('modal-confirm', function () {
										thisObj.displayMessage(response);
										var destinationId = thisObj.subContainer.find('input[name=location_id]:checked').val();
										if(destinationId == Const.PO.DESTINATION.DROPSHIP) {
											Global.getGlobalVars().fromPOId = parseInt(response.purchaseorder_id);
											Backbone.history.navigate(Const.URL.SO+'/'+Const.CRUD.ADD, {trigger: true});
										}
										else{
											Backbone.history.history.back();
										}
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
									thisObj.isConvertToPO = false;
									thisObj.hideConfirmationWindow('modal-with-form-confirm');
								}
								else if(thisObj.isSaveAndCheckIn) {
									thisObj.isSaveAndCheckIn = false;
									thisObj.hideConfirmationWindow();
								}
								
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
					if(thisObj.isConvertToPO) {
						thisObj.isConvertToPO = false;
						thisObj.hideConfirmationWindow('modal-with-form-confirm');
					}
					else if(thisObj.isSaveAndCheckIn) {
						thisObj.isSaveAndCheckIn = false;
						thisObj.hideConfirmationWindow();
					}
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
			this.subContainer.find('[name="location_id"][value="'+Const.PO.DESTINATION.SWFARMS+'"]').attr('checked', true);
		},
		
		initProducerAutocomplete: function () {
			var thisObj = this;
			
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
					thisObj.resetSelect(thisObj.subContainer.find('.section_id'));
					thisObj.locationCollection.getLocationByAccount(thisObj.currentProducerId);
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
					thisObj.showFieldThrobber('.section_id');
					thisObj.resetSelect(thisObj.subContainer.find('.section_id'));
					thisObj.locationCollection.getLocationByAccount(thisObj.currentProducerId);
				}
			},
			
			this.producerAutoCompleteView.typeInEmptyCallback = function () {
				thisObj.$el.find('#street').val('');
				thisObj.$el.find('#state').val('');
				thisObj.$el.find('#city').val('');
				thisObj.$el.find('#zipcode').val('');
				
				thisObj.resetSelect(thisObj.subContainer.find('#contact_id'));
				thisObj.resetSelect(thisObj.subContainer.find('.section_id'));
				
				thisObj.currentProducerId = null;
			},
			
			this.producerAutoCompleteView.render();
		},
		
		initCustomerAutocomplete: function (input, hidden, contractId) {
			var thisObj = this;
			
			var accountCustomerCollection = new AccountCustomerCollection();
			this.customerAutoCompleteView = new CustomAutoCompleteView({
                input: $(input),
				hidden: $(hidden),
                collection: accountCustomerCollection,
            });
			
			this.customerAutoCompleteView.onSelect = function (model) {
				thisObj.contractByAccountCollection.getContractByAccount(model.get('id'));
			};
			
			this.customerAutoCompleteView.typeInCallback = function (result) {
				thisObj.contractByAccountCollection.getContractByAccount(result.id);
			},
			
			this.customerAutoCompleteView.typeInEmptyCallback = function () { console.log('typeInEmptyCallback');
				thisObj.currentProducerId = null;
				thisObj.resetSelect(thisObj.subContainer.find(contractId), true);
			},
			
			this.customerAutoCompleteView.render();
			this.isInitCustomerAutoCompleteView = true;
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
				
				this.$el.find('#product-list > tbody').append(productTemplate);
				var productItem = this.$el.find('#product-list > tbody').children();
				this.options.productFieldClone = productItem.clone();
				//this.initProductAutocomplete(productItem);
				this.addIndexToProductFields(productItem);
				clone = productItem;
			}
			else {
				var clone = this.options.productFieldClone.clone();
				this.addIndexToProductFields(clone);
				clone.find('.product_id').html(this.getProductDropdown());
				this.$el.find('#product-list > tbody').append(clone);
			}
				
			this.addValidationToProduct(clone);
			this.addProductSub(clone.find('.product-stack-table'));
			
			return clone;
		},
		
		addProductStack: function (ev) {
			this.addProductSub($(ev.currentTarget).closest('.product-stack').find('table:first'));
		},
		
		addProductSub: function (tableElement) {
			var clone = null;
			var parentId = tableElement.find('tbody').attr('data-id');
			
			if(this.options.productSubFieldClone == null) {
				var productSubTemplateVars = {};
				
				if(this.isBid)
					productSubTemplateVars['is_bid'] = true;
				
				var productSubTemplate = _.template(productSubItemTemplate, productSubTemplateVars);
				tableElement.find('tbody').append(productSubTemplate);
				var productSubItem = tableElement.find('tbody').find('.product-stack-item:first-child');
				this.options.productSubFieldClone = productSubItem.clone();
				this.addIndexToProductSubFields(productSubItem, parentId);
				clone = productSubItem;
			}
			else {
				clone = this.options.productSubFieldClone.clone();
				this.addIndexToProductSubFields(clone, parentId);
				tableElement.find('tbody').append(clone);
				this.initStackNumberAutocomplete(clone.find('.stacknumber'));
				this.generateLocationFromDropDown(clone.find('.section_id'));
			}
			
			this.addValidationToProductSub(clone);
			
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
			if(this.subContainer.find('#contract_id').val() == '')
				return this.getAllProductDropdown();
			else
				return this.getContractProductDropdown();
		},
		
		addIndexToProductFields: function (productFieldItem) {
			var productFieldClass = this.options.productFieldClass;
			for(var i=0; i < productFieldClass.length; i++) {
				var field = productFieldItem.find('.'+productFieldClass[i]);
				var name = field.attr('name');
				field.attr('name', name + this.options.productFieldSeparator + this.options.productFieldCounter);
			}
			
			productFieldItem.find('.product-stack-table tbody').attr('data-id', this.options.productFieldCounter);
			this.options.productFieldCounter++;
		},
		
		addIndexToProductSubFields: function (productSubFieldItem, parentIndex) {
			var productSubFieldClass = this.options.productSubFieldClass;
			for(var i=0; i < productSubFieldClass.length; i++) {
				var field = productSubFieldItem.find('.'+productSubFieldClass[i]);
				var name = field.attr('name');
				field.attr('name', name + this.options.productFieldSeparator + parentIndex + this.options.productSubFieldSeparator + this.options.productSubFieldCounter);
			}
			
			this.options.productSubFieldCounter++;
		},
		
		addValidationToProduct: function (clone) {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				var rules = {};
				
				if(productFieldClassRequired[i] == 'rfv')
					rules = {require_rfv: true};
				else if(productFieldClassRequired[i] == 'tons')
					rules = {non_zero: true, required: true};				
				else
					rules = {required: true};
				
				clone.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', rules);
				});
			}
		},

		addValidationToProductSub: function (clone) {
			var thisObj = this;
			var productSubFieldClassRequired = this.options.productSubFieldClassRequired;			
			for(var i=0; i < productSubFieldClassRequired.length; i++) {
				var rules = {};

				if(productSubFieldClassRequired[i] == 'tons' || productSubFieldClassRequired[i] == 'bales' || productSubFieldClassRequired[i] == 'unitprice')
					rules = {non_zero: true, required: true};				
				else
					rules = {required: true};

				clone.find('.'+productSubFieldClassRequired[i]).each(function() {
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

					if(arrayKey.length < 2) {						
						if(this.options.removeComma.indexOf(key) < 0)
							formData[key] = value;
						
						else {
							formData[key] = this.removeCommaFromNumber(value);						
						}
					}
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
										else {
											arrayProductFields[productFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
										}					
									}
								}
							}

							arrayProductFields['stacks'] = this.getProductStackFields(data, index, {
								'product_id': arrayProductFields.product_id,
								//'unitprice': arrayProductFields.unitprice,
							});
							
							formData.products.push(arrayProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		getProductStackFields: function (data, productIndex, otherData) {	
			var stacks = [];
			var productFieldClass = this.options.productSubFieldClass;

			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.productFieldSeparator);


					if(arrayKey.length > 2 && arrayKey[0] == productFieldClass[0] && arrayKey[1] == productIndex) {
						var index = arrayKey[2];
						var arrayProductFields = {};
						
						for(var i = 0; i < productFieldClass.length; i++) {
							if(this.options.productSubFieldExempt.indexOf(productFieldClass[i]) < 0) {	
								var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+productIndex+this.options.productSubFieldSeparator+index];
								if(!(productFieldClass[i] == 'id' && fieldValue == '')) {
									if(this.options.removeComma.indexOf(productFieldClass[i]) < 0){
										arrayProductFields[productFieldClass[i]] = fieldValue;
									}
									else{										
										arrayProductFields[productFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
									}
								}
							}
						}
						
						arrayProductFields = _.extend(arrayProductFields, otherData);
						
						stacks.push(arrayProductFields);
					}
				}
			}
			
			return stacks;
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #add-product': 'addProduct',
			'click .add-product-stack': 'addProductStack',
			'click .remove-product': 'removeProduct',
			'click .remove-product-stack': 'removeProductStack',
			//'blur .productname': 'validateProduct',
			'keyup .unitprice': 'onKeyUpUnitPrice',
			'blur .unitprice': 'onBlurMoney',
			'keyup .tons': 'onKeyUpTons',
			'blur .tons': 'onBlurTon',
			'keyup .bales': 'onKeyUpBales',
			//'click #convert-po': 'convertPO',
			'click #convert-po': 'showConvertToPOConfirmationWindow',
			'click #confirm-convert-po': 'convertPO',
			'click .attach-pdf': 'attachPDF',
			
			'change #pdf-file': 'readFile',
			'click #remove-pdf-filename': 'resetImageField',
			'click #undo-remove': 'undoRemove',
			'click .view-file': 'viewFile',
			
			'change .product_id': 'generateStackNumberSuggestions',
			'blur .stacknumber': 'generatePrice',
			'click #save-and-check-in': 'showSaveAndCheckInConfirmationWindow',
			'click #confirm-save-and-check-in-order': 'saveAndCheckIn',
			'change .location_id': 'onChangeDestination',
			'change #contract_id': 'onChangeContract',
			'change #ds_contract_id': 'onChangeContract',
			
		},		
		
		removeProduct: function (ev) {
			var tr = $(ev.currentTarget).closest('tr');
			tr.next().remove();
			tr.remove();
			
			if(!this.hasProduct())
				this.addProduct();
				
			this.computeTotals();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
		
		removeProductStack: function (ev) {
			var tr = $(ev.currentTarget).closest('tr');
			var table = tr.closest('table');
			tr.remove();
			
			if(!this.hasProductSub(table))
				this.addProductSub(table);
			
			this.computeTotalsPerProduct(table);
		},
		
		hasProductSub: function (tableElement) {
			//console.log('hasProductSub: '+tableElement.find('tbody .product-stack-item').length);
			return (tableElement.find('tbody .product-stack-item').length)? true : false;
		},
		
		computeTotals: function () {
			this.computeTotalTons();
			this.computeTotalTotalTotalPrice();
		},
		
		computeTotalsPerProduct: function (tableElement) {
			this.computeTotalTonsPerProduct(tableElement);
			this.computeTotalTotalPrice(tableElement);
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
		
		onKeyUpUnitPrice: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 2);
			
			var unitPricefield = $(ev.target);
			var unitPricefieldVal = this.removeCommaFromNumber(unitPricefield.val());
			var unitPrice = (!isNaN(parseFloat(unitPricefieldVal)))? parseFloat(unitPricefieldVal) : 0;
			var tonsField = unitPricefield.closest('.product-stack-item').find('.tons');
			var tonsFieldVal = this.removeCommaFromNumber(tonsField.val());
			var tons = (!isNaN(parseFloat(tonsFieldVal)))? parseFloat(tonsFieldVal) : 0;
			
			this.computeTotalPrice(unitPrice, tons, unitPricefield.closest('.product-stack-item').find('.unit-price'));
		},
		
		onKeyUpTons: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 3);
			
			var tonsfield = $(ev.target);
			if(tonsfield.closest('.product-stack-item').find('.unitprice').length > 0 && tonsfield.closest('.product-stack-item').find('.unit-price').length > 0) {
				var tonsfieldVal = this.removeCommaFromNumber(tonsfield.val());
				var tons = (!isNaN(parseFloat(tonsfieldVal)))? parseFloat(tonsfieldVal) : 0;
				var unitPriceField = tonsfield.closest('.product-stack-item').find('.unitprice');
				var unitPriceFieldVal = this.removeCommaFromNumber(unitPriceField.val());
				var unitPrice = (!isNaN(parseFloat(unitPriceFieldVal)))? parseFloat(unitPriceFieldVal) : 0;
				
				this.computeTotalPrice(unitPrice, tons, tonsfield.closest('.product-stack-item').find('.unit-price'));
				
				this.computeTotalTonsPerProduct(tonsfield.closest('table'));
			}
			else if(tonsfield.closest('.product-item').length > 0)
				this.computeTotalTons();
		},
		
		computeTotalTons: function () {
			var thisObj = this;
			var total = 0;
			this.subContainer.find('.product-item .tons').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			// this.subContainer.find('#total-tons').val(thisObj.addCommaToNumber(total.toFixed(4)));
			this.subContainer.find('#total-tons').html(Backbone.View.prototype.helpers.numberFormatTons(total));
		},
		
		computeTotalTonsPerProduct: function (tableElement) {
			var thisObj = this;
			var total = 0;
			tableElement.find('.product-stack-item .tons').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			tableElement.find('tfoot .total-tons').val(thisObj.addCommaToNumber(total.toFixed(3)));
		},
		
		computeTotalPrice: function (price, tonsOrBales, unitePriceField) {
			var unitPrice = 0;
			unitPrice = tonsOrBales * price;
			unitePriceField.val(this.addCommaToNumber(unitPrice.toFixed(2)));
			
			this.computeTotalTotalPrice(unitePriceField.closest('table'));
		},
		
		computeTotalTotalPrice: function (tableElement) {
			var thisObj = this;
			var total = 0;
			tableElement.find('.product-stack-item .unit-price').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			
			var formattedTotal = thisObj.addCommaToNumber(total.toFixed(2));
			tableElement.find('tfoot .total-price').val(formattedTotal);
			tableElement.closest('.product-stack').prev('.product-item').find('.unit-price').val(formattedTotal);
			
			this.computeTotalTotalTotalPrice();
		},
		
		computeTotalTotalTotalPrice: function () {
			var thisObj = this;
			var total = 0;
			this.subContainer.find('.product-item .unit-price').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			this.subContainer.find('#total-price').html('$ ' + Backbone.View.prototype.helpers.numberFormat(total));
			this.subContainer.find('#total_payment').val(total);
		},
		
		onKeyUpBales: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target);
			
			//this.computeTotalBales();
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

		viewFile: function(){
			var thisObj = this;
			thisObj.hideConfirmationWindow('modal-attach-pdf');
		},
		
		uploadFile: function (data) {
			this.disableCloseButton('modal-attach-pdf');
			this.showFieldThrobber('#pdf-file');
			
			var thisObj = this;
			var fileModel = new DocumentModel(data);
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
			var dl = {id:data.id, type:'doc'};
			var fileURL = Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize(dl));			

			var clone = this.options.fileFileClone.clone(true);
			this.$el.find("#pdf-file").replaceWith(clone);
			this.$el.find('#pdf-filename').text(data.name);
			this.$el.find('#pdf-filename').attr('data-id', data.id);
			
			this.$el.find('#previous-upload').val(data.name);
			this.$el.find('#previous-upload').attr('data-id', data.id);
			
			this.$el.find('#upload-field-cont').hide();
			this.$el.find('#pdf-icon-cont').show();

			this.$el.find('.view-file').attr({'href': fileURL});
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
			initConvertToPOWindow;

			//return false;
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
			//this.$el.find('#poForm .so-field').remove();
			this.toggleSOFields(this.$el.find("#bid-destination .radio-inline input[type='radio']:checked").val());
			//$('#modal-with-form-confirm .i-circle.warning').remove();
			//$('#modal-with-form-confirm h4').remove();
			
			this.initConvertPOCalendar();
			
			var validate = $('#convertToPOForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					thisObj.bidTransportdateStart = data.transportdatestart;
					thisObj.bidTransportdateEnd = data.transportdateend;
					thisObj.bidLocationId = data.location_id;
					thisObj.bidContractId = data.contract_id;

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

			var producers = this.sortProducerCollection();		

			_.each(producers, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+' '+model.get('suffix')+'</option>';
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

		sortProducerCollection: function(){
			return _.sortBy(this.producerAccountCollection.models, function(producer){
				return producer.get('lastname');
			});

		},
		
		generateStackNumberSuggestions: function (ev) {
			var productId = $(ev.currentTarget).val();
			var accountId = $("#account_id").val();
			var stackTBODY = $(ev.currentTarget).closest('.product-item').next('.product-stack').find('.product-stack-table tbody');
			
			if(productId != '') {
				if(typeof this.stackNumberByProductPool[productId] === 'undefined') {
					this.showFieldThrobber(stackTBODY.find('.stacknumber'));
					this.stackNumberCollection.getStackNumbersByProduct({id:productId, account_id:accountId, dataId:stackTBODY.attr('data-id')});
				}
				else
					this.initStackNumberAutocomplete(stackTBODY.find('.stacknumber'));
			}
		},

		generatePrice: function(ev){
			var thisObj = this;
			var stacknumber = $(ev.currentTarget).val();
			var stackRowNumber = $(ev.currentTarget).closest('tbody').attr('data-id');
			var rowNumber = $(ev.currentTarget).closest('tr').index('.product-stack-item');		
			var s = 'unitprice.'+stackRowNumber+'.'+rowNumber;
			var model = this.stackNumberCollection.where({stacknumber: stacknumber});

			if(model[0] != undefined) {
				var price = model[0].get('unitprice');	
				$('.unitprice[name="'+s+'"]').val(price).attr("readonly", "readonly");
			}
			else {
				$('.unitprice[name="'+s+'"]').val('').removeAttr("readonly");
			}
		},
		
		initStackNumberAutocomplete: function (element, productId) { //console.log('initStackNumberAutocomplete'); console.log('productId: '+productId);
			var thisObj = this;
			
			element.each(function() {
				var field = $(this);
				
				if(productId == null || typeof productId === 'undefined')
					productId = field.closest('.product-stack').prev('.product-item').find('.product_id').val();
				
				if(typeof thisObj.stackNumberByProductPool[productId] !== 'undefined') {
					
					if(!field.hasClass('ui-autocomplete-input')) {
						field.autocomplete({
							source:thisObj.stackNumberByProductPool[productId],
							messages: {
								noResults: '',
								results: function() {},
							}
						});
					}
					else {
						field.autocomplete('option', 'source', thisObj.stackNumberByProductPool[productId]);						
					}
				}
			});
		},
		
		generateLocationFromDropDown: function (select) {
			if(this.subContainer.find('#account_id').val() != '') {
				var dropdown = '';
				_.each(this.locationCollection.models, function (model) {
					 dropdown += '<optgroup label="'+model.get('name')+'">';
					_.each(model.get('section'), function (section) {
						dropdown += '<option value="'+section.id+'">'+section.name+'</option>';
					});
				});
				
				if(select != null && typeof select !== 'undefined')
					select.append(dropdown);
				else
					this.subContainer.find('.section_id').append(dropdown);
			}
		},
		
		showSaveAndCheckInConfirmationWindow: function (ev) {
			var destinationId = this.subContainer.find('input[name=location_id]:checked').val();

			if(destinationId == Const.PO.DESTINATION.PRODUCER || destinationId == Const.PO.DESTINATION.DROPSHIP) {			
				this.initConfirmationWindow('Are you sure you want to save and check-in this purchase order?',
											'confirm-save-and-check-in-order',
											'Save And Check-In',
											'Save And Check-In Purchase Order',
											false);
				this.showConfirmationWindow();
			}
			else
				this.displayGritter('Save and check-in is only allowed to destination type dropship and producer.');
			
			return false;
		},
		
		saveAndCheckIn: function () {
			this.isSaveAndCheckIn = true;
			this.subContainer.find('#poForm').submit();
			return false;
		},
		
		onChangeDestination: function (ev) {
			var value = parseInt($(ev.currentTarget).val());			

			if(value == Const.PO.DESTINATION.SWFARMS && $("#save-and-check-in").is(":visible"))
				$("#save-and-check-in").hide();

			this.toggleSOFields(value);			
		},
		
		toggleSOFields: function (destinationId) {			
			var field = '.so-field';
			var inp = '#account_customer';
			var hide = '#account_id_customer';
			var contractId = '#contract_id';

			if(this.isBid){
				field = '.ds-field';
				inp = '#ds_account_customer';
				hide = '#ds_account_id_customer';
				contractId = "#ds_contract_id";
			}


			if(destinationId == Const.PO.DESTINATION.DROPSHIP) {
				this.subContainer.find(field).attr('disabled', false);
				this.subContainer.find(field).show();
				if(!this.isInitCustomerAutoCompleteView)
					this.initCustomerAutocomplete(inp, hide, contractId);

			}
			else {
				this.subContainer.find(field).attr('disabled', true);
				this.subContainer.find(field).hide();
				if(this.isInitCustomerAutoCompleteView) {
					if(typeof this.model != 'undefined' && !this.model.get('location_id') == Const.PO.DESTINATION.DROPSHIP){
						$(inp).val('');
						$(hide).val('');
					}
					this.customerAutoCompleteView.typeInEmptyCallback();
				}
			}
		},
		
		generateContract: function () {
			var contractList = _.template(contractTemplate, {'contracts': this.contractByAccountCollection.models});
			if(this.isBid)
				var contractElement = this.subContainer.find('#ds_contract_id');	
			else
				var contractElement = this.subContainer.find('#contract_id');	

			var currentValue = contractElement.val();
			this.resetSelect(contractElement);
			contractElement.append(contractList);
			
			if(currentValue != '' && contractElement.find('option[value="'+currentValue+'"]').length > 0)
				contractElement.val(currentValue);
			else if(this.contractByAccountCollection.models.length == 1)
				contractElement.val(this.contractByAccountCollection.models[0].id).trigger('change');
		},
		
		onChangeContract: function (ev) {
			var val = $(ev.target).val();
			if(val != '')
				this.contractProductsCollection.getContractProducts($(ev.target).val());
			else
				this.generateAllProductDropdown();
		},
		
		generateContractProductDropdown: function () { console.log('generateContractProductDropdown');
			var thisObj = this;
			this.subContainer.find('#product-list .product_id').each(function () {
				var currentValue = $(this).val();
				$(this).html(thisObj.getContractProductDropdown());
				
				if(currentValue != '' && $(this).find('option[value="'+currentValue+'"]').length > 0)
					$(this).val(currentValue);
				else
					$(this).val('').trigger('change');
			});
		},
		
		getContractProductDropdown: function () { console.log('getContractProductDropdown');
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.contractProductsCollection.models, function (model) {
				dropDown += '<option value="'+model.get('product_id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		generateAllProductDropdown: function () {
			var thisObj = this;
			this.subContainer.find('#product-list .product_id').each(function () {
				var currentValue = $(this).val();
				$(this).html(thisObj.getAllProductDropdown());
				
				if(currentValue != '' && $(this).find('option[value="'+currentValue+'"]').length > 0)
					$(this).val(currentValue);
			});
		},
		
		getAllProductDropdown: function () {
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.productCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		isDropShip: function () {
			
		},
		
		otherInitializations: function () {},
		postDisplayForm: function () {},
		
		destroySubViews: function () {
			if(this.producerAutoCompleteView != null)
				this.producerAutoCompleteView.destroyView();
			
			if(this.isInitCustomerAutoCompleteView)
				this.customerAutoCompleteView.destroyView();
		},
	});

  return PurchaseOrderAddView;
  
});