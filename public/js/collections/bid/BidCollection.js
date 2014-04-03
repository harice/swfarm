define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/bid/BidModel',
], function(Backbone, ListViewCollection, BidModel){
	var BidCollection = ListViewCollection.extend({
		url: '/apiv1/bid',
		model: BidModel,
		
		initialize: function(){
			this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'created_at',
					sort: {
						created_at: false,
					},
				}
			);
		},
	});

	return BidCollection;
});
