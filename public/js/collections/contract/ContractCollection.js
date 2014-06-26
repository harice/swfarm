define([
	'collections/base/ListViewCollection',
	'models/contract/ContractModel'
], function(ListViewCollection, ContractModel){
	var ContractCollection = ListViewCollection.extend({
		url: '/apiv1/contract',
		model: ContractModel,
		initialize: function(option){
			this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'contract_number',
					sort: {
						// created_at: false
					}
				}
			);
		}
	});

	return ContractCollection;
});
