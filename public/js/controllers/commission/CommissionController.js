define([
	'backbone',
	'views/commission/CommissionView',
	'views/commission/CommissionListView',
	'constant',
], function(Backbone, CommissionView, CommissionListView, Const){
	
	function CommissionController () {	
		
		this.setAction = function (id) {
			
			if(this.IsInt(id))
				return this.view(id);
			else
				return this.listView();
		};
		
		this.listView = function () {
			return new CommissionListView();
		};
		
		this.view = function (id) {
			return new CommissionView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return CommissionController;
});
