define([
	'backbone',
	'views/trailer/TrailerListView',
	'views/trailer/TrailerAddView',
	'views/trailer/TrailerEditView',
	'constant',
], function(Backbone, TrailerListView, TrailerAddView, TrailerEditView, Const){
	
	function TrailerController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					return this.add();
					break;
				
				case Const.CRUD.EDIT:
					if(id != null && this.IsInt(id))
						return this.edit(id);
					break;
				
				default:
					return this.listView();
					break;
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
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return TrailerController;
});
