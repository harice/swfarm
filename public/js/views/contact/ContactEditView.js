define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, contactAddTemplate, ContactModel, Global, Const){

	var ContactEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new ContactModel({id:option.id});
			this.model.on("change", function() {
				if(this.hasChanged('name')) {
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
			
			this.$el.find('#name').val(contactModel.get('name'));
			this.$el.find('#description').val(contactModel.get('description'));
			
			var validate = $('#addContactForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var contactModel = new ContactModel(data);
					contactModel.save(null, {success: function (model, response, options) {
						Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
					}, error: function (model, response, options) {
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