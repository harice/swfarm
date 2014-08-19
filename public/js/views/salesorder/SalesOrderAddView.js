define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/product/ProductCollection',
	'collections/contact/ContactCollection',
    'collections/contract/ContractByAccountCollection',
	'collections/inventory/StackNumberCollection',
	'models/salesorder/SalesOrderModel',
	'models/purchaseorder/PurchaseOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderAddTemplate.html',
	'text!templates/salesorder/salesOrderProductItemTemplate.html',
	'text!templates/salesorder/salesOrderSubProductItemTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
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
			CustomAutoCompleteView,
			AccountCustomerCollection,
			NatureOfSaleCollection,
			ProductCollection,
			ContactCollection,
            ContractByAccountCollection,
			StackNumberCollection,
			SalesOrderModel,
			PurchaseOrderModel,
			contentTemplate,
			salesOrderAddTemplate,
			productItemTemplate,
			productSubItemTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
            contractTemplate,
			Global,
			Const
){

	var SalesOrderAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			this.soId = null;
			this.h1Title = 'Sales Order';
			this.h1Small = 'add';
			this.isInitProcess = false;
			this.soProducts = [];
			this.soProductsIndex = 0;
			this.inits();
		},
		
		inits: function () {
			var thisObj = this;
			this.currentCustomerId = null;
			this.customerAccountContactId = null;
			this.verifyOrder = false;
			this.verified = false;
			
			//this.fromPOId = 14;
			this.fromPOId = Global.getGlobalVars().fromPOId;
			if(Global.getGlobalVars().fromPOId != 0)
				Global.getGlobalVars().fromPOId = 0;
			
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
				productSubFieldClassRequired: ['tons'],
				productSubFieldExempt: [],
				productSubFieldSeparator: '.',
				removeComma: ['unitprice', 'tons', 'bales'],
			};
			
			this.POProductsModel = new PurchaseOrderModel();
			this.POProductsModel.on('change', function() { //console.log(this);
				thisObj.productCollection.getAllModel();
				this.off('change');
			});
			
			this.natureOfSaleCollection = new NatureOfSaleCollection();
			this.natureOfSaleCollection.on('sync', function() {
				
				if(thisObj.fromPOId > 0)
					thisObj.POProductsModel.getPurchaseOrderProducts(thisObj.fromPOId);
				else
					thisObj.productCollection.getAllModel();
				
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
				this.off('error');
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
			
			this.contractProductsCollection = new ProductCollection();
			this.contractProductsCollection.on('sync', function() {
				if(!thisObj.isInitProcess)
					thisObj.generateContractProductDropdown();
				else
					thisObj.stackNumberCollection.getStackNumbersByProduct({id:thisObj.soProducts[thisObj.soProductsIndex]});
					//thisObj.natureOfSaleCollection.getModels();
				//this.off('sync');
			});
			this.contractProductsCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.customerAccountCollection = new ContactCollection();
			this.customerAccountCollection.on('sync', function() {
				thisObj.generateCustomerAccountContacts();
                thisObj.hideFieldThrobber('#contact_id');
			});
			this.customerAccountCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.stackNumberCollection = new StackNumberCollection();
			this.stackNumberCollection.on('sync', function(data, textStatus, jqXHR, option) {
				
				var autocompleteData = [];
				_.each(data, function (s) {
					
					var location = [];
					
					_.each(s.stacklocation, function (sl) {
						location.push({
							id:sl.section[0].id,
							name:sl.section[0].name,
						});
					});
					
					autocompleteData.push({
						value:s.stacknumber,
						location:location,
					});
				});
				thisObj.stackNumberByProductPool[option.id] = autocompleteData;
				
				if(!thisObj.isInitProcess) {
					thisObj.generateStackNumberDropdown(thisObj.subContainer.find('.product-stack-table tbody[data-id="'+option.dataId+'"] .stacknumber'), option.id);
					thisObj.hideFieldThrobber('.product-stack-table tbody[data-id="'+option.dataId+'"] .stacknumber');
				}
				else {
					thisObj.soProductsIndex++;
					if(thisObj.soProductsIndex < thisObj.soProducts.length)
						this.getStackNumbersByProduct({id:thisObj.soProducts[thisObj.soProductsIndex]});
					else
						thisObj.natureOfSaleCollection.getModels();
				}
			});
			this.stackNumberCollection.on('error', function(collection, response, options) {
			});
		},
		
		render: function() {
			this.natureOfSaleCollection.getModels();
			Backbone.View.prototype.refreshTitle('Sales Order','add');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'so_url' : '#/'+Const.URL.SO
			};
			
			if(this.soId != null)
				innerTemplateVariables['so_id'] = this.soId;
			if(this.verified)
				innerTemplateVariables['verified'] = true;
			
			var innerTemplate = _.template(salesOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initValidateForm();
			
			this.generateNatureOfSale();
			this.initCustomerAutocomplete();
			this.initCalendar();
			this.addProduct();
			this.otherInitializations();
			this.postDisplayForm();
			
			if(this.fromPOId > 0) {
				this.usePOData();
			}
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#soForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
                    
					data['transportdatestart'] = thisObj.convertDateFormat(data['transportdatestart'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					data['transportdateend'] = thisObj.convertDateFormat(data['transportdateend'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					
                    //console.log(data);
					if(thisObj.verifyOrder)
						data['verified'] = '1';
					
					if(thisObj.fromPOId > 0)
						data['purchaseorder_id'] = thisObj.fromPOId;
					
					var salesOrderModel = new SalesOrderModel(data);
					
					salesOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								if(thisObj.verifyOrder) {
									thisObj.verifyOrder = false;
									thisObj.hideConfirmationWindow(null, function () {
										thisObj.displayMessage(response);
										Backbone.history.history.back();
									});
								}
								else {
									thisObj.verifyOrder = false;
									thisObj.displayMessage(response);
									Backbone.history.history.back();
								}
							},
							error: function (model, response, options) {
								if(thisObj.verifyOrder)
									thisObj.hideConfirmationWindow();
								
								thisObj.verifyOrder = false;
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: salesOrderModel.getAuth(),
						}
					);
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
		
		generateNatureOfSale: function () {
			var NOSTemplate = _.template(salesOrderNatureOfSaleTemplate, {'natureOfSales': this.natureOfSaleCollection.models});
			this.$el.find('#so-nos').html(NOSTemplate);
			this.$el.find('#so-nos .radio-inline:first-child input[type="radio"]').attr('checked', true);
		},
                
		generateContract: function () {
			var contractList = _.template(contractTemplate, {'contracts': this.contractByAccountCollection.models});
			var currentValue = this.$el.find('#contract_id').val();
			this.resetSelect(this.$el.find('#contract_id'));
			this.$el.find('#contract_id').append(contractList);
			
			if(currentValue != '' && this.$el.find('#contract_id option[value="'+currentValue+'"]').length > 0)
				this.$el.find('#contract_id').val(currentValue);
		},
		
		initCustomerAutocomplete: function () {
			var thisObj = this;
			
			var accountCustomerCollection = new AccountCustomerCollection();
			this.customerAutoCompleteView = new CustomAutoCompleteView({
                input: $('#account'),
				hidden: $('#account_id'),
                collection: accountCustomerCollection,
				fields: ['address'],
            });
			
			this.customerAutoCompleteView.onSelect = function (model) {
				var address = model.get('address');
				thisObj.$el.find('#street').val(address[0].street);
				thisObj.$el.find('#state').val(address[0].address_states[0].state);
				thisObj.$el.find('#city').val(address[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
				thisObj.contractByAccountCollection.getContractByAccount(model.get('id'));
				
				if(thisObj.currentCustomerId != model.get('id')) {
					thisObj.currentCustomerId = model.get('id')
					thisObj.showFieldThrobber('#contact_id');
					thisObj.resetSelect(thisObj.subContainer.find('#contact_id'));
					thisObj.customerAccountCollection.getContactsByAccountId(thisObj.currentCustomerId);
				}
			};
			
			this.customerAutoCompleteView.typeInCallback = function (result) {
				var address = result.address;
				thisObj.$el.find('#street').val(address[0].street);
				if(address[0].address_states.length > 0 && typeof address[0].address_states[0].state != 'undefined')
					thisObj.$el.find('#state').val(address[0].address_states[0].state);
				else if(typeof address[0].address_states.state != 'undefined')
					thisObj.$el.find('#state').val(address[0].address_states.state);
				thisObj.$el.find('#city').val(address[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
				thisObj.contractByAccountCollection.getContractByAccount(result.id);
				
				if(thisObj.currentCustomerId != result.id) {
					thisObj.currentCustomerId = result.id;
					thisObj.showFieldThrobber('#contact_id');
					thisObj.resetSelect(thisObj.subContainer.find('#contact_id'));
					thisObj.customerAccountCollection.getContactsByAccountId(thisObj.currentCustomerId);
				}
			},
			
			this.customerAutoCompleteView.typeInEmptyCallback = function () {
				thisObj.$el.find('#street').val('');
				thisObj.$el.find('#state').val('');
				thisObj.$el.find('#city').val('');
				thisObj.$el.find('#zipcode').val('');
				thisObj.resetSelect(thisObj.$el.find('#contract_id'));
				thisObj.$el.find('#contract_id').trigger('change');
				
				thisObj.resetSelect(thisObj.subContainer.find('#contact_id'));
				thisObj.currentCustomerId = null;
			},
			
			this.customerAutoCompleteView.render();
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
		
		onClickAddProductButton: function () {
			if(!this.verified)
				this.addProduct();
			else {
				this.displayGritter('Sales Order is already verified and products can no longer be modified.');
			}
		},
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
				};
				
				if(this.verified)
					productTemplateVars['verified'] = true;
				if(!this.isProductEditable())
					productTemplateVars['readonly_products'] = true;
				
				var productTemplate = _.template(productItemTemplate, productTemplateVars);
				
				this.$el.find('#product-list > tbody').append(productTemplate);
				var productItem = this.$el.find('#product-list > tbody').children();
				this.options.productFieldClone = productItem.clone();
				this.addIndexToProductFields(productItem);
				clone = productItem;
			}
			else {
				clone = this.options.productFieldClone.clone();
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
				
				if(!this.isProductEditable())
					productSubTemplateVars['readonly_products'] = true;
				
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
				this.generateStackNumberDropdown(clone.find('.stacknumber'));
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
		
		getAllProductDropdown: function () {//console.log('getAllProductDropdown');
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.productCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		generateAllProductDropdown: function () {
			//this.subContainer.find('#product-list .product_id').html(this.getAllProductDropdown());
			var thisObj = this;
			this.subContainer.find('#product-list .product_id').each(function () {
				var currentValue = $(this).val();
				$(this).html(thisObj.getAllProductDropdown());
				
				if(currentValue != '' && $(this).find('option[value="'+currentValue+'"]').length > 0)
					$(this).val(currentValue);
			});
		},
		
		getContractProductDropdown: function () {//console.log('getContractProductDropdown');
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.contractProductsCollection.models, function (model) {
				dropDown += '<option value="'+model.get('product_id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		generateContractProductDropdown: function () {
			//this.subContainer.find('#product-list .product_id').html(this.getContractProductDropdown());
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
		
		getProductDropdown: function () {//console.log('getProductDropdown');
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
				clone.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},
		
		addValidationToProductSub: function (clone) {
			var thisObj = this;
			var productSubFieldClassRequired = this.options.productSubFieldClassRequired;
			for(var i=0; i < productSubFieldClassRequired.length; i++) {
				clone.find('.'+productSubFieldClassRequired[i]).each(function() {
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
					
					
					if(arrayKey.length < 2) {
						if(this.options.removeComma.indexOf(key) < 0)
							formData[key] = value;
						else
							formData[key] = this.removeCommaFromNumber(value);
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
										else
											arrayProductFields[productFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
									}
								}
							}
							
							arrayProductFields['stacks'] = this.getProductStackFields(data, index, {
								'product_id': arrayProductFields.product_id,
								'unitprice': arrayProductFields.unitprice,
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
									if(this.options.removeComma.indexOf(productFieldClass[i]) < 0)
										arrayProductFields[productFieldClass[i]] = fieldValue;
									else
										arrayProductFields[productFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
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
			'click #add-product': 'onClickAddProductButton',
			'click .add-product-stack': 'addProductStack',
			'click .remove-product': 'removeProduct',
			'click .remove-product-stack': 'removeProductStack',
			//'blur .productname': 'validateProduct',
			'keyup .unitprice': 'onKeyUpUnitPrice',
			'blur .unitprice': 'onBlurMoney',
			'keyup .tons': 'onKeyUpTons',
			'blur .tons': 'onBlurTon',
			'keyup .bales': 'onKeyUpBales',
			'change #contract_id': 'onChangeContract',
			'click #verify-so': 'showVerifyConfirmationWindow',
			'click #confirm-verify-order': 'verifySo',
			'change .product_id': 'generateStackNumberSuggestions',
			'change .stacknumber': 'onChangeStackNumber',
			'change .natureofsale_id': 'onChangeNatureOfSales',
		},
		
		onClickRemoveProductButton: function () {
			if(!this.verified)
				this.addProduct();
			else
				this.displayGritter('Sales Order is already verified and products can no longer be modified.');
		},
		
		removeProduct: function (ev) {
			if(!this.verified) {
				var tr = $(ev.currentTarget).closest('tr');
				tr.next().remove();
				tr.remove();
				
				if(!this.hasProduct())
					this.addProduct();
					
				this.computeTotals();
			}
			else
				this.displayGritter('Sales Order is already verified and products can no longer be modified.');
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
		
		removeProductStack: function (ev) {
			var tr = $(ev.currentTarget).closest('tr');
			var table = tr.closest('table');
			tr.remove();
			
			if(!this.hasProductSub(table)) {
				this.addProductSub(table);
			}
		},
		
		hasProductSub: function (tableElement) {
			//console.log('hasProductSub: '+tableElement.find('tbody .product-stack-item').length);
			return (tableElement.find('tbody .product-stack-item').length)? true : false;
		},
		
		computeTotals: function () {
			this.computeTotalTons();
			//this.computeTotalBales();
			
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
		
		onKeyUpUnitPrice: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 2);
			
			var unitPricefield = $(ev.target);
			var unitPricefieldVal = this.removeCommaFromNumber(unitPricefield.val());
			var unitPrice = (!isNaN(parseFloat(unitPricefieldVal)))? parseFloat(unitPricefieldVal) : 0;
			var tonsField = unitPricefield.closest('.product-item').find('.tons');
			var tonsFieldVal = this.removeCommaFromNumber(tonsField.val());
			var tons = (!isNaN(parseFloat(tonsFieldVal)))? parseFloat(tonsFieldVal) : 0;
			
			this.computeTotalPrice(unitPrice, tons, unitPricefield.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpTons: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
			
			var tonsfield = $(ev.target);
			if(tonsfield.closest('.product-item').find('.unitprice').length > 0 && tonsfield.closest('.product-item').find('.unit-price').length > 0) {
				var tonsfieldVal = this.removeCommaFromNumber(tonsfield.val());
				var tons = (!isNaN(parseFloat(tonsfieldVal)))? parseFloat(tonsfieldVal) : 0;
				var unitPriceField = tonsfield.closest('.product-item').find('.unitprice');
				var unitPriceFieldVal = this.removeCommaFromNumber(unitPriceField.val());
				var unitPrice = (!isNaN(parseFloat(unitPriceFieldVal)))? parseFloat(unitPriceFieldVal) : 0;
				
				this.computeTotalPrice(unitPrice, tons, tonsfield.closest('.product-item').find('.unit-price'));
				
				this.computeTotalTons();
			}
		},
		
		computeTotalTons: function () {
			var thisObj = this;
			var total = 0;
			this.subContainer.find('#product-list .product-item .tons').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				total += (!isNaN(parseFloat(value)))? parseFloat(value) : 0;
			});
			this.subContainer.find('#total-tons').val(thisObj.addCommaToNumber(total.toFixed(4)));
		},
		
		computeTotalPrice: function (price, tonsOrBales, unitePriceField) {
			var unitPrice = 0;
			unitPrice = tonsOrBales * price;
			unitePriceField.val(this.addCommaToNumber(unitPrice.toFixed(2)));
			
			this.computeTotalTotalPrice();
		},
		
		computeTotalTotalPrice: function () {
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
		
		onChangeContract: function (ev) {
			var val = $(ev.target).val();
			if(val != '')
				this.contractProductsCollection.getContractProducts($(ev.target).val());
			else
				this.generateAllProductDropdown();
		},
		
		generateCustomerAccountContacts: function () {
			var dropDown = '';
			_.each(this.customerAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#contact_id').append(dropDown);
			
			if(typeof this.customerAccountContactId != 'undefined' && this.customerAccountContactId != null) {
				this.$el.find('#contact_id').val(this.customerAccountContactId);
				this.customerAccountContactId = null;
			}
			else {
				if(this.customerAccountCollection.models.length == 1)
					this.$el.find('#contact_id').val(this.customerAccountCollection.models[0].get('id')).change();
			}
		},
		
		generateStackNumberSuggestions: function (ev) {
			var productId = $(ev.currentTarget).val();
			var stackTBODY = $(ev.currentTarget).closest('.product-item').next('.product-stack').find('.product-stack-table tbody');
			
			this.resetSelect(stackTBODY.find('.stacknumber'));
			this.resetSelect(stackTBODY.find('.section_id'));
			
			if(productId != '') {
				if(typeof this.stackNumberByProductPool[productId] === 'undefined') {
					this.showFieldThrobber(stackTBODY.find('.stacknumber'));
					this.stackNumberCollection.getStackNumbersByProduct({id:productId, dataId:stackTBODY.attr('data-id')});
				}
				else
					this.generateStackNumberDropdown(stackTBODY.find('.stacknumber'));
			}
		},
		
		generateStackNumberDropdown: function (select, productId, value) { //console.log('generateStackNumberDropdown'); console.log('productId: '+productId);
			if(productId == null || typeof productId === 'undefined')
				productId = select.closest('.product-stack').prev('.product-item').find('.product_id').val();
			
			if(typeof this.stackNumberByProductPool[productId] !== 'undefined') {
				var dropdown = '';
				_.each(this.stackNumberByProductPool[productId], function (s) {
					dropdown += '<option value="'+s.value+'">'+s.value+'</option>';
				});
				select.append(dropdown);
				
				if(value != null && typeof value !== 'undefined')
					select.val(value);
				else {
					if(this.stackNumberByProductPool[productId].length == 1)
						select.val(this.stackNumberByProductPool[productId][0].value).trigger('change');
				}
			}
		},
		
		getLocationByStockNumberDropdown: function (stacknumber, productId) {
			var dropdown = '';
			
			for(var key in this.stackNumberByProductPool[productId]) {
				if(typeof this.stackNumberByProductPool[productId][key] !== 'function' 
					&& typeof this.stackNumberByProductPool[productId][key] !== 'undefined' 
					&& this.stackNumberByProductPool[productId][key].value == stacknumber){
					
					_.each(this.stackNumberByProductPool[productId][key].location, function (location) {
						dropdown += '<option value="'+location.id+'">'+location.name+'</option>';
					});
				}
			}
			
			return dropdown;
		},
		
		onChangeStackNumber: function (ev) {
			var stacknumber = $(ev.currentTarget).val();
			var productId = $(ev.currentTarget).closest('.product-stack').prev('.product-item').find('.product_id').val();
			var locationFromSelect = $(ev.currentTarget).closest('tr.product-stack-item').find('.section_id');
			
			this.generateLocationFromDropDown(stacknumber, productId, locationFromSelect);
		},
		
		generateLocationFromDropDown: function (stacknumber, productId, locationFromSelect, value) {
			
			var dropdown = this.getLocationByStockNumberDropdown(stacknumber, productId);
			
			this.resetSelect(locationFromSelect);
			locationFromSelect.append(dropdown);
			
			if(value != null && typeof value !== 'undefined')
				locationFromSelect.val(value);
			else {
				if(locationFromSelect.find('option').length == 2)
					locationFromSelect.find('option:last').attr('selected', true);
			}
		},
		
		onChangeNatureOfSales: function (ev) {
			var value = parseInt($(ev.currentTarget).val());
			this.toggleContract(value);
		},
		
		toggleContract: function (nos) {
			if(nos != Const.SO.NATUREOFSALES.WITHCONTRACT) {
				$('#contract_id').val('').trigger('change');
				$('#contract_id').attr('disabled', true);
			}
			else
				$('#contract_id').attr('disabled', false);
		},
		
		showVerifyConfirmationWindow: function () {
			this.initConfirmationWindow('Are you sure you want to verify this sales order?',
										'confirm-verify-order',
										'Verify Sales Order',
										'Verify Sales Order',
										false);
			this.showConfirmationWindow();
			
			return false;
		},
		
		verifySo: function () {
			this.verifyOrder = true;
			this.subContainer.find('#soForm').submit();
			//this.hideConfirmationWindow();
			return false;
		},
		
		usePOData: function () {
			var thisObj = this;
			var i= 0;
			
			this.subContainer.find('[name="natureofsale_id"][value="'+Const.SO.NATUREOFSALES.WITHCONTRACT+'"]').attr('checked', true).trigger('change');
			this.subContainer.find('[name="natureofsale_id"]').each(function () {
				if($(this).val() != Const.SO.NATUREOFSALES.WITHCONTRACT)
					$(this).closest('.radio-inline').remove();
			});
			
			_.each(this.POProductsModel.get('productsummary'), function (product) {
				var productFields = null;
				if(i > 0)
					productFields = thisObj.addProduct();
				else {
					productFields = thisObj.$el.find('#product-list > tbody .product-item:first');
					productFields.find('.product_id').html(thisObj.getProductDropdown());
				}
				i++;
				
				productFields.find('.product_id').val(product.productname.id);
				thisObj.convertProductFieldToReadOnly(productFields, product.productname.id, true);
				productFields.find('.tons').val(thisObj.addCommaToNumber(parseFloat(product.tons).toFixed(4)));
				
				var j = 0;
				_.each(product.productorder, function (productSub) {
					var productSubFields = null;
					
					if(j > 0)
						productSubFields = thisObj.addProductSub(productFields.next('.product-stack').find('.product-stack-table'));
					else
						productSubFields = productFields.next('.product-stack').find('.product-stack-table > tbody .product-stack-item:first');
					j++;
					
					productSubFields.find('.stacknumber_dummy').val(productSub.stacknumber);
					productSubFields.find('.stacknumber').val(productSub.stacknumber);
					productSubFields.find('.section_id_dummy').val(productSub.sectionfrom.storagelocation.name+' - '+productSub.sectionfrom.name);
					productSubFields.find('.section_id').val(productSub.sectionfrom.id);
					productSubFields.find('.tons').val(productSub.tons);
					productSubFields.find('.bales').val(productSub.bales);
				});
			});
		},
		
		convertProductFieldToReadOnly: function (productFields, productId, allowUnitPrice) {
			if(allowUnitPrice == null || allowUnitPrice != true)
				allowUnitPrice = false;
			
			productFields.find('.product_id_dummy').val(productId);
			
			if(!allowUnitPrice)
				productFields.find('.unitprice').attr('readonly', true);
			
			productFields.siblings('.product-item').find('.tons').attr('readonly', true);
			productFields.find('.unit-price').attr('readonly', true);
		},
		
		isProductEditable: function () {
			if(this.fromPOId > 0)
				return false;
			
			return true;
		},
		
		otherInitializations: function () {},
		postDisplayForm: function () {},
		
		destroySubViews: function () {
			this.customerAutoCompleteView.destroyView();
		},
	});

  return SalesOrderAddView;
  
});