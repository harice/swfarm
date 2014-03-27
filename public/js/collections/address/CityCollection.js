define([
	'backbone',
	'models/address/CityModel',
], function(Backbone, CityModel){
	var CityCollection = Backbone.Collection.extend({
		url: '/apiv1/account/getCitiesByState',
		model: CityModel,
		initialize: function(){
			
		},
		
		getModels: function (stateId) {
			var thisObj = this;
			
			if(stateId != null)
				this.setGetCityPerStateURL(stateId);
			
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					if(textStatus == 'success') {
						var cities = data;
						
						thisObj.reset();
						
						_.each(cities, function (city) {
							thisObj.add(new CityModel(city));
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
			return '/apiv1/account/getCitiesByState';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setGetCityPerStateURL: function (stateId) {
			this.url = this.getDefaultURL()+'/'+stateId;
		},
	});

	return CityCollection;
});
