define([
	'backbone',
	'views/purchaseorder/PurchaseOrderListView',
	'views/purchaseorder/PurchaseOrderEditView',
	'views/user/UserView',
	'constant',
], function(Backbone, PurchaseOrderListView, PurchaseOrderEditView, UserView, Const){
	
	function PurchaseOrderController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
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
		
		this.edit = function (id) {
			return new PurchaseOrderEditView({'id':id});
		};
		
		this.listView = function () {
			return new PurchaseOrderListView();
		};
		
		this.view = function (id) {
			return new UserView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return PurchaseOrderController;
});
