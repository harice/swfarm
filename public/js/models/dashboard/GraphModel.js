define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var GraphModel = Backbone.Model.extend({
		urlRoot: '/apiv1/dashboard',
		defaults: {},
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

	return GraphModel;

});
