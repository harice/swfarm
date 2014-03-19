define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleAddTemplate.html',
	'models/role/RoleModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, roleAddTemplate, RoleModel, NotificationView, Global, Const){

	var RoleEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new RoleModel({id:option.id});
			this.model.on("change", function() {
				if(this.hasChanged('name')) {
					thisObj.displayRole(this);
					this.off("change");
				}
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayRole: function(roleModel) {
			var innerTemplateVariables = {
				role_id: roleModel.get('id'),
				'role_url' : '#/'+Const.URL.ROLE,
			};
			var innerTemplate = _.template(roleAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Edit Role",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('#name').val(roleModel.get('name'));
			this.$el.find('#description').val(roleModel.get('description'));
			
			var validate = $('#addRolesForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var roleModel = new RoleModel(data);
					roleModel.save(null, {success: function (model, response, options) {
                        var message = new NotificationView({ type: 'success', text: 'Role has been updated.' });
						Global.getGlobalVars().app_router.navigate(Const.URL.ROLE, {trigger: true});
					}, error: function (model, response, options) {
                        var message = new NotificationView({ type: 'error', text: 'Sorry! An error occurred in the process.' });
						if(response.responseJSON)
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					},
					headers: roleModel.getAuth(),});
				}
			});
		},
	});

  return RoleEditView;
  
});