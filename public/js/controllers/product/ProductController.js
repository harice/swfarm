define([
	'backbone',
	'views/product/ProductListView',
	'views/product/ProductAddView',
	'views/product/ProductEditView',
	'views/product/ProductView',
	'constant',
], function(Backbone, ProductListView, ProductAddView, ProductEditView, ProductView, Const){
	
	function ProductController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					return this.add();
					break;
				
				case Const.CRUD.EDIT:
					if(id != null && this.IsInt(id))
						return this.edit(id);
				
				default:
					if(action != null && this.IsInt(action))
						return this.view(action);
					else
						return this.listView();
			}
		};
		
		this.add = function () {
			return new ProductAddView();
		};
		
		this.edit = function (id) {
			return new ProductEditView({'id':id});
		};
		
		this.listView = function () {
			return new ProductListView();
		};
		
		this.view = function (id) {
			return new ProductView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return ProductController;
});
