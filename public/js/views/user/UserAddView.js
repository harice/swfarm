define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
	'global',
], function(Backbone, Validate, contentTemplate, userAddTemplate, UserModel, Global){

	var UserAddView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			//console.log('UserAdd.js:init');
		},
		
		render: function(){
			var variables = {
				h1_title: "Add User",
				sub_content_template: userAddTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			var validate = $('#addUserForm').validate({
				rules: {
					password: 'required',
					password_confirmation: {
						equalTo: '#password'
					}
				},
				messages: {
					password_confirmation: {
						equalTo: 'password does no match'
					}
				},
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var userModel = new UserModel(data);
					userModel.save(null, {success: function (model, response, options) {
						//console.log('success: add user');
						Global.getGlobalVars().app_router.navigate("/administration/users/", {trigger: true});
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

		events: {
			'click #save' : 'addUser',
		},
		
		addUser: function (){
			//alert('start adding user');
		},
		
	});

  return UserAddView;
  
});