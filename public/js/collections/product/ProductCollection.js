define([
	'backbone',
	'models/product/ProductModel',
], function(Backbone, ProductModel){
	var ProductCollection = Backbone.Collection.extend({
		url: '/apiv1/product',
		model: ProductModel,
		options: {
			currentPage: 1,
			maxItem: 0,
		},
		initialize: function(){
			
		},
		
		getAllModels: function () {
			var thisObj = this;
			this.setGetAllURL();
			this.fetch({
				success: function (collection, response, options) {
				},
				error: function (collection, response, options) {
					if(typeof response.responseJSON.error == 'undefined')
						alert(response.responseJSON);
					else
						alert(response.responseText);
				},
				headers: thisObj.getAuth(),
			})
		},
		
		getModelsPerPage: function(page, numPerPage) {
			this.setPaginationURL(page, numPerPage);
			this.getModels();
		},
		
		getModels: function () {
			var thisObj = this;
		
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					if(textStatus == 'success') {
						var products = data.data;
						
						thisObj.reset();
						
						_.each(products, function (product) {
							thisObj.add(new ProductModel(product));
						});
						
						thisObj.options.maxItem = data.total;
						
						thisObj.trigger('sync');
					}
					else
						alert(jqXHR.statusText);
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					thisObj.trigger('error');
					alert(jqXHR.statusText);
				},
				headers: thisObj.getAuth(),
			});
		},
		
		getDefaultURL: function () {
			return '/apiv1/product';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setGetAllURL: function () {
			this.url = this.getDefaultURL()+'/all';
		},
		
		setPaginationURL: function (page, numPerPage) {	
			this.url = this.getDefaultURL() + '?' + $.param({perpage: numPerPage, page: page});
		},
	});

	return ProductCollection;
});
