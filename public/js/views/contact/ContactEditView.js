define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
    'collections/account/AccountNameCollection',
    'views/notification/NotificationView',
    'views/AutoCompleteView',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, contactAddTemplate, ContactModel, AccountNameCollection, NotificationView, AutoCompleteView, Global, Const){

	var ContactEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
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
			
			this.$el.find('#firstname').val(contactModel.get('firstname'));
            this.$el.find('#lastname').val(contactModel.get('lastname'));
			this.$el.find('#account').val(contactModel.get('account').name);
            this.$el.find('#position').val(contactModel.get('position'));
            this.$el.find('#email').val(contactModel.get('email'));
            this.$el.find('#phone').val(contactModel.get('phone'));
            this.$el.find('#mobile').val(contactModel.get('mobile'));
			
			var validate = $('#addContactForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var contactModel = new ContactModel(data);
					contactModel.save(null, {success: function (model, response, options) {
                        var message = new NotificationView({ type: 'success', text: 'Contact has been updated.' });
						Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
					}, error: function (model, response, options) {
                        var message = new NotificationView({ type: 'error', text: 'Sorry! An error occurred in the process.' });
						if(response.responseJSON)
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					},
					headers: contactModel.getAuth(),});
				}
			});
            
            var Accounts = new AccountNameCollection();
            
            new AutoCompleteView({
                input: $('#account'),
                model: Accounts
            }).render();
		},
	});

  return ContactEditView;
  
});