define([
	'backbone',
	'models/role/RoleModel',
], function(Backbone, RoleModel){
	var UserCollection = Backbone.Collection.extend({
		url: '/apiv1/roles',
		model: RoleModel,
		options: {
			currentPage: 1,
			maxItem: 0,
		},
		initialize: function(){
			
		},
		
		getAllModels: function () {
			var thisObj = this;
			this.setGetAllURL();
			this.fetch({
				success: function (collection, response, options) {
				},
				error: function (collection, response, options) {
					if(typeof response.responseJSON.error == 'undefined')
						alert(response.responseJSON);
					else
						alert(response.responseText);
				},
			})
		},
		
		getModelsPerPage: function(page, numPerPage) {
			this.setPaginationURL(page, numPerPage);
			this.getModels();
		},
		
		getModels: function () {
			var thisObj = this;
		
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					if(textStatus == 'success') {
						var roles = data.data;
						
						thisObj.reset();
						
						_.each(roles, function (role) {
							thisObj.add(new RoleModel(role));
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
			});
		},
		
		getDefaultURL: function () {
			return '/apiv1/roles';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setGetAllURL: function () {
			this.url = this.getDefaultURL()+'/all';
		},
		
		setPaginationURL: function (page, numPerPage) {	
			this.url = this.getDefaultURL() + '?' + $.param({perpage: numPerPage, page: page});
		},
	});

	return UserCollection;
});
