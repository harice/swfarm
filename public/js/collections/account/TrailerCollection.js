define([
	'backbone',
	'collections/base/AppCollection',
	'models/account/TrailerModel',
], function(Backbone, AppCollection, TrailerModel){
	var TrailerCollection = AppCollection.extend({
		url: '/apiv1/transportschedule/trailer',
		model: TrailerModel,
		initialize: function(){
			this.setDefaultURL(this.url);
		},
		
		getTrailerByAccountId: function (id) {
			this.url = this.getDefaultURL()+'?accountId='+id;
			this.getModels();
		},
	});

	return TrailerCollection;
});
