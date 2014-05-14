define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var AccountTypeModel = Backbone.Model.extend({
		urlRoot: '/apiv1/transportschedule/trailer',
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

	return AccountTypeModel;

});
