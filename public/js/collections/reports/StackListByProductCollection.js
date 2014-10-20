define([
	'backbone',
	'collections/base/AppCollection',
	'models/reports/StackNumberModel',
], function(Backbone, AppCollection, StackNumberModel){
	var LocationCollection = AppCollection.extend({
		url: '/apiv1/reports/getStackListByProduct',
		model: StackNumberModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		
		getStackNumbersByProduct: function(id){
			this.url = '/apiv1/reports/getStackListByProduct?productId='+id;
			this.getModels();
		}
	});

	return LocationCollection;
});
