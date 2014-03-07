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
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			
			this.collection = new RoleCollection();
			this.collection.on('sync', function() {
				//console.log('collection.on.sync')
				thisObj.displayRoles();
				this.off('sync');
			});
			
			this.collection.on('error', function(collection, response, options) {
				//console.log('collection.on.error')
				//console.log(collection);
				//console.log(response);
				//console.log(options);
				this.off('error');
			});
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
					},
					headers: userModel.getAuth(),});
				}
			});
			
			this.collection.getAllModels();
		},
		
		displayRoles: function (){
			var checkboxes = '';
			_.each(this.collection.models, function (role) {
				checkboxes += '<div class="checkbox"><label><input type="checkbox" name="roles" value="'+role.get('id')+'">'+role.get('name')+'</label></div>';
			});
			
			$('.user-role-container').html(checkboxes);
			$('.form-button-container').show();
		},
	});

  return UserAddView;
  
});