define([
	'backbone',
	'collections/base/AppCollection',
], function(Backbone, AppCollection){
	var ListViewCollection = AppCollection.extend({
		
		runInit: function () {
			this.defaultURL = '';
			this.listView = {
				currentPage: 1,
				maxItem: 0,
				search: '',
				currentSort: '',
				sort: {},
				filter: '',
				date: '',
			};
		},
		
		getModelsPerPage: function(page, numPerPage) {
			this.setPaginationURL(page, numPerPage);
			this.getModels();
		},
		
		getModels: function() {
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
						
						thisObj.trigger('sync');
					}
					else
						alert(jqXHR.statusText);
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					thisObj.trigger('error');
					alert(jqXHR.statusText);
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
		
		setFilter: function (filter) {
			this.listView.filter = filter;
		},
		
		getFilter: function (filter) {
			return this.listView.filter;
		},
		
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
		
		setPaginationURL: function (page, numPerPage) {
			var searchURL = '';
			var orderBy = (this.listView.sort[this.listView.currentSort])? 'asc' : 'desc';
			var params = {
				perpage: numPerPage,
				page: page,
			};
			
			if(this.listView.currentSort != '')
				params = _.extend(params, {sortby:this.listView.currentSort, orderby:orderBy,});
			
			if(this.listView.search != '') {
				searchURL = '/search';
				params = _.extend(params, {search:this.listView.search});
			}
			
			if(this.listView.filter != '')
				params = _.extend(params, {filter:this.listView.filter});
			
			if(this.listView.date != '')
				params = _.extend(params, {date:this.listView.date});
			
			this.url = this.getDefaultURL() + searchURL + '?' + $.param(params);
		},
	});

	return ListViewCollection;
});
