define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/salesorder/SOWeightInfoModel',
], function(Backbone, ListViewCollection, SOWeightInfoModel){
	var SOWeightInfoCollection = ListViewCollection.extend({
		url: '/apiv1/weightticket/getAllWeightticketOfOrder',
		model: SOWeightInfoModel,
		initialize: function(option){
			this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'date',
					sort: {
						date: false,
					},
				}
			);
			
			if(typeof option !== 'undefined' && typeof option.id !== 'undefined')
				this.listView.lookUpIds.order_id = option.id;
		},
		
	});

	return SOWeightInfoCollection;
});
