define([
	'backbone',
	'views/salesorder/SalesOrderListView',
	'views/salesorder/SalesOrderAddView',
	'views/bid/BidEditView',
	'views/bid/BidView',
	'constant',
], function(Backbone, SalesOrderListView, SalesOrderAddView, BidEditView, BidView, Const){
	
	function SalesOrderController () {	
		
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
			return new SalesOrderAddView();
		};
		
		this.edit = function (id) {
			return new BidEditView({'id':id});
		};
		
		this.listView = function () {
			return new SalesOrderListView();
		};
		
		this.view = function (id) {
			return new BidView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return SalesOrderController;
});
