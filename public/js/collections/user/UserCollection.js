define([
	'backbone',
	'models/user/UserModel'
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
		},
		initialize: function(){
			
		},
		
		getModelsPerPage: function(page, numPerPage, callback) {
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
						callback(thisObj);
					}
					else
						alert(jqXHR.statusText);
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					alert(jqXHR.statusText);
				},
			});
		},
		
		setDefaultURL: function () {
			this.url = '/apiv1/users';
		},
		
		setPaginationURL: function (page, numPerPage) {	
			var orderBy = (this.options.sort[this.options.currentSort])? 'asc' : 'desc';
			this.url = '/apiv1/users' + '?' + $.param({perpage: numPerPage, page: page, sortby:this.options.currentSort, orderby:orderBy});
		},
	});

	return UserCollection;
});
