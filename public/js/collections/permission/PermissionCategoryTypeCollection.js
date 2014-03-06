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
		
		getAllModels: function (callback, args) {
			var thisObj = this;
			this.setGetAllURL();
			this.fetch({
				success: function (collection, response, options) {
					var getType = {};
					if(callback && getType.toString.call(callback) === '[object Function]')
						callback(thisObj, args);
				},
				error: function (collection, response, options) {
					if(typeof response.responseJSON.error == 'undefined')
						alert(response.responseJSON);
					else
						alert(response.responseText);
				},
			})
		},
		
		getModels: function (callback, args) {
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
							callback(thisObj, args);
					}
					else
						alert(jqXHR.statusText);
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					alert(jqXHR.statusText);
				},
			});
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
	});

	return PermissionCategoryTypeCollection;
});
