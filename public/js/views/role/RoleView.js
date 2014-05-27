define([
	'backbone',
    'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleViewTemplate.html',
	'models/role/RoleModel',
	'global',
	'constant',
], function(Backbone, AppView, contentTemplate, roleViewTemplate, RoleModel, Global, Const){

	var UserView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			
			this.model = new RoleModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist())
					thisObj.displayRole(this);
				this.off("change");
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
			this.subContainer.html(compiledTemplate);
            
            this.initConfirmationWindow('Are you sure you want to delete this role?',
										'confirm-delete-role',
										'Delete');
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
            'click #delete-role': 'showConfirmationWindow',
			'click #confirm-delete-role': 'deleteRole',
		},
		
		deleteRole: function (){
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    //Global.getGlobalVars().app_router.navigate(Const.URL.ROLE, {trigger: true});
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

  return UserView;
  
});