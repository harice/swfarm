define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/POScheduleModel',
], function(Backbone, ListViewCollection, POScheduleModel){
	var POScheduleCollection = ListViewCollection.extend({
		url: '/apiv1/transportschedule/getAllPickupSchedules',
		model: POScheduleModel,
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
			this.listView.lookUpIds.order_id = option.id;
		},
	});

	return POScheduleCollection;
});
