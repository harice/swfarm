define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, PhoneNumber, contentTemplate, contactAddTemplate, ContactModel, NotificationView, Global, Const){

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
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			this.$el.find('.mobile-number').phoneNumber({'divider':'-', 'dividerPos': new Array(1,5,9)});
			
			this.$el.find('#firstname').val(contactModel.get('firstname'));
            this.$el.find('#lastname').val(contactModel.get('lastname'));
			this.$el.find('#account').val(contactModel.get('account'));
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
		},
	});

  return ContactEditView;
  
});