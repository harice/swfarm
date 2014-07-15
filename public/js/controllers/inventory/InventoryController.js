define([
	'backbone',
	'views/inventory/InventoryListView',
	'views/inventory/InventoryAddView',
	'views/trucker/TruckerEditView',
	'constant',
], function(Backbone, InventoryListView, InventoryAddView, TruckerEditView, Const){
	
	function InventoryController () {	
		
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
			return new InventoryAddView();
		};
		
		this.edit = function (id) {
			return new TruckerEditView({'id':id});
		};
		
		this.listView = function () {
			return new InventoryListView();
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return InventoryController;
});
