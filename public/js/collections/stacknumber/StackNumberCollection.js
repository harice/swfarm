define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/stacknumber/StackNumberModel',
], function(Backbone, ListViewCollection, StackNumberModel){
	var StackNumberCollection = ListViewCollection.extend({
		url: '/apiv1/inventory/summaryByStack',
		model: StackNumberModel,
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
			
			this.listView.filters.stacknumber = '';
		},
	});

	return StackNumberCollection;
});
