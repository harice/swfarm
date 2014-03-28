define([
	'backbone',
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

	var AccountAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			addressFieldClone: null,
			addressFieldCounter: 0,
			addressFieldClass: ['type', 'street', 'state', 'city', 'zipcode', 'country'],
			addressFieldClassRequired: ['street', 'state', 'city', 'zipcode'],
			addressFieldSeparator: '.',
		},
		
		initialize: function() {
			var thisObj = this;
			
			this.model = new AccountExtrasModel();
			this.model.on("change", function() {
				thisObj.displayForm();
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var varAccountAddressTemplate = {
				'address_types': this.model.get('addressTypes'),
				'address_states' : this.model.get('states'),
			};
			
			var addressTemplate = _.template(accountAddressTemplate, varAccountAddressTemplate);
			
			var innerTemplateVariables = {
				'account_url': '#/'+Const.URL.ACCOUNT,
				'address_fields': addressTemplate,
				'account_types': this.model.get('accountTypes'),
			};
			var innerTemplate = _.template(accountAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Account",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			
			this.options.addressFieldClone = this.$el.find('.address-fields-container').clone();
			this.options.addressFieldClone.find('#add-address-field').remove();
			
			var addressTypeField = this.$el.find('.type');
			addressTypeField.attr('disabled', true);
			addressTypeField.after('<input class="type" type="hidden" name="'+addressTypeField.attr('name')+'" value="'+addressTypeField.val()+'" />');
			
			this.addIndexToAddressFields(this.$el.find('.address-fields-container'));
			
			this.$el.find('.remove-address-fields').remove();
			
			$('.form-button-container').show();
			
			var validate = $('#addAccountForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					
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
			this.addValidationToAddressFields();
		},
		
		events: {
			'click #add-address-field' : 'addAddressFields',
			'click .remove-address-fields' : 'removeAddressFields',
			'change .state' : 'fetchCityList',
			'change .city' : 'fetchZipCodeList',
			'change #accounttype': 'onChangeAccountType',
		},
		
		addAddressFields: function () {
			var multipleAddress = Const.MULTIPLEADDRESS;
			var accountTypeText = $('#accounttype').find('option:selected').text();
		
			if(multipleAddress.indexOf(accountTypeText) > -1) {
				var clone = this.options.addressFieldClone.clone();
				this.addIndexToAddressFields(clone);
				$('#account-adresses').append(clone);
				this.addValidationToAddressFields();
			}
		},
		
		removeAddressFields: function (ev) {
			$(ev.target).closest('.address-fields-container').remove();
		},
		
		fetchCityList: function (ev) {
			var thisObj = this;
			var stateField = $(ev.target);
			var cityField = stateField.closest('.address-fields-container').find('.city');
			
			if(stateField.val() != '') {
				var cityCollection = new CityCollection();
				cityCollection.on('sync', function() {
					thisObj.resetCityField(cityField);
					
					_.each(this.models, function (cityModel){
						cityField.append($('<option></option>').attr('value', cityModel.get('id')).text(cityModel.get('city')));
					});
					
					this.off('sync');
				});
				
				cityCollection.on('error', function(collection, response, options) {
					this.off('error');
				});
				cityCollection.getModels(stateField.val());
			}
			else
				this.resetCityField(cityField);
		},
		
		fetchZipCodeList: function (ev) {
			var thisObj = this;
			var cityField = $(ev.target);
			
			if(cityField.val() != '') {
				var zipCodeCollection = new ZipCodeCollection();
				zipCodeCollection.on('sync', function() {
					
					var zipcodes = [];
					_.each(this.models, function (zipCodeModel){
						zipcodes.push(zipCodeModel.get('zip'));
					});
					cityField.attr('data-zipcodes', zipcodes.join());
					
					//console.log(zipcodes);
					this.off('sync');
				});
				
				zipCodeCollection.on('error', function(collection, response, options) {
					this.off('error');
				});
				zipCodeCollection.getModels(cityField.val());
			}
			else {
				cityField.attr('data-zipcodes', '');
			}
			
			this.emptyZipCodeField(cityField);
		},
		
		resetCityField: function (cityField) {
			cityField.find('option:gt(0)').remove();
			cityField.attr('data-zipcodes', '');
			this.emptyZipCodeField(cityField);
		},
		
		emptyZipCodeField: function (element) {
			var zipCodeField = element.closest('.address-fields-container').find('.zipcode');
			zipCodeField.val('');
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
							valid_zipcode: true,
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
							
							for(var i = 0; i < addressFieldClasses.length; i++)
								arrayAddressFields[addressFieldClasses[i]] = data[addressFieldClasses[i]+this.options.addressFieldSeparator+index];
								
							formData.address.push(JSON.stringify(arrayAddressFields));
						}
					}
				}
			}
			
			return formData;
		},
		
		onChangeAccountType: function (ev) {
			var multipleAddress = Const.MULTIPLEADDRESS;
			var accountTypeText = $(ev.target).find('option:selected').text();
			
			if(multipleAddress.indexOf(accountTypeText) < 0) {
				$('#account-adresses').find('.address-fields-container:gt(0)').remove();
			}
		},
	});

  return AccountAddView;
  
});