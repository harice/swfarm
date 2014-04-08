define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/POModel',
	'collections/bid/BidCollection',
], function(Backbone, ListViewCollection, POModel, BidCollection){
	var POCollection = BidCollection.extend({
		url: '/apiv1/bid/getPurchaseOrder',
		model: POModel,
	});

	return POCollection;
});
