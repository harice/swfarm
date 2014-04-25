define([
	'backbone',
	'collections/base/AppCollection',
	'models/salesorder/OriginModel',
], function(Backbone, AppCollection, OriginModel){
	var OriginCollection = AppCollection.extend({
		url: '/apiv1/salesorder/getOrigin',
		model: OriginModel,
		initialize: function(){
			
		},
	});

	return OriginCollection;
});
