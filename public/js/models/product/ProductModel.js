define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var ProductModel = Backbone.Model.extend({
		urlRoot: '/apiv1/product',
		defaults: {
		name: '',
		description: '',
    },
		runFetch: function () {
			var thisObj = this;
			this.fetch({
				success: function(model, response, options) {
					//console.log('success: UserModel.fetch()');
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.PRODUCT, {trigger: true});
					}
				},
				error: function(model, response, options) {
					//console.log('error: UserModel.fetch()');
				},
				headers: thisObj.getAuth(),
			});
		},
	});

	return ProductModel;

});
