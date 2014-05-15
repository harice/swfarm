define([
	'backbone',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
    'collections/account/AccountNameCollection',
	'collections/account/AccountAutocompleteCollection',
    'views/autocomplete/AutoCompleteView',
	'views/autocomplete/AccountCustomAutoCompleteView',
	'global',
	'constant',
], function(Backbone,
			AppView,
			Validate,
			TextFormatter,
			PhoneNumber,
			contentTemplate,
			contactAddTemplate,
			ContactModel,
			AccountNameCollection,
			AccountAutocompleteCollection,
			AutoCompleteView,
			AccountCustomAutoCompleteView,
			Global,
			Const
){

	var ContactAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		accountAutoCompleteView: null,
		
		initialize: function() {
			this.contactId = null;
			this.h1Title = 'Contacts';
			this.h1Small = 'add';
		},
		
		render: function(){
            this.displayForm();
		},
		
		displayForm: function(){
			var thisObj = this;
			
            var innerTemplateVariables = {
				'contact_url' : '#/'+Const.URL.CONTACT
			};
			
			if(this.contactId != null)
				innerTemplateVariables['contact_id'] = this.contactId;
			
			var innerTemplate = _.template(contactAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			this.$el.find('.mobile-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			
            this.initValidateForm();
			this.initAccountAutocomplete();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#addContactForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var contactModel = new ContactModel(data);
					contactModel.save(
                        null,
                        {
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: contactModel.getAuth(),
                        }
                    );
				},
                
                messages: {
					phone: {
                        minlength: 'Please enter a valid phone number.',
						maxlength: 'Please enter a valid phone number.',
					},
                    
                    mobile: {
                        minlength: 'Please enter a valid mobile number.',
						maxlength: 'Please enter a valid mobile number.',
					},
				}
			});
		},
		
		initAccountAutocomplete: function () {
			var thisObj = this;
			
			if(this.accountAutoCompleteView != null)
				this.accountAutoCompleteView.deAlloc();
			
			var accountAutocompleteCollection = new AccountAutocompleteCollection();
			this.accountAutoCompleteView = new AccountCustomAutoCompleteView({
                input: $('#account'),
				hidden: $('#account_id'),
                collection: accountAutocompleteCollection,
            });
			
			this.accountAutoCompleteView.render();
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});
    
    return ContactAddView;
});

