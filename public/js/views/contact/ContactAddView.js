define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, contactAddTemplate, ContactModel, NotificationView, Global, Const){

	var ContactAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			//console.log('ContactAdd.js:init');
		},
		
		render: function(){
			// var thisObj = this;
            var innerTemplateVariables = {
				'contact_url' : '#/'+Const.URL.CONTACT
			};
			var innerTemplate = _.template(contactAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Contact",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#addContactForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var contactModel = new ContactModel(data);
					contactModel.save(
                        null,
                        {
                        success:
                            function (model, response, options) {
                                var message = new NotificationView({ type: 'success', text: 'Contact has been created.' });
                                Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
                            },
                        error:
                            function (model, response, options) {
                                var message = new NotificationView({ type: 'error', text: 'Sorry! An error occurred in the process.' });
                                if(typeof response.responseJSON.error == 'undefined')
                                    validate.showErrors(response.responseJSON);
                                else
                                    // Display message
                                    // thisObj.displayMessage('Failed adding new contact. ', 'error');
                                    // var message = new NotificationView({ type: 'danger' });
                            },
                        headers: contactModel.getAuth(),
                        }
                    );
				}
			});
		},
		
	});

  return ContactAddView;
  
});