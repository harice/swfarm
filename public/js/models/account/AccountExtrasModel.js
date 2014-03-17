define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var AccountExtraModel = Backbone.Model.extend({
		urlRoot: '/apiv1/account/getFormData',
		defaults: {
            accountTypes: '',
            addressTypes: '',
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
				},
				error: function(model, response, options) {
				},
				headers: thisObj.getAuth(),
			});
		},
	});

	return AccountExtraModel;

});
