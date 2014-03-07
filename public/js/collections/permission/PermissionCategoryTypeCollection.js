define([
	'backbone',
	'models/permission/PermissionCategoryTypeModel',
], function(Backbone, PermissionCategoryTypeModel){
	var PermissionCategoryTypeCollection = Backbone.Collection.extend({
		url: '/apiv1/permission',
		model: PermissionCategoryTypeModel,
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
				headers: thisObj.getAuth(),
			})
		},
		
		getDefaultURL: function () {
			return '/apiv1/permission';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setGetAllURL: function () {
			this.url = this.getDefaultURL()+'/getAllPermissionCategoryType';
		},
		
		getFormattedPermissionArray: function () {
			var permissions = new Array();
			
			_.each(this.models, function (permissionModel) {
				permissions.push(permissionModel.toJSON());
			});
			
			var formatted = {};
			for(var i in permissions) {
				if(typeof permissions[i] !== 'function') {
					var category = permissions[i].permission_category[0].name;
					if(typeof formatted[category] == 'undefined')
						formatted[category] = new Array();
					formatted[category].push({id:permissions[i].permission_type[0].id, name:permissions[i].permission_type[0].name});
				}
			}
			
			return formatted;
		},
	});

	return PermissionCategoryTypeCollection;
});
