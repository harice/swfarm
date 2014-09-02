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
	'collections/product/ProductCollection',
	'models/contract/ContractModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contract/contractAddTemplate.html',
	'text!templates/contract/contractProductItemTemplate.html',
	'global',
	'constant'
], function(Backbone,
			DatePicker,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			ProductCollection,
			ContractModel,
			contentTemplate,
			contractAddTemplate,
			productItemTemplate,
			Global,
			Const
){

	var ContractAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.soId = null;
			this.h1Title = 'Contract';
			this.h1Small = 'add';

			this.customerAutoCompleteView = null;

			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'tons', 'bales', 'id'],
				productFieldClassRequired: ['product_id', 'tons', 'bales'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				removeComma: ['tons', 'bales']
			};

			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				_.each(this.models, function (productModels) {
					thisObj.productAutoCompletePool.push({
						label:productModels.get('name'),
						value:productModels.get('name'),
						id:productModels.get('id')
					});
				});

				if(thisObj.subContainerExist())
					thisObj.displayForm();

				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},

		render: function(){
			this.productCollection.getModels();
			Backbone.View.prototype.refreshTitle('Contract','add');
		},

		displayForm: function () {
			var thisObj = this;

			var innerTemplateVariables = {
				'so_url' : '#/'+Const.URL.CONTRACT
			};

			if(this.soId !== null)
				innerTemplateVariables['contract_id'] = this.soId;

			var innerTemplate = _.template(contractAddTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initValidateForm();

			this.initCustomerAutocomplete();
			this.initCalendar();
			this.addProduct();
			this.otherInitializations();
		},

		initValidateForm: function () {
			var thisObj = this;

			var validate = $('#contractForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());

					data['contract_date_start'] = thisObj.convertDateFormat(data['contract_date_start'], thisObj.dateFormat, 'yyyy-mm-dd', '-');
					data['contract_date_end'] = thisObj.convertDateFormat(data['contract_date_end'], thisObj.dateFormat, 'yyyy-mm-dd', '-');

					var contractModel = new ContractModel(data);

					contractModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.CONTRACT, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
//								if(typeof response.responseJCONTRACTN.error === 'undefined')
//									validate.showErrors(response.responseJCONTRACTN);
//								else
									thisObj.displayMessage(response);
							},
							headers: contractModel.getAuth()
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
				}
			});
		},

		initCustomerAutocomplete: function () {
			var thisObj = this;

			var accountCustomerCollection = new AccountCustomerCollection();
			this.customerAutoCompleteView = new CustomAutoCompleteView({
                input: $('#account'),
				hidden: $('#account_id'),
                collection: accountCustomerCollection,
				fields: ['address']
            });

			this.customerAutoCompleteView.onSelect = function (model) {
				var address = model.get('address');
				thisObj.$el.find('#street').val(address[0].street);
				thisObj.$el.find('#state').val(address[0].address_states[0].state);
				thisObj.$el.find('#city').val(address[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
			};

			this.customerAutoCompleteView.typeInCallback = function (result) {
				var address = result.address;
				thisObj.$el.find('#street').val(address[0].street);
				thisObj.$el.find('#state').val(address[0].address_states[0].state);
				thisObj.$el.find('#city').val(address[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
			},

			this.customerAutoCompleteView.typeInEmptyCallback = function () {
				thisObj.$el.find('#street').val('');
				thisObj.$el.find('#state').val('');
				thisObj.$el.find('#city').val('');
				thisObj.$el.find('#zipcode').val('');
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
				format: this.dateFormat
			}).on('changeDate', function (ev) {
				var selectedDate = $('#start-date .input-group.date input').val();
				thisObj.$el.find('#end-date .input-group.date').datepicker('setStartDate', selectedDate);
			});

			this.$el.find('#end-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat
			}).on('changeDate', function (ev) {
				var selectedDate = $('#end-date .input-group.date input').val();
				thisObj.$el.find('#start-date .input-group.date').datepicker('setEndDate', selectedDate);
			});
		},

		addProduct: function () {
			var clone = null;

			if(this.options.productFieldClone === null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown()
				};
				var productTemplate = _.template(productItemTemplate, productTemplateVars);

				this.$el.find('#product-list tbody').append(productTemplate);
				var productItem = this.$el.find('#product-list tbody').find('.product-item:first-child');
				this.options.productFieldClone = productItem.clone();
				this.addIndexToProductFields(productItem);
				clone = productItem;
			}
			else {
				var clone = this.options.productFieldClone.clone();
				this.addIndexToProductFields(clone);
				this.$el.find('#product-list tbody').append(clone);
			}

			this.addValidationToProduct();
			return clone;
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

		addValidationToProduct: function () {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				$('.'+productFieldClassRequired[i]).each(function() {
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
						if(this.options.removeComma.indexOf(key) < 0)
							formData[key] = value;
						else
							formData[key] = this.removeCommaFromNumber(value);
					else {
						if(arrayKey[0] === productFieldClass[0]) {
							var index = arrayKey[1];
							var arrayProductFields = {};

							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0) {
									var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+index];
									if(!(productFieldClass[i] === 'id' && fieldValue === '')) {
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
			'keyup .tons': 'onKeyUpTons',
			'blur .tons': 'onBlurTon',
			'keyup .bales': 'formatNumber',
		},

		removeProduct: function (ev) {
			$(ev.target).closest('tr').remove();

			if(!this.hasProduct())
				this.addProduct();
		},

		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},

		emptyProductFields: function (field) {
			field.val('');
			field.siblings('.product_id').val('');
		},

		onKeyUpTons: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
		},

		otherInitializations: function () {},

		destroySubViews: function () {
			this.customerAutoCompleteView.destroyView();
		},
	});

  return ContractAddView;

});