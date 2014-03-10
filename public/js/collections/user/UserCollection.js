define([
	'backbone',
	'models/user/UserModel',
], function(Backbone, UserModel){
	var UserCollection = Backbone.Collection.extend({
		url: '/apiv1/users',
		model: UserModel,
		options: {
			currentPage: 1,
			maxItem: 0,
			currentSort: 'lastname',
			sort: {
				firstname: true,
				lastname: true,
				email: true,
			},
			search: '',
		},
		initialize: function(){
			
		},
		
		getModelsPerPage: function(page, numPerPage) {
			//console.log('getModelsPerPage');
			
			var thisObj = this;
			
			this.setPaginationURL(page, numPerPage);
			
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					//console.log('success: getModelsPerPage');
					//console.log(data);
					//console.log(jqXHR);
					
					if(textStatus == 'success') {
						var users = data.data;
						
						thisObj.reset();
						
						_.each(users, function (user) {
							thisObj.add(new UserModel(user));
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
			return '/apiv1/users';
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

	return UserCollection;
});
