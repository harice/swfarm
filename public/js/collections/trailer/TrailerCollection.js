define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/trailer/TrailerModel',
], function(Backbone, ListViewCollection, StackLocationModel){
	var TrailerCollection = ListViewCollection.extend({
		url: '/apiv1/trailer',
		model: StackLocationModel,
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

	return TrailerCollection;
});
