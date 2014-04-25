define([
	'backbone',
	'views/bid/BidListView',
	'views/bid/BidAddView',
	'views/bid/BidEditView',
	'views/bid/BidView',
	'constant',
], function(Backbone, BidListView, BidAddView, BidEditView, BidView, Const){
	
	function BidController () {	
		
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
			return new BidAddView();
		};
		
		this.edit = function (id) {
			return new BidEditView({'id':id});
		};
		
		this.listView = function () {
			return new BidListView();
		};
		
		this.view = function (id) {
			return new BidView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return BidController;
});
