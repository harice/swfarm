define([
	'backbone',
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

	var ContactEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		accountAutoCompleteView: null,
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new ContactModel({id:option.id});
			this.model.on("change", function() {
				if(this.hasChanged('lastname')) {
					thisObj.displayContact(this);
					this.off("change");
				}
			});
		},
		
		render: function(){
            this.model.runFetch();
		},
		
		displayContact: function(contactModel) {
			var thisObj = this;
			
			var innerTemplateVariables = {
				contact_id: contactModel.get('id'),
				'contact_url' : '#/'+Const.URL.CONTACT,
			};
			var innerTemplate = _.template(contactAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Edit Contact",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			this.$el.find('.mobile-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			
			var validate = $('#addContactForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var contactModel = new ContactModel(data);
					contactModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
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
				}
			});
            
            /*var accountNameCollection = new AccountNameCollection();
            
            new AutoCompleteView({
                input: $('#account'),
				hidden: $('#account_id'),
                collection: accountNameCollection
            }).render();*/
			
			this.initAccountAutocomplete();
			this.supplyContactData();
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
		
		supplyContactData: function () {
			var contact = this.model;
			var account = this.model.get('account');
			
			this.$el.find('#firstname').val(contact.get('firstname'));
            this.$el.find('#lastname').val(contact.get('lastname'));
            this.$el.find('#suffix').val(contact.get('suffix'));
			this.accountAutoCompleteView.autoCompleteResult = [{name:account.name, id:account.id}];
            this.$el.find('#account').val(account.name);
			this.$el.find('#account_id').val(account.id);
            this.$el.find('#position').val(contact.get('position'));
            this.$el.find('#email').val(contact.get('email'));
            this.$el.find('#phone').val(contact.get('phone'));
            this.$el.find('#mobile').val(contact.get('mobile'));
            this.$el.find('#account_id').val(contact.get('account').id);
		},
	});

  return ContactEditView;
  
});