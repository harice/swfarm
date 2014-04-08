define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/POModel',
	'collections/bid/BidCollection',
], function(Backbone, ListViewCollection, POModel, BidCollection){
	var POCollection = BidCollection.extend({
		model: POModel,
	});

	return POCollection;
});
