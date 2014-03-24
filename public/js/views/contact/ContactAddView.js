define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
    'collections/account/AccountNameCollection',
    'views/notification/NotificationView',
    'views/AutoCompleteView',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, PhoneNumber, contentTemplate, contactAddTemplate, ContactModel, AccountNameCollection, NotificationView, AutoCompleteView, Global, Const){

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
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			this.$el.find('.mobile-number').phoneNumber({'divider':'-', 'dividerPos': new Array(1,5,9)});
			
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
                                    var message = new NotificationView({ type: 'danger' });
                            },
                        headers: contactModel.getAuth(),
                        }
                    );
				}
			});
            
            var Accounts = new AccountNameCollection();
            
            new AutoCompleteView({
                input: $('#account'),
                model: Accounts
            }).render();
            
		}
        
	});
    
    
    
    return ContactAddView;
});

