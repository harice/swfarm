define([
	'backbone',
	'models/account/AccountModel',
], function(Backbone, AccountModel){
	var AccountCollection = Backbone.Collection.extend({
		url: '/apiv1/account',
		model: AccountModel,
		options: {
			currentPage: 1,
			maxItem: 0,
			currentSort: 'name',
			sort: {
				name: true,
				accounttype:true,
			},
			search: '',
		},
		initialize: function(){
			
		},
		
		getModelsPerPage: function(page, numPerPage) {
			var thisObj = this;
			
			this.setPaginationURL(page, numPerPage);
			
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					
					if(textStatus == 'success') {
						var accounts = data.data;
						
						thisObj.reset();
						
						_.each(accounts, function (account) {
							thisObj.add(new AccountModel(account));
						});
						
						thisObj.options.maxItem = data.total;
						
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
		
		getDefaultURL: function () {
			return '/apiv1/account';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setPaginationURL: function (page, numPerPage) {
			var searchURL = '';
			if(this.options.search != '')
				searchURL = '/search';
		
			var orderBy = (this.options.sort[this.options.currentSort])? 'asc' : 'desc';
			this.url = this.getDefaultURL() + searchURL + '?' + $.param({perpage: numPerPage, page: page, sortby:this.options.currentSort, orderby:orderBy, search:this.options.search});
		},
	});

	return AccountCollection;
});
