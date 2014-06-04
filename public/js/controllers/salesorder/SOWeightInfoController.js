define([
	'backbone',
	'views/salesorder/WeightInfoAddView',
	'views/salesorder/WeightInfoEditView',
	'views/salesorder/WeightInfoView',
	'constant',
], function(Backbone, WeightInfoAddView, WeightInfoEditView, WeightInfoView, Const){
	
	function SOWeightInfoController () {	
		
		this.setAction = function (soId, schedId, action) {
			//return this.add(soId, schedId);
			
			switch (action) {
				case Const.CRUD.ADD:
					if((soId != null && this.IsInt(soId)) && (schedId != null && this.IsInt(schedId))) 
						return this.add(soId, schedId);
					break;
					
				case Const.CRUD.EDIT:
					if((soId != null && this.IsInt(soId)) && (schedId != null && this.IsInt(schedId))) 
						return this.edit(soId, schedId);
					break;
				
				default:
					if((soId != null && this.IsInt(soId)) && (schedId != null && this.IsInt(schedId)))
						return this.view(soId, schedId);
					break;
			}
		};
		
		this.add = function (soId, schedId) {
			return new WeightInfoAddView({'soId':soId, 'schedId':schedId});
		};
		
		this.edit = function (soId, schedId) {
			return new WeightInfoEditView({'soId':soId, 'schedId':schedId});
		};
		
		this.view = function (soId, schedId) {
			return new WeightInfoView({'soId':soId, 'schedId':schedId});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return SOWeightInfoController;
});
