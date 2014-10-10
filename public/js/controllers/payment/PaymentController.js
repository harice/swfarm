define([
	'backbone',
	'views/payment/PaymentListView',
	'views/payment/PaymentAddView',
	'views/payment/PaymentEditView',
	'views/payment/PaymentView',
	'constant',
], function(Backbone, PaymentListView, Payment, PaymentEditView, PaymentView, Const){
	
	function PaymentController () {	
		
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
			return new Payment();
		};
		
		this.edit = function (id) {
			return new PaymentEditView({'id':id});
		};
		
		this.listView = function () {
			return new PaymentListView();
		};
		
		this.view = function (id) {
			return new PaymentView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};		
	};

	return PaymentController;
});
