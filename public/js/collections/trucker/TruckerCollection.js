define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/trucker/TruckerModel',
], function(Backbone, ListViewCollection, TruckerModel){
	var TruckerCollection = ListViewCollection.extend({
		url: '/apiv1/truck',
		model: TruckerModel,
		initialize: function(option){
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

	return TruckerCollection;
});
