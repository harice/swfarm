define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
], function(Backbone, Validate, contentTemplate, userAddTemplate, UserModel){

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
			$('#addUserForm').validate({
				rules: {
					newpassword: 'required',
					verifynewpassword: {
						equalTo: '#newpassword'
					}
				},
				messages: {
					verifynewpassword: {
						equalTo: 'password does no match'
					}
				},
				submitHandler: function(form) {
					//alert(4444);
					//console.log('email: '+$(form).find('#email').val());
					//console.log($(form).serializeArray());
					//console.log($(form).serializeObject());
					console.log('submitHandler start');
					var data = $(form).serializeObject();
					var userModel = new UserModel(data);
					userModel.save({success: function (model, response, options) {
						console.log('success');
						console.log(model);
						console.log(response);
						console.log(options);
					}, error: function (model, response, options) {
						console.log('error');
						console.log(model);
						console.log(response);
						console.log(options);
					}});
					console.log('submitHandler end');
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