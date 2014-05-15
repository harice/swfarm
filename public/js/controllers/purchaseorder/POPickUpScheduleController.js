define([
	'backbone',
	'views/purchaseorder/PickUpScheduleAddView',
	'views/purchaseorder/PickUpScheduleListView',
	'views/purchaseorder/PickUpScheduleEditView',
	'views/purchaseorder/PickUpScheduleView',
	'constant',
], function(Backbone, PickUpScheduleAddView, PickUpScheduleListView, PickUpScheduleEditView, PickUpScheduleView, Const){
	
	function PickUpScheduleController () {	
		
		this.setAction = function (poId, action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					if(poId != null && this.IsInt(poId))
						return this.add(poId);
					break;
					
				case Const.CRUD.EDIT:
					if((id != null && this.IsInt(id)) && (poId != null && this.IsInt(poId))) 
						return this.edit(poId, id);
					break;
				
				default:
					if(action != null && this.IsInt(action)) {
						if((action != null && this.IsInt(action)) && (poId != null && this.IsInt(poId))) 
							return this.view(poId, action);
					}
					else
						return this.listView(poId);
					break;
			}
		};
		
		this.add = function (poId) {
			return new PickUpScheduleAddView({'poId':poId});
		};
		
		this.edit = function (poId, id) {
			return new PickUpScheduleEditView({'poId':poId, 'id':id});
		};
		
		this.listView = function (poId) {
			return new PickUpScheduleListView({'id':poId});
		};
		
		this.view = function (poId, id) {
			return new PickUpScheduleView({'poId':poId, 'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return PickUpScheduleController;
});
