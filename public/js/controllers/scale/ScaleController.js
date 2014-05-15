define([
	'backbone',
	'views/scale/ScaleListView',
	'views/scale/ScaleAddView',
	'views/scale/ScaleEditView',
	'constant',
], function(Backbone, ScaleListView, ScaleAddView, ScaleEditView, Const){
	
	function ScaleController () {	
		
		this.setAction = function (action, id) {
			console.log(action+' '+id);
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
			console.log('this.add');
			return new ScaleAddView();
		};
		
		this.edit = function (id) {
			return new ScaleEditView({'id':id});
		};
		
		this.listView = function () {
			return new ScaleListView();
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return ScaleController;
});
