define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleViewTemplate.html',
	'models/role/RoleModel',
	'global',
	'constant',
], function(Backbone, contentTemplate, roleViewTemplate, RoleModel, Global, Const){

	var UserView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new RoleModel({id:option.id});
			this.model.on("change", function() {
				console.log('onChange: RoleModel');
				if(this.hasChanged('name')) {
					thisObj.displayRole(this);
					this.off("change");
				}
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayRole: function (roleModel) {
			var innerTemplateVariables = {
				role:roleModel,
				role_url:'#/'+Const.URL.ROLE,
				role_edit_url:'#/'+Const.URL.ROLE+'/'+Const.CRUD.EDIT,
			}
			var innerTemplate = _.template(roleViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: roleModel.get('name'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		events: {
			'click #delete' : 'removeRole',
		},
		
		removeRole: function (){
			var thisObj = this;
			
			var verifyDelete = confirm('Are you sure you want to delete this role?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
						thisObj.displayMessage(response);
						Global.getGlobalVars().app_router.navigate(Const.URL.ROLE, {trigger: true});
					},
					error: function (model, response, options) {
						thisObj.displayMessage(response);
					},
					wait: true,
					headers: thisObj.model.getAuth(),
				});
			}
		},
		
	});

  return UserView;
  
});