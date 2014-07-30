define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/trailer/TrailerModel',
], function(Backbone, ListViewCollection, TrailerModel){
	var TrailerCollection = ListViewCollection.extend({
		url: '/apiv1/trailer',
		model: TrailerModel,
        
		initialize: function(option){
			this.runInit();
			this.setDefaultURL('/apiv1/trailer');
			this.setSortOptions(
				{
					currentSort: 'number',
					sort: {
						number: true,
                        name: true
					}
				}
			);
		}
	});

	return TrailerCollection;
});
