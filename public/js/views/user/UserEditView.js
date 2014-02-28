define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, userAddTemplate, UserModel, Global, Const){

	var UserEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new UserModel({id:option.id});
			this.model.on("change", function() {
				console.log('onChange: UserModel');
				if(this.hasChanged('firstname') && this.hasChanged('lastname') && this.hasChanged('email') && this.hasChanged('username')) {
					thisObj.displayUser(this);
					this.off("change");
				}
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayUser: function(userModel) {
			var innerTemplateVariables = {
				user_id: userModel.get('id'),
				'user_url' : '#/'+Const.URL.USER
			};
			var innerTemplate = _.template(userAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Edit User",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('#firstname').val(userModel.get('firstname'));
			this.$el.find('#lastname').val(userModel.get('lastname'));
			this.$el.find('#suffix').val(userModel.get('suffix'));
			this.$el.find('#email').val(userModel.get('email'));
			this.$el.find('#position').val(userModel.get('position'));
			this.$el.find('#emp_no').val(userModel.get('emp_no'));
			this.$el.find('#phone').val(userModel.get('phone'));
			this.$el.find('#mobile').val(userModel.get('mobile'));
			this.$el.find('#username').val(userModel.get('username'));
			
			var validate = $('#addUserForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var userModel = new UserModel(data);
					userModel.save(null, {success: function (model, response, options) {
						//console.log('success: add user');
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}, error: function (model, response, options) {
						//console.log('error: add user');
						if(response.responseJSON)
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					}});
				}
			});
		},
	});

  return UserEditView;
  
});