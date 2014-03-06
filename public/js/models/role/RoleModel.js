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
			permission: '',
        },
		runFetch: function () {
			this.fetch({
				success: function(model, response, options) {
					//console.log('success: UserModel.fetch()');
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.ROLE, {trigger: true});
					}
				},
				error: function(model, response, options) {
					//console.log('error: UserModel.fetch()');
				},
			});
		},
		getPermission: function (id) {
			this.clear({silent:true});
			this.urlRoot = '/apiv1/permission/'+id;
			this.runFetch();
		},
		savePermissions: function () {
			this.urlRoot = '/apiv1/permission',
			this.save(null, {success: function (model, response, options) {
				console.log('success: add user');
			}, error: function (model, response, options) {
				console.log('error: add user');
				if(typeof response.responseJSON.error == 'undefined')
					validate.showErrors(response.responseJSON);
				else
					alert(response.responseText);
			}});
		}
	});

	return RoleModel;

});
