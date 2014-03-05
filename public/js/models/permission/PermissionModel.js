define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var PermissionModel = Backbone.Model.extend({
		urlRoot: '',
		defaults: {
            role: '',
            permissioncategorytype: '',
        },
		runFetch: function () {
			this.fetch({
				success: function(model, response, options) {
					//console.log('success: UserModel.fetch()');
					if(typeof response.error != 'undefined') {
						alert(response.message);
						//Global.getGlobalVars().app_router.navigate(Const.URL.ADMIN, {trigger: true});
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

	return PermissionModel;

});
