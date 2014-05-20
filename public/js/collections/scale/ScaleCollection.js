define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/scale/ScaleModel',
], function(Backbone, ListViewCollection, ScaleModel){
	var ScaleCollection = ListViewCollection.extend({
		url: '/apiv1/scale',
		model: ScaleModel,
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

	return ScaleCollection;
});