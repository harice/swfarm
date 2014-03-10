define([
	'backbone',
	'jqueryvalidate',
	'bootstrap',
	'base64',
	'models/session/SessionModel',
	'text!templates/login/loginForm.html',
	'constant',
], function(Backbone, Validate, Bootstrap, Base64, Session, loginForm, Const){

	var LoginView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			
		},
		
		render: function(){
			var compiledTemplate = _.template(loginForm, {});
			this.$el.html(compiledTemplate);

			var validate = $('.form-signin').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var token = Base64.encode(data.username+':'+data.password);
					Session.login(token);
				}
			});
		}

	});

  return LoginView;
  
});