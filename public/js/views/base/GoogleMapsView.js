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
		el: '.modal-alert-cont',
		
		initialize: function(options) {
			this.map = null;
			this.center = new google.maps.LatLng(33.393532, -112.315880);
			this.directionsService = null;
			this.directionsDisplay = null;
			this.directionDistance = 0;
			
			this.markers = [];
			this.initModal('Maps');
		},
		
		initMap: function() {
			var mapOptions = {
				center: this.center,
				zoom: 15
			};
			
			if(this.map == null) {
				this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
				this.initDropPinOriginDestination();
				this.initMapDirectionService();
			}
			/*else {
				this.map.setCenter(center);
			}*/
		},
		
		initDropPinOriginDestination: function () {
			var thisObj = this;
			google.maps.event.addListener(this.map, 'click', function(event) {
				thisObj.addMarker(event.latLng, 2);
			});
		},
		
		initMapDirectionService: function () {
			this.directionsService = new google.maps.DirectionsService();
			this.directionsDisplay = new google.maps.DirectionsRenderer();
			this.directionsDisplay.setMap(this.map);
		},
		
		initModal: function (title) {
			var thisObj = this;
			
			var googleMapsModalTemplateVariables = {
				modal_title: title,
				modal_id: this.modelId,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
			};
			
			var googleMapsTemplate = _.template(googleMapsModalTemplate, googleMapsModalTemplateVariables);
			this.$el.append(googleMapsTemplate);
			
			$('#'+this.modelId).on('shown.bs.modal', function (e) {
				thisObj.initMap();
			});
		},
		
		showModal: function () {
			$('#'+this.modelId).modal('show');
		},
		
		addMarker: function (location, limit) {
			if((limit != null && this.markers.length < limit) || limit == null) {
				this.markers.push(new google.maps.Marker({
					position: location, 
					map: this.map,
					draggable:true,
					animation: google.maps.Animation.DROP,
				}));
			}
		},
		
		events: {
			'click .get-direction-map': 'calcRoute',
			'click .clear-map': 'clearMap',
			'click .center-map': 'centerMap',
		},
		
		calcRoute: function () { console.log('calcRoute');
			if(this.markers.length == 2) {
				var thisObj = this;
				var request = {
					origin:this.markers[0].getPosition(),
					destination:this.markers[1].getPosition(),
					travelMode: google.maps.TravelMode.DRIVING,
					avoidHighways: false,
					avoidTolls: false,
				};
				
				this.directionsService.route(request, function(result, status) { console.log(result); console.log(status);
					if (status == google.maps.DirectionsStatus.OK) {
						thisObj.directionsDisplay.setDirections(result);
						thisObj.directionDistance = result.routes[0].legs[0].distance.value;
						$('#direction-map').text(parseFloat(thisObj.directionDistance) * 0.000621371);
					}
				});
			}
		},
		
		removeMarkers: function () {
			for(var i = 0; i < this.markers.length; i++) {
				this.markers[i].setMap(null);
			}
			this.markers = [];
		},
		
		removeDirections: function () {
			if(this.directionsDisplay != null)
				this.directionsDisplay.set('directions', null);
		},
		
		clearMapData: function () {
			this.directionDistance = 0;
		},
		
		clearMap: function () {
			this.removeMarkers();
			this.removeDirections();
			$('#direction-map').text('0.0');
			
			return false;
		},
		
		centerMap: function () {
			
			if(this.markers.length > 1) {
				var southWestLat = null;
				var southWestLong = null;
				var northEastLat = null;
				var northEastLong = null;
				
				for(var i = 0; i < this.markers.length; i++) {
					
					var markerPos = this.markers[i].getPosition();
					
					if((parseFloat(markerPos.lat()) < parseFloat(southWestLat)) || southWestLat == null)
						southWestLat = markerPos.lat();
					
					if((parseFloat(markerPos.lat()) > parseFloat(northEastLat)) || northEastLat == null)
						northEastLat = markerPos.lat();
					
					if((parseFloat(markerPos.lng()) < parseFloat(southWestLong)) || southWestLong ==  null)
						southWestLong = markerPos.lng();
					
					if((parseFloat(markerPos.lng()) > parseFloat(northEastLong)) || northEastLong == null)
						northEastLong = markerPos.lng();
				}
				
				var southWest = new google.maps.LatLng(southWestLat, southWestLong);
				var northEast = new google.maps.LatLng(northEastLat, northEastLong);
				var bounds = new google.maps.LatLngBounds(southWest,northEast);
				this.map.fitBounds(bounds);
			}
			else if(this.markers.length == 1) {
				this.map.setZoom(15);
				this.map.setCenter(this.markers[0].getPosition());
			}
			else {
				this.map.setZoom(15);
				this.map.setCenter(this.center);
			}
			
			return false;
		},
	});

	return GoogleMapsView;
});