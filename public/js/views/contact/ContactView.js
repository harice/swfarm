define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactViewTemplate.html',
	'models/contact/ContactModel',
	'global',
	'constant',
], function(Backbone, AppView, contentTemplate, contactViewTemplate, ContactModel, Global, Const){

	var ContactView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			
			this.model = new ContactModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist())
					thisObj.displayContact(this);
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayContact: function (contactModel) {
			var innerTemplateVariables = {
				contact:contactModel,
				contact_url:'#/'+Const.URL.CONTACT,
				contact_edit_url:'#/'+Const.URL.CONTACT+'/'+Const.CRUD.EDIT,
			}
			var innerTemplate = _.template(contactViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: contactModel.get('lastname')+', '+contactModel.get('firstname'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this contact?',
										'confirm-delete-contact',
										'Delete');
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-contact': 'showConfirmationWindow',
			'click #confirm-delete-contact': 'deleteContact',
		},
		
		deleteContact: function (){
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    //Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},
		
	});

  return ContactView;
  
});