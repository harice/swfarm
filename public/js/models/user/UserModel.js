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
			roles: '',
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					//console.log('success: UserModel.fetch()');
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}
					/*else {
						console.log(model);
					}*/
				},
				error: function(model, response, options) {
					//console.log('error: UserModel.fetch()');
				},
				headers: thisObj.getAuth(),
			});
		},
	});

	return UserModel;

});
