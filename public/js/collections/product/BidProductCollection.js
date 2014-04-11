define([
	'backbone',
	'collections/base/AppCollection',
	'models/product/ProductModel',
], function(Backbone, AppCollection, ProductModel){
	var BidProductCollection = AppCollection.extend({
		url: '/apiv1/weightticket/getAllBidProductOnBid',
		model: ProductModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		
		fetchBidProducts: function (bidId) {
			this.formatURL(bidId);
			this.getModels();
		},
		
		formatURL: function (data) {
			this.url = this.getDefaultURL() + '?bidId=' + data;
		},
	});

	return BidProductCollection;
});
