define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/salesorder/SOScheduleModel',
], function(Backbone, ListViewCollection, SOScheduleModel){
	var SOScheduleCollection = ListViewCollection.extend({
		url: '/apiv1/transportschedule/getAllDeliverySchedules',
		model: SOScheduleModel,
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

	return SOScheduleCollection;
});
