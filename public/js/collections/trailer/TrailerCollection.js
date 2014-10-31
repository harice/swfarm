define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/trailer/TrailerModel',
	'constant'
], function(Backbone, ListViewCollection, TrailerModel, Const){
	var TrailerCollection = ListViewCollection.extend({
		url: '/apiv1/trailer',
		model: TrailerModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'number',
			sort: {
				number: true,
                name: true
			},
			filters: {},
			filter: '',
			date: '',
			lookUpIds: {},			
			searchURLForFilter: true,
			otherData:{},
		},
        
		initialize: function(option){
			this.setDefaultURL('/apiv1/trailer');			
		},		
	});

	return TrailerCollection;
});
