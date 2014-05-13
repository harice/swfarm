define([
	'backbone',
	'views/trailer/TrailerListView',
	'views/trailer/TrailerAddView',
	'views/trailer/TrailerEditView',
	'views/salesorder/SalesOrderView',
	'constant',
], function(Backbone, TrailerListView, TrailerAddView, TrailerEditView, SalesOrderView, Const){
	
	function TrailerController () {	
		
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
			return new TrailerAddView();
		};
		
		this.edit = function (id) {
			return new TrailerEditView({'id':id});
		};
		
		this.listView = function () {
			return new TrailerListView();
		};
		
		this.view = function (id) {
			return new SalesOrderView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return TrailerController;
});
