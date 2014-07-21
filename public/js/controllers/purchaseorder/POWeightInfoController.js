define([
	'backbone',
	'views/purchaseorder/WeightInfoListView',
	'views/purchaseorder/WeightInfoAddView',
	'views/purchaseorder/WeightInfoEditView',
    'views/purchaseorder/WeightInfoPrintView',
	'views/purchaseorder/WeightInfoView',
	'constant',
], function(Backbone, WeightInfoListView, WeightInfoAddView, WeightInfoEditView, WeightInfoPrintView, WeightInfoView, Const){
	
	function POWeightInfoController () {	
		
		this.setAction = function (poId, schedId, action, type) {
			//return this.add(poId, schedId);
			
			switch (action) {
				case Const.CRUD.ADD:
					if((poId != null && this.IsInt(poId)) && (schedId != null && this.IsInt(schedId))) 
						return this.add(poId, schedId, type);
					break;
					
				case Const.CRUD.EDIT:
					if((poId != null && this.IsInt(poId)) && (schedId != null && this.IsInt(schedId))) 
						return this.edit(poId, schedId, type);
					break;
                    
                case Const.CRUD.PRINT:
					if(schedId !== null && this.IsInt(schedId))
                        return this.print(poId, schedId);
					break;
				
				default:
					if(poId != null && this.IsInt(poId)) {
						if(schedId != null && this.IsInt(schedId))
							return this.view(poId, schedId);
						else
							return this.list(poId);
					}
					break;
			}
		};
		
		this.add = function (poId, schedId, type) {
			return new WeightInfoAddView({'poId':poId, 'schedId':schedId, 'type':type});
		};
		
		this.edit = function (poId, schedId, type) {
			return new WeightInfoEditView({'poId':poId, 'schedId':schedId, 'type':type});
		};
		
		this.view = function (poId, schedId) {
			return new WeightInfoView({'poId':poId, 'schedId':schedId});
		};
		
		this.list = function (poId) {
			return new WeightInfoListView({'poId':poId});
		};
        
        this.print = function (poId, schedId) {
			return new WeightInfoPrintView({'poId':poId, 'schedId':schedId});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return POWeightInfoController;
});
