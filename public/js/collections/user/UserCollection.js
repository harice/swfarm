define([
	'backbone',
	'models/user/UserModel'
], function(Backbone, UserModel){
	var UserCollection = Backbone.Collection.extend({
		url: '/apiv1/users',
		model: UserModel,
		
		initialize: function(){
			
		},
		
		getModelsPerPage: function(page, numPerPage) {
			var thisObj = this;
			
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					console.log('success: getModelsPerPage');
					console.log(data);
					
					_.each(data, function (userData) {
						thisObj.add(new UserModel(userData));
						console.log(userData);
					});
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					console.log('error: getModelsPerPage');
				},
			})
		},
	});

	return UserCollection;
});
