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
      currentSort: 'name',
      sort: {
				name: true,
			},
			search: '',
		},
		initialize: function(){
			this.options.search = '';
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
		
		setPaginationURL: function (page, numPerPage) {
			var searchURL = '';
			if(this.options.search != '')
				searchURL = '/search';
		
			var orderBy = (this.options.sort[this.options.currentSort])? 'asc' : 'desc';
			this.url = this.getDefaultURL() + searchURL + '?' + $.param({perpage: numPerPage, page: page, sortby:this.options.currentSort, orderby:orderBy, search:this.options.search});
		},
	});

	return ProductCollection;
});
