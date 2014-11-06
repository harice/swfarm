define([
	'backbone',
	'collections/base/AppCollection',
	'constant',
], function(Backbone, AppCollection, Const){
	var ListViewCollection = AppCollection.extend({
		
		runInit: function () {
			this.defaultURL = '';
			this.listView = {
				numPerPage: Const.MAXITEMPERPAGE,
				currentPage: 1,
				maxItem: 0,
				search: '',
				currentSort: '',
				sort: {},
				filters: {},
				filter: '',
				date: '',
				lookUpIds: {},
				collapseId: null,
				collapseLatestId: null,
				searchURLForFilter: true,
				otherData:{},
			};
		},
		
		getModelsPerPage: function(page) {
			if($('.list-view-collapse.collapse.in').length > 0)
				this.setCollapseId(null);
			this.setPaginationURL(page);
			this.getModels();			
		},
		
		getModels: function(option) {
			var thisObj = this;			
			
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					
					if(textStatus == 'success') {						
						if(data.data != null)
							var items = data.data;
						else
							var items = data;
						
						thisObj.reset();
						
						_.each(items, function (item) {
							thisObj.add(new thisObj.model(item));
						});
						
						if(data.total != null)
							thisObj.setMaxItem(data.total);						
						
						for(var key in data) {
							if(typeof data[key] !== 'function' && key != 'total' && key != 'data'){
								thisObj.setOtherData(key, data[key]);
							}
						}
						
						thisObj.trigger('sync', data, textStatus, jqXHR, option);
					}				
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					thisObj.trigger('error', jqXHR, textStatus, errorThrown);
				},
				headers: thisObj.getAuth(),
			});
		},
		
		setSortOptions: function (options) {
			if(typeof options.currentSort != 'undefined')
				this.listView.currentSort = options.currentSort;
			if(typeof options.sort != 'undefined')
				this.listView.sort = options.sort;
		},
		
		setNumPerPage: function (numPerPage) {
			this.listView.numPerPage = numPerPage;
		},
		
		getNumPerPage: function () {
			return this.listView.numPerPage;
		},
		
		setCurrentPage: function (currentPage) {
			this.listView.currentPage = currentPage;
		},
		
		getCurrentPage: function () {
			return this.listView.currentPage;
		},
		
		setMaxItem: function (maxItem) {
			this.listView.maxItem = maxItem;
		},
		
		getMaxItem: function () {
			return this.listView.maxItem;
		},
		
		setCurrentSort: function (currentSort) {
			this.listView.currentSort = currentSort;
		},
		
		getCurrentSort: function () {
			return this.listView.currentSort;
		},
		
		setSort: function (options) {
			this.listView.sort = _.extend(this.listView.sort, options);
		},
		
		getSort: function (type) {
			return this.listView.sort[type];
		},
		
		/*setFilter: function (filter) {
			this.listView.filter = filter;
		},
		
		getFilter: function (filter) {
			return this.listView.filter;
		},*/
		
		setSearch: function (search) {
			this.listView.search = search;
		},
		
		getSearch: function () {
			return this.listView.search;
		},
		
		setDate: function (date) {
			this.listView.date = date;
		},
		
		getDate: function () {
			return this.listView.date;
		},
		
		setFilter: function (type, value) {
			this.listView.filters[type] = value;
		},
		
		getFilter: function (type) {
			return this.listView.filters[type];
		},
		
		setCollapseId: function (collapseId) {
			this.listView.collapseId = collapseId;
		},
		
		getCollapseId: function () {
			return this.listView.collapseId;
		},
		
		setCollapseLatestId: function (collapseLatestId) {
			this.listView.collapseLatestId = collapseLatestId;
		},
		
		getCollapseLatestId: function () {
			return this.listView.collapseLatestId;
		},
		
		setOtherData: function (key, value) {
			this.listView.otherData[key] = value;
		},
		
		getOtherData: function (key) {
			if(typeof this.listView.otherData[key] !== 'undefined')
				return this.listView.otherData[key];
			else
				return null;
		},
		
		setPaginationURL: function (page) {			
			var searchURL = '';
			var orderBy = (this.listView.sort[this.listView.currentSort])? 'asc' : 'desc';
			var params = {
				perpage: this.getNumPerPage(),
				page: page,
			};
			
			if(this.listView.currentSort != '')
				params = _.extend(params, {sortby:this.listView.currentSort, orderby:orderBy,});
			
			var isSearch = false;
			if(this.listView.search != '') {
				searchURL = '/search';
				params = _.extend(params, {search:this.listView.search});
				isSearch = true;
			}
			
			if(this.listView.filter != '')
				params = _.extend(params, {filter:this.listView.filter});
			
			if(this.listView.date != '')
				params = _.extend(params, {date:this.listView.date});
			
			var isFilter = false;
			for(var filterName in this.listView.filters) {
				if(this.listView.filters[filterName] != '' && this.listView.filters[filterName] != null) {
					var filter = {};
					filter[filterName] = this.listView.filters[filterName];
					params = _.extend(params, filter);
					isFilter = true;
				}	
			}
				
			if(isFilter && !isSearch && this.listView.searchURLForFilter)
				searchURL = '/search';
			
			for(var lookUpIdName in this.listView.lookUpIds) {
				if(this.listView.lookUpIds[lookUpIdName] != '' && this.listView.lookUpIds[lookUpIdName] != null) {
					var lookUpId = {};
					lookUpId[lookUpIdName] = this.listView.lookUpIds[lookUpIdName];
					params = _.extend(params, lookUpId);
				}	
			}
			
			this.url = this.getDefaultURL() + searchURL + '?' + $.param(params);
		},
	});

	return ListViewCollection;
});
