define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'models/account/AccountModel',
	'models/account/AccountExtrasModel',
	'collections/address/CityCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountAddTemplate.html',
	'text!templates/account/accountAddressTemplate.html',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, PhoneNumber, AccountModel, AccountExtrasModel, CityCollection, contentTemplate, accountAddTemplate, accountAddressTemplate, Global, Const){

	var AccountEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			addressFieldClone: null,
			addressFieldCounter: 0,
			addressFieldClass: ['type', 'street', 'state', 'city', 'zipcode', 'country', 'id'],
			addressFieldClassRequired: ['street', 'state', 'city'],
			addressFieldSeparator: '.',
		},
		
		accountExtrasModel: null, 
		
		initialize: function(option) {
			var thisObj = this;
			
			this.accountExtrasModel = new AccountExtrasModel();
			this.accountExtrasModel.on("change", function() {
				thisObj.model.runFetch();
				this.off("change");
			});
			
			this.model = new AccountModel({id:option.id});
			this.model.on("change", function() {
				thisObj.displayForm();
				this.off("change");
			});
		},
		
		render: function(){
			this.accountExtrasModel.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var varAccountAddressTemplate = {
				'address_types': this.accountExtrasModel.get('addressTypes'),
				'address_states': this.accountExtrasModel.get('states'),
				'show_id': true,
			};
			
			var addressTemplate = _.template(accountAddressTemplate, varAccountAddressTemplate);
			
			var innerTemplateVariables = {
				'account_url': '#/'+Const.URL.ACCOUNT,
				'address_fields': addressTemplate,
				'account_types': this.accountExtrasModel.get('accountTypes'),
				'account_id': this.model.get('id'),
			};
			var innerTemplate = _.template(accountAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Edit Account",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			
			this.options.addressFieldClone = this.$el.find('.address-fields-container').clone();
			this.options.addressFieldClone.find('#add-address-field').remove();
			
			this.addIndexToAddressFields(this.$el.find('.address-fields-container'));
			
			this.$el.find('.remove-address-fields').remove();
			this.$el.find('.type').attr('readonly', true);
			
			$('.form-button-container').show();
			
			var validate = $('#addAccountForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					console.log(data);
					
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
			});
			this.addValidationToAddressFields();
			
			this.supplyAccountData();
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
		
		events: {
			'click #add-address-field' : 'addAddressFields',
			'click .remove-address-fields' : 'removeAddressFields',
			'change .state' : 'onChangeStateField',
		},
		
		addAddressFields: function () {
			var clone = this.options.addressFieldClone.clone();
			this.addIndexToAddressFields(clone);
			$('#account-adresses').append(clone);
			this.addValidationToAddressFields();
		},
		
		removeAddressFields: function (ev) {
			$(ev.target).closest('.address-fields-container').remove();
		},
		
		onChangeStateField: function (ev) {
			var stateField = $(ev.target);
			var stateId = stateField.val();
			var cityField = stateField.closest('.address-fields-container').find('.city');
			
			if(stateField.val() != '') {
				this.fetchCityList(stateId, cityField);
			}
			else
				cityField.find('option:gt(0)').remove();
		},
		
		fetchCityList: function (stateId, cityField, selectedCityId) {
			var cityCollection = new CityCollection();
			cityCollection.on('sync', function() {
				cityField.find('option:gt(0)').remove();
				
				_.each(this.models, function (city){
					cityField.append($('<option></option>').attr('value', city.get('id')).text(city.get('city')));
				});
				
				if(selectedCityId != null)
					cityField.val(selectedCityId);
				this.off('sync');
			});
			
			cityCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			cityCollection.getModels(stateId);
		},
		
		addValidationToAddressFields: function () {
			var addressFieldClassRequired = this.options.addressFieldClassRequired;
			for(var i=0; i < addressFieldClassRequired.length; i++) {
				$('.'+addressFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
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
			//var addresses = [];
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
								
							formData.address.push(JSON.stringify(arrayAddressFields));
						}
					}
				}
			}
			
			//formData.address = JSON.stringify(addresses)
			//formData.address = addresses;
			
			return formData;
		},
		
		supplyAccountData: function () {
			$('#name').val(this.model.get('name'));
			$('#accounttype').val(this.model.get('accounttype'));
			$('#website').val(this.model.get('website'));
			$('#description').val(this.model.get('description'));
			$('#phone').val(this.model.get('phone'));
			
			var addresses = this.model.get('address');
			console.log(addresses);
			
			for(var i = 0; i < addresses.length; i++) {
				if(i > 0)
					this.addAddressFields();
			
				var fieldContainer = $('#account-adresses .address-fields-container:last-child');
				fieldContainer.find('.id').val(addresses[i].id);
				
				if(i > 0)
					fieldContainer.find('.type').val(addresses[i].type);
				
				fieldContainer.find('.street').val(addresses[i].street);
				fieldContainer.find('.state').val(addresses[i].state);
				this.fetchCityList(addresses[i].state, fieldContainer.find('.city'), addresses[i].city);
				fieldContainer.find('.zipcode').val(addresses[i].zipcode);
			}
		},
	});

  return AccountEditView;
  
});