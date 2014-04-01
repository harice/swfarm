define([
	'backbone',
], function(Backbone) {

	var BidModel = Backbone.Model.extend({
		urlRoot: '/apiv1/bid',
		defaults: {
        },
	});
	return BidModel;
});
