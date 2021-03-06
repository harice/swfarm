define([
	'backbone',
	'views/base/AppView',
	'views/base/GoogleMapsView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'bootstrapmultiselect',
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
			GoogleMapsView,
			Validate,
			TextFormatter,
			PhoneNumber,
			bootstrapMultiSelect,
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
			this.initSubContainer();
			var thisObj = this;
			this.accountId = null;
			this.h1Title = 'Account';
			this.h1Small = 'add';
			this.options = {
				addressFieldClone: null,
				addressFieldCounter: 0,
				addressFieldClass: ['type', 'street', 'state', 'city', 'zipcode', 'country', 'id', 'latitude', 'longitude'],
				addressFieldClassRequired: ['street', 'state', 'city', 'zipcode', 'latitude', 'longitude'],
				addressFieldSeparator: '.',
				addressTypeUniqueForCustomer: null,
				addressTypeUniqueForProducer: null,
				addressTypeList: null,
			};
			
			this.accountExtrasModel = new AccountExtrasModel();
			this.accountExtrasModel.on("change", function() {
				if(thisObj.subContainerExist()){
					thisObj.displayForm();
					thisObj.maskInputs();
					thisObj.focusOnFirstField();
				}
				this.off("change");
			});
		},
		
		render: function(){
			this.accountExtrasModel.runFetch();
			Backbone.View.prototype.refreshTitle('Accounts','add');
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
			this.subContainer.html(compiledTemplate);

			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initGetMapLocation(function (data) {
				var index = $("#google-maps-modal-getlocation").attr('data-id', index);
				if(typeof data.location !== 'undefined') {					
					thisObj.subContainer.find(".latitude[name='latitude."+ index +"']").val(data.location.lat());
					thisObj.subContainer.find(".longitude[name='longitude."+ index +"']").val(data.location.lng());
				}
				else {
					thisObj.subContainer.find('.latitude').val('');
					thisObj.subContainer.find('.longitude').val('');
				}
			});			
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			// this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			this.$el.find('#accounttype').multiselect({
				buttonClass: 'btn btn-default btn-sm',
				includeSelectAllOption: true,
				includeSelectAllIfMoreThan:5,
	        	enableFiltering: true,
	        	enableCaseInsensitiveFiltering: true,
	        	disableIfEmpty: true,
	        	maxHeight: 250,
	        	nonSelectedText: 'Select account type',
	        	nSelectedText: 'types selected',
	        	selectedClass: null,
	        	selectAllValue: '',
	        	checkboxName: 'accounttype',
	            templates: {
	            	filter: '<div class="input-group input-group-sm margin-right-10 margin-left-5"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div>',
	            }
			});
            this.maskInputs();
			this.initValidateForm();
			this.addAddressFields();				

			//$('.form-button-container').show();
		},
		
		initValidateForm: function () {
			var thisObj = this;			
			
			var validate = $('#addAccountForm').validate({
				submitHandler: function(form) {						
					var data = thisObj.formatFormField($(form).serializeObject());

					var accountModel = new AccountModel(data);					
					accountModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);	
								//Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response);
								else
									thisObj.displayMessage(response);
							},
							headers: accountModel.getAuth(),
						}
					);
				},

				errorPlacement: function (error, element) {
					if($(element).hasClass("accounttype")) {
						$(element).parent().append(error);
					}
					else
						error.insertAfter(element);
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

		setCoordinates: function (ev){		
			var address;
			var geocoder = new google.maps.Geocoder();
			var data = this.formatFormField($("#addAccountForm").serializeObject());			
			var state;
			var index = $(ev.target).parents('.address-fields-container').attr('data-id');

			_.each(data.address, function(add){	
				if(add.state != '')
					state = $(".state[name='state."+ index +"']").find("option[value='"+ add.state +"']").text();
				else 
					state = '';
				
				address = add.street + ', ' + add.city + ', ' + state +', ' + add.zipcode + ' USA';

				if (geocoder) {
			      geocoder.geocode({ 'address': address }, function (results, status) {
			         if (status == google.maps.GeocoderStatus.OK) {
			         	$(".country").next('.error-msg-cont').fadeOut();
			         	$(".latitude[name='latitude."+ index +"']").val(results[0].geometry.location.lat());
			         	$(".longitude[name='longitude."+ index +"']").val(results[0].geometry.location.lng());			         
			         }
			         else {
			         	$(".country").next('.error-msg-cont').fadeOut();
			            $("<span class='error-msg-cont'><label class='error margin-bottom-0'>Invalid Address</label></div>").insertAfter($(".country"));
			         }
			      });
			   }				
			});
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #add-address-field' : 'addAddressFields',
			'click .remove-address-fields' : 'removeAddressFields',
			'change #accounttype': 'updateFieldTypes',
			'click .type': 'checkType',
			'change #addAccountForm': 'setCoordinates',
			'click .map': 'showMap',
			'change #account-adresses fieldset:first-child': 'onChangeBusinessAddress'
		},

		onChangeBusinessAddress: function(){			
			//Check all Business address fields
			var businessAddressFields = this.$el.find("#account-adresses fieldset:first-child");
			if(businessAddressFields.find('.street').val() != '' && businessAddressFields.find('.city').val() != '' && businessAddressFields.find('.state').val() != '' && businessAddressFields.find('.zipcode').val() != '' && businessAddressFields.find('.latitude').val() != '' && businessAddressFields.find('.longitude').val() != ''){
				if($('.type').find('option:selected[value="2"]').length == 0){		
					this.$el.find("#add-address-field").removeClass('hidden');								
				}
				else if($('.type').find('option:selected[value="2"]').length > 0){						
					var index = this.options.addressTypeList.indexOf(2);
					if(index >= 0)
						this.options.addressTypeList.splice(index, 1);

					if(typeof this.options.addressTypeList[0] == "undefined")
						this.$el.find("#add-address-field").addClass('hidden');
					else{
						this.$el.find("#add-address-field").removeClass('hidden');	
					}
				}
				else{					
					this.$el.find("#add-address-field").addClass('hidden');
				}
			}
			else {				
				if(this.$el.find("#add-address-field").not('.hidden'))
					this.$el.find("#add-address-field").addClass('hidden');
			}			

		},

		showMap: function (ev) {
			var thisObj = this;
			var latitude = '';
			var longitude = '';
			var index = $(ev.target).parents('.address-fields-container').attr('data-id');		

			if($('.street[name="street.'+ index +'"]').val() == '' && $('.city[name="city.'+ index +'"]').val() == '' && $('.state[name="state.'+ index +'"]').val() == '' && $('.zipcode[name="zipcode.'+ index +'"]').val() == ''){
				$(".map").next('.error-msg-cont').fadeOut();
				$("<span class='error-msg-cont'><label class='error margin-bottom-0'>Input address</label></div>").insertAfter($(ev.target));
			}
			else {				
				$(".map").next('.error-msg-cont').fadeOut();
				latitude = $('.latitude[name="latitude.'+ index +'"]').val();
				longitude = $('.longitude[name="longitude.'+ index +'"]').val();
				thisObj.googleMaps.showModalGetLocation({lat: latitude, lng: longitude});
				$("#google-maps-modal-getlocation").attr('data-id', index);
			}			
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

				//this.options.addressTypeUniqueForCustomer = this.options.addressFieldClone.find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.CUSTOMER; }).clone();
				//this.options.addressTypeUniqueForProducer = this.options.addressFieldClone.find('.type option').filter(function () { return $(this).html() == Const.ACCOUNT.UNIQUEADDRESS.PRODUCER; }).clone();
				
				var addressTypeField = this.$el.find('.type');
				addressTypeField.attr('disabled', true);
				addressTypeField.after('<input class="type" type="hidden" name="'+addressTypeField.attr('name')+'" value="'+addressTypeField.val()+'" />');
				
				this.addIndexToAddressFields(this.$el.find('#account-adresses > .address-fields-container:first-child'));
				
				this.$el.find('.remove-address-fields').remove();
				clone = this.$el.find('#account-adresses > .address-fields-container:first-child');				
			}
			else {								
				var clone = this.options.addressFieldClone.clone();
				this.updateFieldTypes();
				clone.find('.type').html(this.generateAddressTypes());									
				
				this.addIndexToAddressFields(clone);
				$('#account-adresses').append(clone);

				this.onChangeBusinessAddress();
			}
			
			this.addValidationToAddressFields();
			return clone;
		},
		
		removeAddressFields: function (ev) {			
			$(ev.target).closest('.address-fields-container').remove();				

			this.updateFieldTypes();
			this.onChangeBusinessAddress();

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
				joAddressFields.attr('data-id', this.options.addressFieldCounter);
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


		checkType: function(ev){
			var mailOption = '<option value="2">Mailing Address</option>';
			var element = $(ev.target);	

			if(element.is(":not(option)") && this.generateAddressTypes() != '') {
				this.updateFieldTypes();

				if(element.val() != 2)
					element.html(this.generateAddressTypes());
				else{
					mailOption += this.generateAddressTypes();
					element.html(mailOption);
				}				
			}			
								
		},	

		updateFieldTypes: function(){
			this.options.addressTypeList = [];				
			var multipleAddress = Const.ACCOUNT.MULTIPLEADDRESS;
			var accountTypeVal = $("#accounttype").val();
			var accountTypeText = [];
			var index = -1;			

			_.each(accountTypeVal, function(option){
				accountTypeText.push($("#accounttype").find('option[value="'+ option +'"]').text());
			});					
			
			if(accountTypeText.indexOf('Customer') >= 0)
				this.options.addressTypeList.push(4);

			if(accountTypeText.indexOf('Producer') >= 0)
				this.options.addressTypeList.push(3);

			if($('.type').find('option:selected[value="2"]').length == 0)
				this.options.addressTypeList.push(2);

			if(this.options.addressTypeList == null || this.options.addressTypeList[0] == 2){
				this.cleanAddressFields();
			}
			else if (typeof this.options.addressTypeList[0] == 'undefined'){				
				this.cleanAddressFields();
			}	

			this.onChangeBusinessAddress();			
		},

		generateAddressTypes: function(){						
			var dropdown = '';
			_.each(this.options.addressTypeList, function(option){
				dropdown += '<option value="'+ option +'">' + $('[name="type.0"] option[value="'+ option +'"]').text() + '</option>';
			});						

			return dropdown;
		},

		cleanAddressFields: function(){
			_.each($('.address-fields-container'), function(field){
				if($(field).attr('data-id') > 0 && $(field).find('.type').val() != 2){
					$(field).remove();
				}
			});
		},
	});

  return AccountAddView;
  
});