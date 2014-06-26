define([
	'backbone',
	'views/salesorder/WeightInfoListView',
	'views/salesorder/WeightInfoAddView',
	'views/salesorder/WeightInfoEditView',
	'views/salesorder/WeightInfoView',
	'constant',
], function(Backbone, WeightInfoListView, WeightInfoAddView, WeightInfoEditView, WeightInfoView, Const){
	
	function SOWeightInfoController () {	
		
		this.setAction = function (soId, schedId, action, type) {
			//return this.add(soId, schedId);
			
			switch (action) {
				case Const.CRUD.ADD:
					if((soId != null && this.IsInt(soId)) && (schedId != null && this.IsInt(schedId))) 
						return this.add(soId, schedId, type);
					break;
					
				case Const.CRUD.EDIT:
					if((soId != null && this.IsInt(soId)) && (schedId != null && this.IsInt(schedId))) 
						return this.edit(soId, schedId, type);
					break;
				
				default:
					if(soId != null && this.IsInt(soId)) {
						if(schedId != null && this.IsInt(schedId))
							return this.view(soId, schedId);
						else
							return this.list(soId);
					}
					break;
			}
		};
		
		this.add = function (soId, schedId, type) {
			return new WeightInfoAddView({'soId':soId, 'schedId':schedId, 'type':type});
		};
		
		this.edit = function (soId, schedId, type) {
			return new WeightInfoEditView({'soId':soId, 'schedId':schedId, 'type':type});
		};
		
		this.view = function (soId, schedId) {
			return new WeightInfoView({'soId':soId, 'schedId':schedId});
		};
		
		this.list = function (soId) {
			return new WeightInfoListView({'soId':soId});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return SOWeightInfoController;
});
