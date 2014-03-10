define([
	'backbone',
	'views/login/LoginView',
	'views/login/LoginResetView',
	'constant',
], function(Backbone, LoginView, LoginResetView, Const){
	
	function LoginController () {	
		
		this.setAction = function (action) {
			
			switch (action) {
				case 'reset':
					return this.loginreset();
					break;
				
				default:
					return this.loginview();
			}
		};
		
		this.loginview = function() {
			return new LoginView();
		};

		this.loginreset = function () {
			return new LoginResetView();
		};
	};

	return LoginController;
});