define([
	'backbone',
], function(Backbone){
	var AppCollection = Backbone.Collection.extend({
		
		getModels: function (option) {
			var thisObj = this;
			
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					if(textStatus == 'success') {
						var items = data;
						
						thisObj.reset();
						
						_.each(items, function (item) {
							thisObj.add(new thisObj.model(item));
						});
						
						thisObj.trigger('sync', data, textStatus, jqXHR, option);
					}
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					thisObj.trigger('error', jqXHR, textStatus, errorThrown);
				},
				headers: thisObj.getAuth(),
			});
		},
		
		setDefaultURL: function (defaultURL) {
			this.defaultURL = defaultURL;
		},
		
		getDefaultURL: function () {
			return this.defaultURL;
		},
		
		resetURL: function () {
			this.url = this.getDefaultURL();
		},
	});

	return AppCollection;
});
