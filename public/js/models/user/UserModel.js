define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var UserModel = Backbone.Model.extend({
		urlRoot: '/apiv1/users',
		defaults: {
            firstname: '',
            lastname: '',
			email:'',
            emp_no: '',
			username:'',
        },
		runFetch: function () {
			this.fetch({
				success: function(model, response, options) {
					//console.log('success: UserModel.fetch()');
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}
					/*else {
						console.log(model);
					}*/
				},
				error: function(model, response, options) {
					//console.log('error: UserModel.fetch()');
				},
			});
		},
	});

	return UserModel;

});
