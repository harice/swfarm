define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactViewTemplate.html',
	'models/contact/ContactModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, contentTemplate, contactViewTemplate, ContactModel, NotificationView, Global, Const){

	var ContactView = Backbone.View.extend({
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
			this.$el.html(compiledTemplate);
		},
		
		events: {
			'click #delete' : 'removeContact',
		},
		
		removeContact: function (){
			var thisObj = this;
			
			var verifyDelete = confirm('Delete Contact?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
						//console.log('success: UserModel.destroy');
						//console.log(response);
                        var message = new NotificationView({ type: 'success', text: 'Contact deleted successfully' });
						Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
					},
					error: function (model, response, options) {
						//console.log('error: UserModel.destroy');
						//console.log(response);
					},
					wait: true,
					headers: thisObj.model.getAuth(),
				});
			}
		},
		
	});

  return ContactView;
  
});