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
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/product/ProductCollection',
	'collections/contact/ContactCollection',
    'collections/contract/ContractByAccountCollection',
	'models/salesorder/SalesOrderModel',
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
			OriginCollection,
			NatureOfSaleCollection,
			ProductCollection,
			ContactCollection,
            ContractByAccountCollection,
			SalesOrderModel,
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
		
		customerAutoCompleteView: null,
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.soId = null;
			this.h1Title = 'Sales Order';
			this.h1Small = 'add';
			
			this.currentCustomerId = null;
			this.customerAccountContactId = null;
			
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'unitprice', 'tons', 'id'],
				productFieldClassRequired: ['product_id', 'unitprice', 'tons'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				productSubFieldClone: null,
				productSubFieldCounter: 0,
				productSubFieldClass: ['stacknumber', 'description', 'tons', 'bales', 'id'],
				productSubFieldClassRequired: ['stacknumber', 'tons', 'bales'],
				productSubFieldExempt: [],
				productSubFieldSeparator: '.',
				removeComma: ['unitprice', 'tons', 'bales'],
			};
			
			/*this.originCollection = new OriginCollection();
			this.originCollection.on('sync', function() {	
				thisObj.natureOfSaleCollection.getModels();
				this.off('sync');
			});
			this.originCollection.on('error', function(collection, response, options) {
				this.off('error');
			});*/
			
			this.natureOfSaleCollection = new NatureOfSaleCollection();
			this.natureOfSaleCollection.on('sync', function() {
				thisObj.productCollection.getAllModel();
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
            
            this.contractByAccountCollection = new ContractByAccountCollection();
            this.contractByAccountCollection.on('sync', function() {
				thisObj.generateContract();
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
				
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.contractProductsCollection = new ProductCollection();
			this.contractProductsCollection.on('sync', function() {
				thisObj.generateContractProductDropdown();
				//this.off('sync');
			});
			this.contractProductsCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.customerAccountCollection = new ContactCollection();
			this.customerAccountCollection.on('sync', function() {
				thisObj.generateCustomerAccountContacts();
                thisObj.hideFieldThrobber();
			});
			this.customerAccountCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
		},
		
		render: function(){
			//this.originCollection.getModels();
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
			
			var innerTemplate = _.template(salesOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			
			this.initValidateForm();
			
			// this.generateOrigin();
			this.generateNatureOfSale();
            //this.generateContract();
			this.initCustomerAutocomplete();
			this.initCalendar();
			this.addProduct();
			this.otherInitializations();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#soForm').validate({
				submitHandler: function(form) {
					//var data = $(form).serializeObject();
					var data = thisObj.formatFormField($(form).serializeObject());
					console.log(data);
					/*var data = thisObj.formatFormField($(form).serializeObject());
                    
					data['transportdatestart'] = thisObj.convertDateFormat(data['transportdatestart'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					data['transportdateend'] = thisObj.convertDateFormat(data['transportdateend'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					
                    //console.log(data);
					
					var salesOrderModel = new SalesOrderModel(data);
					
					salesOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.SO, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: salesOrderModel.getAuth(),
						}
					);*/
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
		
		generateOrigin: function () {
			var originTemplate = _.template(salesOrderOriginTemplate, {'origins': this.originCollection.models});
			this.$el.find('#so-origin').html(originTemplate);
			this.$el.find('#so-origin .radio-inline:first-child input[type="radio"]').attr('checked', true);
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
			
			if(this.customerAutoCompleteView != null)
				this.customerAutoCompleteView.deAlloc();
			
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
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
				};
				var productTemplate = _.template(productItemTemplate, productTemplateVars);
				
				this.$el.find('#product-list > tbody').append(productTemplate);
				//this.addProductSub(this.$el.find('#product-list > tbody').find('.product-stack:first table'));
				//var productItem = this.$el.find('#product-list > tbody').find('.product-item:first-child');
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
			
			this.addValidationToProduct();
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
			}
			
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
		
		addValidationToProduct: function () {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				$('#product-list .product-item .'+productFieldClassRequired[i]).each(function() {
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
							
							arrayProductFields['stacks'] = this.getProductStackFields(data, index);
							
							formData.products.push(arrayProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		getProductStackFields: function (data, productIndex) {
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
						
						stacks.push(arrayProductFields);
					}
				}
			}
			
			return stacks;
		},
		
		/*formatFormField: function (data) {
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
		},*/
		
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
			'click #cancel-so': 'showConfirmationWindow',
			'click #confirm-cancel-so': 'cancelSO',
			'change #contract_id': 'onChangeContract'
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
			
			if(!this.hasProductSub(table)) {
				this.addProductSub(table);
			}
		},
		
		hasProductSub: function (tableElement) {
			console.log('hasProductSub: '+tableElement.find('tbody .product-stack-item').length);
			return (tableElement.find('tbody .product-stack-item').length)? true : false;
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
			this.toFixedValue(field, 2)
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
		
		cancelSO: function () {
			if(this.soId != null) {
				var thisObj = this;
				var salesOrderModel = new SalesOrderModel({id:this.soId});
				salesOrderModel.setCancelURL();
				salesOrderModel.save(
					null, 
					{
						success: function (model, response, options) {
							thisObj.displayMessage(response);
							//Global.getGlobalVars().app_router.navigate(Const.URL.SO, {trigger: true});
							Backbone.history.history.back();
						},
						error: function (model, response, options) {
							if(typeof response.responseJSON.error == 'undefined')
								validate.showErrors(response.responseJSON);
							else
								thisObj.displayMessage(response);
						},
						headers: salesOrderModel.getAuth(),
					}
				);
			}
			return false;
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
		
		otherInitializations: function () {},
	});

  return SalesOrderAddView;
  
});