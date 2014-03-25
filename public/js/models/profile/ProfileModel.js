define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var ProfileModel = Backbone.Model.extend({
		urlRoot: '/apiv1/users/updateprofile',
		
		defaults: {
            firstname: '',
            lastname: '',
			email:'',
            emp_no: '',
        },
		
		runFetch: function () {
			this.setFetchURL();
			
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					//console.log('success: UserModel.fetch()');
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.PROFILE, {trigger: true});
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
		
		getDefaultURL: function () {
			return '/apiv1/users/updateprofile';
		},
		
		setDefaultURL: function () {
			this.urlRoot = this.getDefaultURL();
		},
		
		setFetchURL: function () {
			this.urlRoot = '/apiv1/users';
		},
	});

	return ProfileModel;

});
