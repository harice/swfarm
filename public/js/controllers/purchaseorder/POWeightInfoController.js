define([
	'backbone',
	'views/purchaseorder/PickUpScheduleAddView',
	'views/purchaseorder/PickUpScheduleListView',
	'views/purchaseorder/PickUpScheduleEditView',
	'views/purchaseorder/PurchaseOrderView',
	'constant',
], function(Backbone, PickUpScheduleAddView, PickUpScheduleListView, PickUpScheduleEditView, PurchaseOrderView, Const){
	
	function POWeightInfoController () {	
		
		this.setAction = function (poid, action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					if(poid != null && this.IsInt(poid))
						return this.add(poid);
					break;
					
				case Const.CRUD.EDIT:
					if((id != null && this.IsInt(id)) && (poid != null && this.IsInt(poid))) 
						return this.edit(poid, id);
					break;
				
				default:
					if(action != null && this.IsInt(action))
						return this.view(action);
					else
						return this.listView(poid);
					break;
			}
		};
		
		this.add = function (poid) {
			return new PickUpScheduleAddView({'poid':poid});
		};
		
		this.edit = function (poid, id) {
			return new PickUpScheduleEditView({'poid':poid, 'id':id});
		};
		
		this.listView = function (poid) {
			return new PickUpScheduleListView({'id':poid});
		};
		
		this.view = function (id) {
			return new PurchaseOrderView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return POWeightInfoController;
});
