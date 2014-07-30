define([
	'collections/base/ListViewCollection',
	'models/contract/ContractModel',
	'constant',
], function(ListViewCollection, ContractModel, Const){
	var ContractCollection = ListViewCollection.extend({
		url: '/apiv1/contract',
		model: ContractModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'contract_number',
			sort: {
				contract_number: false
			},
			filters: {
                contract_date_start: '',
                contract_date_end: ''
            },
			filter: '',
			date: '',
			lookUpIds: {},
			collapseId: null,
			collapseLatestId: null,
			searchURLForFilter: true,
			otherData:{},
		},
		initialize: function(option){
			//this.runInit();
			this.setDefaultURL(this.url);
			/*this.setSortOptions(
				{
					currentSort: 'contract_number',
					sort: {
						// created_at: false
					}
				}
			);*/
		}
	});

	return ContractCollection;
});
