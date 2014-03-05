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
						var roles = data.data;
						
						thisObj.reset();
						
						_.each(roles, function (role) {
							thisObj.add(new RoleModel(role));
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
			this.url = '/apiv1/roles';
		},
		
		setPaginationURL: function (page, numPerPage) {	
			this.url = '/apiv1/roles' + '?' + $.param({perpage: numPerPage, page: page});
		},
	});

	return UserCollection;
});
