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
		
		getAllModels: function (callback) {
			this.setDefaultURL();
			this.getModels(callback);
		},
		
		getModelsPerPage: function(page, numPerPage, callback) {
			//console.log('getModelsPerPage');
			this.setPaginationURL(page, numPerPage);
			this.getModels(callback);
		},
		
		getModels: function (callback) {
			var thisObj = this;
		
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
						
						var getType = {};
						if(callback && getType.toString.call(callback) === '[object Function]')
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
