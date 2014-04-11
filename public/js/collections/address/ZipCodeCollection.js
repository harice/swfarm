define([
	'backbone',
	'models/address/ZipCodeModel',
], function(Backbone, ZipCodeModel){
	var ZipCodeCollection = Backbone.Collection.extend({
		url: '/apiv1/account/getZipcodeUsingCity',
		model: ZipCodeModel,
		initialize: function(){
			
		},
		
		getModels: function (cityId) {
			var thisObj = this;
			
			if(cityId != null)
				this.setGetZipCodePerCityURL(cityId);
			
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					if(textStatus == 'success') {
						var items = data;
						
						thisObj.reset();
						
						_.each(items, function (item) {
							thisObj.add(new thisObj.model(item));
						});
						
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
			return '/apiv1/account/getZipcodeUsingCity';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setGetZipCodePerCityURL: function (cityId) {
			this.url = this.getDefaultURL()+'/'+cityId;
		},
	});

	return ZipCodeCollection;
});
