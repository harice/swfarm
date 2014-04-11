define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var TruckingRateModel = Backbone.Model.extend({
		urlRoot: '/apiv1/pickupschedule/getTruckingRate',
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

	return TruckingRateModel;

});
