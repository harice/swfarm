define([
	'backbone',
	'views/trucker/TruckerListView',
	'views/trucker/TruckerAddView',
	'views/trucker/TruckerEditView',
	'constant',
], function(Backbone, TruckerListView, TruckerAddView, TruckerEditView, Const){
	
	function TruckerController () {	
		
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
			return new TruckerAddView();
		};
		
		this.edit = function (id) {
			return new TruckerEditView({'id':id});
		};
		
		this.listView = function () {
			return new TruckerListView();
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return TruckerController;
});
