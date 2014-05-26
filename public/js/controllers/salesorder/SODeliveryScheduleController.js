define([
	'backbone',
	'views/salesorder/DeliveryScheduleAddView',
	'views/salesorder/DeliveryScheduleList',
	'views/salesorder/DeliveryScheduleEditView',
	'views/salesorder/DeliveryScheduleView',
	'constant',
], function(Backbone, DeliveryScheduleAddView, DeliveryScheduleList, DeliveryScheduleEditView, DeliveryScheduleView, Const){
	
	function SODeliveryScheduleController () {	
		
		this.setAction = function (soId, action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					if(soId != null && this.IsInt(soId))
						return this.add(soId);
					break;
					
				case Const.CRUD.EDIT:
					if((id != null && this.IsInt(id)) && (soId != null && this.IsInt(soId))) 
						return this.edit(soId, id);
					break;
				
				default:
					if(action != null && this.IsInt(action)) {
						if((action != null && this.IsInt(action)) && (soId != null && this.IsInt(soId))) 
							return this.view(soId, action);
					}
					else
						return this.listView(soId);
					break;
			}
		};
		
		this.add = function (soId) {
			return new DeliveryScheduleAddView({'soId':soId});
		};
		
		this.edit = function (soId, id) {
			return new DeliveryScheduleEditView({'soId':soId, 'id':id});
		};
		
		this.listView = function (soId) {
			return new DeliveryScheduleList({'id':soId});
		};
		
		this.view = function (soId, id) {
			return new DeliveryScheduleView({'soId':soId, 'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return SODeliveryScheduleController;
});
