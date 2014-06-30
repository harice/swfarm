define([
	'views/contract/ContractView',
    'views/contract/ContractListView',
	'views/contract/ContractAddView',
	'views/contract/ContractEditView',
	'constant'
], function(ContractView, ContractListView, ContractAddView, ContractEditView, Const){
	
	function ContractController () {	
		
		this.setAction = function (action, id) {
			switch (action) {
				case Const.CRUD.ADD:
					return this.add();
					break;
				
				case Const.CRUD.EDIT:
					if(id !== null && this.IsInt(id))
						return this.edit(id);
					break;
                    
                default:
					if(action !== null && this.IsInt(action))
						return this.view(action);
					else
						return this.listView();
			}
		};
		
		this.add = function () {
			return new ContractAddView();
		};
		
		this.edit = function (id) {
			return new ContractEditView({'id':id});
		};
		
		this.listView = function () {
			return new ContractListView();
		};
        
        this.view = function (id) {
			return new ContractView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return ContractController;
});
