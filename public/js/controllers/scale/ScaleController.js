define([
	'backbone',
	'views/scale/ScaleListView',
	'views/scale/ScaleAddView',
	'views/scale/ScaleEditView',
    'views/scale/ScaleView',
	'constant',
], function(Backbone, ScaleListView, ScaleAddView, ScaleEditView, ScaleView, Const){
	
	function ScaleController () {	
		
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
					if(action != null && this.IsInt(action))
						return this.view(action);
					else
						return this.listView();
			}
		};
		
		this.add = function () {
			return new ScaleAddView();
		};
		
		this.edit = function (id) {
			return new ScaleEditView({'id':id});
		};
		
		this.listView = function () {
			return new ScaleListView();
		};
        
        this.view = function (id) {
			return new ScaleView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return ScaleController;
});
