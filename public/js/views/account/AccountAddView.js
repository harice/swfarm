define([
	'backbone',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'models/account/AccountModel',
	'models/account/AccountExtrasModel',
	'collections/address/CityCollection',
	'collections/address/ZipCodeCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountAddTemplate.html',
	'text!templates/account/accountAddressTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			Validate,
			TextFormatter,
			PhoneNumber,
			AccountModel,
			AccountExtrasModel,
			CityCollection,
			ZipCodeCollection,
			contentTemplate,
			accountAddTemplate,
			accountAddressTemplate,
			Global,
			Const
){

	var AccountAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			this.accountId = null;
			this.h1Title = 'Account';
			this.h1Small = 'add';
		
			this.options = {
				addressFieldClone: null,
				addressFieldCounter: 0,
				addressFieldClass: ['type', 'street', 'state', 'city', 'zipcode', 'country', 'id'],
				addressFieldClassRequired: ['street', 'state', 'city', 'zipcode'],
				addressFieldSeparator: '.',
				addressTypeUniqueForCustomer: null,
				addressTypeUniqueForProducer: null,
			};
			
			this.accountExtrasModel = new AccountExtrasModel();
			this.accountExtrasModel.on("change", function() {
				thisObj.displayForm();
				this.off("change");
			});
		},
		
		render: function(){
			this.accountExtrasModel.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'account_url': '#/'+Const.URL.ACCOUNT,
				'account_types': this.accountExtrasModel.get('accountTypes'),
			};
			
			if(this.accountId != null)
				innerTemplateVariables['account_id'] = this.accountId;
			
			var innerTemplate = _.template(accountAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.focusOnFirstField();
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			// this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
            this.maskInputs();
			
			this.initValidateForm();
			this.addAddressFields();
			
			$('.form-button-container').show();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#addAccountForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject()); console.log(data);
					
					var accountModel = new AccountModel(data);
					
					accountModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: accountModel.getAuth(),
						}
					);
				},
				
				rules: {
					website: {
						complete_url:true,
					},
				},
				
				messages: {
					website: {
						complete_url: 'Please enter a valid URL.',
					},
					
					phone: {
                        minlength: 'Please enter a valid phone number.',
						maxlength: 'Please enter a valid phone number.',
					},
				},
				
			});
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #add-address-field' : 'addAddressFields',
			'click .remove-address-fields' : 'removeAddressFields',
			'change #accounttype': 'onChangeAccountType',
		},
		
		addAddressFields: function () {
			var clone = null;
			var multipleAddress = Const.ACCOUNT.MULTIPLEADDRESS;
			var accountTypeText = $('#accounttype').find('option:selected').text();
			
			if(this.options.addressFieldClone == null) {
				var varAccountAddressTemplate = {
					'address_types': this.accountExtrasModel.get('addressTypes'),
					'address_states' : this.accountExtrasModel.get('states'),
				};
				
				var addressTemplate = _.template(accountAddressTemplate, varAccountAddressTemplate);
				this.$el.find('#account-adresses').html(addressTemplate);
				
				this.options.addressFieldClone = this.$el.find('.address-fields-container').clone();
				this.options.addressFieldClone.find('#add-address-field').remove();
				this.options.addressFieldClone.find('.type option:first-child').remove();
				
				this.options.addressTypeUniqueForCustomer = this.options.addressFieldClone.find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.CUSTOMER; }).clone();
				this.options.addressTypeUniqueForProducer = this.options.addressFieldClone.find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.PRODUCER; }).clone();
				
				var addressTypeField = this.$el.find('.type');
				addressTypeField.attr('disabled', true);
				addressTypeField.after('<input class="type" type="hidden" name="'+addressTypeField.attr('name')+'" value="'+addressTypeField.val()+'" />');
				
				this.addIndexToAddressFields(this.$el.find('#account-adresses > div:first-child .address-fields-container'));
				
				this.$el.find('.remove-address-fields').remove();
				clone = this.$el.find('#account-adresses > div:first-child');
			}
			else {
				if(multipleAddress.indexOf(accountTypeText) > -1) {
					var clone = this.options.addressFieldClone.clone();
					
					if(accountTypeText == 'Producer')
						clone.find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.CUSTOMER; }).remove();
					else if(accountTypeText == 'Customer')
						clone.find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.PRODUCER; }).remove();
					
					this.addIndexToAddressFields(clone);
					$('#account-adresses').append(clone);
				}
			}
			
			this.addValidationToAddressFields();
			return clone;
		},
		
		removeAddressFields: function (ev) {
			$(ev.target).closest('.address-fields-container').remove();
		},
		
		addValidationToAddressFields: function () {
			var thisObj = this;
			var addressFieldClassRequired = this.options.addressFieldClassRequired;
			for(var i=0; i < addressFieldClassRequired.length; i++) {
				if(addressFieldClassRequired[i] != 'zipcode') {
					$('.'+addressFieldClassRequired[i]).each(function() {
						$(this).rules('add', {required: true});
					});
				}
				else {
					$('.'+addressFieldClassRequired[i]).each(function() {
						$(this).rules('add', {
							required: true,
							// valid_zipcode: true,
							messages: {
								number: 'Please enter a valid zip code.'
							},
						});
					});
				}
			}
		},
		
		addIndexToAddressFields: function (joAddressFields) {
			var addressFieldClass = this.options.addressFieldClass;
			for(var i=0; i < addressFieldClass.length; i++) {
				var field = joAddressFields.find('.'+addressFieldClass[i]);
				var name = field.attr('name');
				//field.attr('name', name+'['+this.options.addressFieldCounter+']');
				field.attr('name', name + this.options.addressFieldSeparator + this.options.addressFieldCounter);
				//field.attr('name', name+'[]');
			}
			
			this.options.addressFieldCounter++;
		},
		
		formatFormField: function (data) {
			var formData = {address:[]};
			var addressFieldClasses = this.options.addressFieldClass;
			
			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.addressFieldSeparator);
					
					if(arrayKey.length < 2)
						formData[key] = value;
					else {
						if(arrayKey[0] == addressFieldClasses[0]) {
							var index = arrayKey[1];
							var arrayAddressFields = {};
							
							for(var i = 0; i < addressFieldClasses.length; i++) {
								var fieldValue = data[addressFieldClasses[i]+this.options.addressFieldSeparator+index];
								if(!(addressFieldClasses[i] == 'id' && fieldValue == ''))
									arrayAddressFields[addressFieldClasses[i]] = fieldValue;
							}
								
							formData.address.push(arrayAddressFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		onChangeAccountType: function (ev) {
			var multipleAddress = Const.ACCOUNT.MULTIPLEADDRESS;
			var accountTypeText = $(ev.target).find('option:selected').text();
			
			if(multipleAddress.indexOf(accountTypeText) < 0) {
				$('#account-adresses').find('.address-fields-container:gt(0)').remove();
			}
			else {
				if(accountTypeText == 'Producer') {
					$('#account-adresses').find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.CUSTOMER; }).remove();
					$('#account-adresses').find('.type').append(this.options.addressTypeUniqueForProducer);
				}
				else if(accountTypeText == 'Customer') {
					$('#account-adresses').find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.PRODUCER; }).remove();
					$('#account-adresses').find('.type').append(this.options.addressTypeUniqueForCustomer);
				}
			}
		},
	});

  return AccountAddView;
  
});