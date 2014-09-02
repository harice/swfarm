define([
	'backbone',
	'views/stack/StackLocationListView',
	'views/stack/StackLocationAddView',
	'views/stack/StackLocationEditView',
	'constant',
], function(Backbone, StackLocationListView, StackLocationAddView, StackLocationEditView, Const){
	
	function StackLocationController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					return this.add();
					break;
				
				case Const.CRUD.EDIT:
					if(id != null && this.IsInt(id))
						return this.edit(id);
				
				default:
					return this.listView();
			}
		};
		
		this.add = function () {
			return new StackLocationAddView();
		};
		
		this.edit = function (id) {
			return new StackLocationEditView({'id':id});
		};
		
		this.listView = function () {
			return new StackLocationListView();
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return StackLocationController;
});
