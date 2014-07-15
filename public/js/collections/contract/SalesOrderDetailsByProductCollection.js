define([
	'backbone',
	'collections/base/AppCollection',
	'models/contract/SalesOrderDetailsByProductModel',
], function(Backbone, AppCollection, SalesOrderDetailsByProductModel){
	var SalesOrderDetailsByProductCollection = AppCollection.extend({
		url: '/apiv1/contract/getSalesOrderByProduct',
		model: SalesOrderDetailsByProductModel,
		initialize: function(id){
			this.url = this.url+'/'+id;
		},
	});

	return SalesOrderDetailsByProductCollection;
});
