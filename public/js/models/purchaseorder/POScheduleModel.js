define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var POScheduleModel = Backbone.Model.extend({
		urlRoot: '/apiv1/transportschedule',
		defaults: {
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

	return POScheduleModel;

});
