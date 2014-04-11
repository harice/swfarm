define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var WeightTicketModel = Backbone.Model.extend({
		urlRoot: '/apiv1/weightticket',
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
		setURLForGetByScheduleId: function (id) {
			this.urlRoot = '/apiv1/weightticket/getWeightTicketOfSchedule?scheduleId='+id;
		},
	});

	return WeightTicketModel;

});
