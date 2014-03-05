define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
	'collections/role/RoleCollection',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, userAddTemplate, UserModel, RoleCollection, Global, Const){

	var UserAddView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			this.collection = new RoleCollection();
		},
		
		render: function(){
			
			var innerTemplateVariables = {
				'user_url' : '#/'+Const.URL.USER
			};
			var innerTemplate = _.template(userAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add User",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#addUserForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					if(typeof data.roles != 'undefined' && typeof data.roles != 'string')
						data.roles = data.roles.join(',');
					
					var userModel = new UserModel(data);
					
					userModel.save(null, {success: function (model, response, options) {
						//console.log('success: add user');
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}, error: function (model, response, options) {
						//console.log('error: add user');
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					}});
				}
			});
			
			this.collection.getAllModels(this.displayRoles);
		},
		
		displayRoles: function (roleCollection){
			var checkboxes = '';
			_.each(roleCollection.models, function (role) {
				checkboxes += '<div class="checkbox"><label><input type="checkbox" name="roles" value="'+role.get('id')+'">'+role.get('name')+'</label></div>';
			});
			
			$('.user-role-container').html(checkboxes);
			$('.form-button-container').show();
		},
	});

  return UserAddView;
  
});