define([
	'backbone',
	'collections/base/AppCollection',
	'models/stack/StackLocationModel',
], function(Backbone, AppCollection, StackLocationModel){
	var LocationCollection = AppCollection.extend({
		url: '/apiv1/storagelocation/locationlist',
		model: StackLocationModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		
		getLocationByAccount: function (id) {
			this.url = '/apiv1/storagelocation/getByAccount/'+id;
			this.getModels();
		},
	});

	return LocationCollection;
});
