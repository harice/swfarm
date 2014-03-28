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
	});

	return ProductCollection;
});
