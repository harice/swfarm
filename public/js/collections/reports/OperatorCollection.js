define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/reports/OperatorModel',
], function(Backbone, ListViewCollection, OperatorModel){
	var OperatorCollection = ListViewCollection.extend({
		url: '/apiv1/operator/operator-pay',
		model: OperatorModel,
		
		initialize: function(){
			this.runInit();
			this.setDefaultURL('/apiv1/operator/operator-pay');
		},		
	});

	return OperatorCollection;
});
