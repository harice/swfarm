define([
	'backbone',
	'views/purchaseorder/WeightInfoAddView',
	'views/purchaseorder/WeightInfoEditView',
	'views/purchaseorder/WeightInfoView',
	'constant',
], function(Backbone, WeightInfoAddView, WeightInfoEditView, WeightInfoView, Const){
	
	function POWeightInfoController () {	
		
		this.setAction = function (poId, schedId, action) {
			//return this.add(poId, schedId);
			
			switch (action) {
				case Const.CRUD.ADD:
					if((poId != null && this.IsInt(poId)) && (schedId != null && this.IsInt(schedId))) 
						return this.add(poId, schedId);
					break;
					
				case Const.CRUD.EDIT:
					if((poId != null && this.IsInt(poId)) && (schedId != null && this.IsInt(schedId))) 
						return this.edit(poId, schedId);
					break;
				
				default:
					if((poId != null && this.IsInt(poId)) && (schedId != null && this.IsInt(schedId)))
						return this.view(poId, schedId);
					break;
			}
		};
		
		this.add = function (poId, schedId) {
			return new WeightInfoAddView({'poId':poId, 'schedId':schedId});
		};
		
		this.edit = function (poId, schedId) {
			return new WeightInfoEditView({'poId':poId, 'schedId':schedId});
		};
		
		this.view = function (poId, schedId) {
			return new WeightInfoView({'poId':poId, 'schedId':schedId});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return POWeightInfoController;
});
