define([
	'backbone',
	'models/bid/BidModel',
], function(Backbone, BidModel) {

	var POModel = BidModel.extend({
		setEditPOURL: function () {
			this.urlRoot = '/apiv1/bid/cancelPurchaseOrder';
		},
	});
	return POModel;
});
