define([
    'backbone',
    'global',
    'constant'
], function(Backbone, Global, Const)
{
    var SettingsModel = Backbone.Model.extend({
        urlRoot: '/apiv1/settings',
        defaults: {
            name: '',
            value: ''
        },
        runFetch: function () {
			var thisObj = this;
			this.fetch({
				success: function(model, response, options) {
					console.log(response);
//					if(typeof response.error != 'undefined') {
//						alert(response.message);
//						Global.getGlobalVars().app_router.navigate(Const.URL.ROLE, {trigger: true});
//					}
				},
				error: function(model, response, options) {
					console.log(response);
				},
				headers: thisObj.getAuth()
			});
		},

        updateURL: function() {
            this.urlRoot = '/apiv1/settings/bulkUpdateSettings';
        }
    });

    return SettingsModel;
});
