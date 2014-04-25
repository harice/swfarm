define([
	'backbone',
	'views/bid/BidAddView',
	'views/purchaseorder/PurchaseOrderListView',
	'constant',
], function(Backbone, BidAddView, PurchaseOrderListView, Const){
	
	function BidController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					return this.add();
					break;
				
				default:
					return this.list();
					break;
			}
		};
		
		this.add = function () {
			return new BidAddView();
		};
		
		this.list = function () {
			return new PurchaseOrderListView();
		};
	};

	return BidController;
});
