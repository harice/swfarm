define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/googleMapsModalTemplate.html',
	'constant',
	'async!http://maps.googleapis.com/maps/api/js?key=AIzaSyAyTqNUdaMOVp8vYoyheHK4_Hk6ZkUb9Ow'
], function(Backbone,
			AppView,
			googleMapsModalTemplate,
			Const
){
	var GoogleMapsView = AppView.extend({
		
		modelId: 'google-maps-model',
		
		initialize: function(options) {
			this.map = null;
			this.initModal('Maps');
		},
		
		initMap: function() {
			var center = new google.maps.LatLng(-34.397, 150.644);
			var mapOptions = {
				center: center,
				zoom: 8
			};
			
			if(this.map == null)
				this.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
			else
				this.map.setCenter(center);
		},
		
		initModal: function (title) {
			var thisObj = this;
			
			var googleMapsModalTemplateVariables = {
				modal_title: title,
				modal_id: this.modelId,
			};
			
			var googleMapsTemplate = _.template(googleMapsModalTemplate, googleMapsModalTemplateVariables);
			$(this.modalAlertContainer).append(googleMapsTemplate);
			
			$('#'+this.modelId).on('shown.bs.modal', function (e) {
				thisObj.initMap();
			});
		},
		
		showModal: function () {
			$('#'+this.modelId).modal('show');
		},
	});

	return GoogleMapsView;
});