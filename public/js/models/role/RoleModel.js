define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var RoleModel = Backbone.Model.extend({
		urlRoot: '/apiv1/roles',
		defaults: {
            name: '',
            description: '',
        },
		/*runFetch: function () {
			this.fetch({
				success: function(model, response, options) {
					//console.log('success: UserModel.fetch()');
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}
				},
				error: function(model, response, options) {
					//console.log('error: UserModel.fetch()');
				},
			});
		},*/
	});

	return RoleModel;

});
