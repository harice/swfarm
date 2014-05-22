define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/product/ProductModel',
], function(Backbone, ListViewCollection, ProductModel){
	var ProductCollection = ListViewCollection.extend({
		url: '/apiv1/product',
		model: ProductModel,
		
		initialize: function(){
			this.runInit();
			this.setDefaultURL('/apiv1/product');
			this.setSortOptions(
				{
					currentSort: 'name',
					sort: {
						name: true,
					},
				}
			);
		},
		
		getAllModel: function () {
			this.resetURL();
			this.getModels();
		},
		
		getOrderProducts: function (poId) {
			this.url = '/apiv1/transportschedule/getProductsOfOrder?orderId='+poId;
			this.getModels();
		},
		
		getScheduleProducts: function (schedId) {
			this.url = '/apiv1/weightticket/getScheduleProducts?transportschedule_id='+schedId;
			this.getModels();
		},
	});

	return ProductCollection;
});
