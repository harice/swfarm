define([
	'backbone',
	'views/delivery/DeliveryLocationListView',
	'views/delivery/DeliveryLocationAddView',
	'views/delivery/DeliveryLocationEditView',
	'constant',
], function(Backbone, DeliveryLocationListView, DeliveryLocationAddView, DeliveryLocationEditView, Const){
	
	function DeliveryLocationController () {	
		
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
			return new DeliveryLocationAddView();
		};
		
		this.edit = function (id) {
			return new DeliveryLocationEditView({'id':id});
		};
		
		this.listView = function () {
			return new DeliveryLocationListView();
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return DeliveryLocationController;
});
