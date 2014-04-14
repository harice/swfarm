define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
    'collections/account/AccountNameCollection',
    'views/autocomplete/AutoCompleteView',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, PhoneNumber, contentTemplate, contactAddTemplate, ContactModel, AccountNameCollection, AutoCompleteView, Global, Const){

	var ContactAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			//console.log('ContactAdd.js:init');
		},
		
		render: function(){
			var thisObj = this;
			
            var innerTemplateVariables = {
				'contact_url' : '#/'+Const.URL.CONTACT
			};
			var innerTemplate = _.template(contactAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Contacts",
				h1_small: "add",
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
            
            var accountNameCollection = new AccountNameCollection();
            
            new AutoCompleteView({
                input: $('#account'),
				hidden: $('#account_id'),
                collection: accountNameCollection
            }).render();
            
		}
        
	});
    
    
    
    return ContactAddView;
});

