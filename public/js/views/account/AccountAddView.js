define([
	'backbone',
	'jqueryvalidate',
	'models/account/AccountModel',
	'models/account/AccountExtrasModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountAddTemplate.html',
	'text!templates/account/accountAddressTemplate.html',
	'global',
	'constant',
], function(Backbone, Validate, AccountModel, AccountExtrasModel, contentTemplate, accountAddTemplate, accountAddressTemplate, Global, Const){

	var AccountAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			addressFieldClone: null,
			addressFieldCounter: 0,
			addressFieldClass: ['type', 'street', 'state', 'city', 'zipcode', 'country'],
			addressFieldClassRequired: ['street', 'state', 'city'],
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
			var test = this.model.get('accountTypes'); console.log(test);
			var varAccountAddressTemplate = {
				'address_types': this.model.get('addressTypes'),
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
			
			this.options.addressFieldClone = this.$el.find('.address-fields-container').clone();
			this.options.addressFieldClone.find('#add-address-field').remove();
			
			this.addIndexToAddressFields(this.$el.find('.address-fields-container'));
			
			this.$el.find('.remove-address-fields').remove();
			this.$el.find('.addresstype').attr('readonly', true);
			
			$('.form-button-container').show();
			
			var validate = $('#addAccountForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					console.log(data);
					//thisObj.formatFormField(data);
					
					var accountModel = new AccountModel(data);
					
					accountModel.save(null, {success: function (model, response, options) {
						//console.log('success: add user');
						Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
					}, error: function (model, response, options) {
						//console.log('error: add user');
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					},
					headers: accountModel.getAuth(),
					});
				},
			});
			this.addValidationToAddressFields();
		},
		
		events: {
			'click #add-address-field' : 'addAddressFields',
			'click .remove-address-fields' : 'removeAddressFields',
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
							
							for(var i = 0; i < addressFieldClasses.length; i++)
								arrayAddressFields[addressFieldClasses[i]] = data[addressFieldClasses[i]+this.options.addressFieldSeparator+index];
								
							formData.address.push(arrayAddressFields);
						}
					}
				}
			}
			
			//formData.address = JSON.stringify(addresses)
			//formData.address = addresses;
			
			return formData;
		},
		
	});

  return AccountAddView;
  
});