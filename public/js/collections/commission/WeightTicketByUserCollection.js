define([
	'backbone',
	'collections/base/AppCollection',
	'models/commission/WeightTicketByUserModel',
], function(Backbone, AppCollection, WeightTicketByUserModel){
	var WeightTicketByUserCollection = AppCollection.extend({
		url: '/apiv1/commission/getClosedWeightTicketByUser',
		model: WeightTicketByUserModel,
		initialize: function(id){
			this.url = this.url+'?userId='+id;
		},
	});

	return WeightTicketByUserCollection;
});
