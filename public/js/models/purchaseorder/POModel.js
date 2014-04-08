define([
	'backbone',
	'models/bid/BidModel',
], function(Backbone, BidModel) {

	var POModel = BidModel.extend({
		setEditPOURL: function () {
			this.urlRoot = '/apiv1/po/addPickupDateToPurchaseOrder';
		},
		setEditPOProductURL: function () {
			this.urlRoot = '/apiv1/po/addUnitPriceToBidProduct';
		},
		setCancelURL: function () {
			this.urlRoot = '/apiv1/po/cancelPurchaseOrder';
		},
	});
	return POModel;
});
