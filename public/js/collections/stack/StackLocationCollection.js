define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/stack/StackLocationModel',
], function(Backbone, ListViewCollection, StackLocationModel){
	var StackLocationCollection = ListViewCollection.extend({
		url: '/apiv1/storagelocation',
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

	return StackLocationCollection;
});
