define([
	'backbone',
	'views/contact/ContactAddView',
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
			ContactAddView,
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

	var ContactEditView = ContactAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		accountAutoCompleteView: null,
		
		initialize: function(option) {
			var thisObj = this;
			this.contactId = option.id;
			this.h1Title = 'Contacts';
			this.h1Small = 'edit';
			
			this.model = new ContactModel({id:option.id});
			this.model.on("change", function() {
				thisObj.displayForm();
				thisObj.supplyContactData();
                thisObj.maskInputs();
				this.off("change");
			});
		},
		
		render: function(){
            this.model.runFetch();
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