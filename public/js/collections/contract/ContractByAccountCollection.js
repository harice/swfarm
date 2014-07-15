define([
	'backbone',
	'collections/base/AppCollection',
	'models/contract/ContractModel',
], function(Backbone, AppCollection, ContractModel){
	var ContractByAccountCollection = AppCollection.extend({
		url: '/apiv1/account/getContracts',
		model: ContractModel,
		initialize: function(){
			this.setDefaultURL(this.url);
		},
		getContractByAccount: function (id) {
			this.url = this.getDefaultURL()+'/'+id;
			this.getModels();
		},
	});

	return ContractByAccountCollection;
});
