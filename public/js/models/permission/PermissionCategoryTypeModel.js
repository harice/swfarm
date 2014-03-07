define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var PermissionCategoryTypeModel = Backbone.Model.extend({
		urlRoot: '/apiv1/permission/getAllPermissionCategoryType',
		defaults: {
            /*permissioncategory: '',
            permissiontype: '',*/
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					console.log('success: UserModel.fetch()');
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
				headers: thisObj.getAuth(),
			});
		},
	});

	return PermissionCategoryTypeModel;

});
