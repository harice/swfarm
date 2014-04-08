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
						bidnumber: true,
						created_at: false,
						producer: true,
					},
				}
			);
			
			this.listView.filters.destination = '';
			this.listView.filters.status = '';
		},
	});

	return BidCollection;
});
