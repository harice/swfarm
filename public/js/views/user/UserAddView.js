define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, userAddTemplate, UserModel, Global, Const){

	var UserAddView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			//console.log('UserAdd.js:init');
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