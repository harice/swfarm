define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/googleMapsModalTemplate.html',
	'text!templates/layout/googleMapsDistanceLegTemplate.html',
	'constant',
	'async!http://maps.googleapis.com/maps/api/js?key=AIzaSyAyTqNUdaMOVp8vYoyheHK4_Hk6ZkUb9Ow'
], function(Backbone,
			AppView,
			googleMapsModalTemplate,
			googleMapsDistanceLegTemplate,
			Const
){
	var GoogleMapsView = AppView.extend({
		
		modelId: 'google-maps-model',
		el: '.modal-alert-cont',
		milesInKM: 0.000621371,
		
		initialize: function(options) {
			this.map = null;
			this.center = new google.maps.LatLng(33.393532, -112.315880);
			this.directionsService = null;
			this.directionsDisplay = null;
			this.directionDistance = 0;
			
			this.markers = [];
			this.initModal('Maps');
			
			this.destinationLeg = []
			
			if(typeof options.distanceElement !== 'undefined' && options.distanceElement != null)
				this.distanceElement = options.distanceElement;
			
			if(typeof options.loadedDistanceElement !== 'undefined' && options.loadedDistanceElement != null)
				this.loadedDistanceElement = options.loadedDistanceElement;
			
			this.markerIconDefault = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
			this.markerIconAlphabetPre = 'http://www.google.com/mapfiles/marker';
			this.markerIconAlphabets = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
			this.markerIconAlphabetPost = '.png';
		},
		
		initMap: function() {
			var mapOptions = {
				center: this.center,
				zoom: 15
			};
			
			if(this.map == null) {
				this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
				this.initDropMarker(10);
				this.initMapDirectionService();
			}
		},
		
		initDropMarker: function (limit) {
			var thisObj = this;
			google.maps.event.addListener(this.map, 'click', function(event) {
				thisObj.addMarker(event.latLng, limit);
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
				var icon;
				
				if(this.markers.length < this.markerIconAlphabets.length)
					icon = this.markerIconAlphabetPre + this.markerIconAlphabets[this.markers.length] + this.markerIconAlphabetPost;
				else
					icon = this.markerIconDefault;
				
				this.markers.push(new google.maps.Marker({
					position: location, 
					map: this.map,
					draggable:true,
					animation: google.maps.Animation.DROP,
					icon:icon,
				}));
			}
		},
		
		events: {
			'click .get-direction-map': 'calcRoute',
			'click .clear-map': 'clearMap',
			'click .center-map': 'centerMap',
			'click .use-data': 'useData',
		},
		
		useData: function () { console.log('useData'); console.log(this.distanceElement);
			
			if(typeof this.distanceElement !== 'undefined' && this.distanceElement != null) {
				var distance = 0;
				for(var i = 0; i < this.destinationLeg.length; i++)
					distance += parseFloat(this.destinationLeg[i].distance);
				
				this.distanceElement.val(distance.toFixed(2));
			}
			
			$('#'+this.modelId).modal('hide');
			
			return false;
		},
		
		calcRoute: function () { console.log('calcRoute');
			if(this.markers.length > 1) {
				var thisObj = this;
				
				var request = {
					origin:this.markers[0].getPosition(),
					destination:this.markers[this.markers.length - 1].getPosition(),
					travelMode: google.maps.TravelMode.DRIVING,
					avoidHighways: false,
					avoidTolls: false,
				};
				
				if(this.markers.length > 2) {
					var wayPoints = [];
					for(var i = 1; i < (this.markers.length - 1); i++) {
						wayPoints.push({
							location:this.markers[i].getPosition(),
							stopover:true,
						});
					}
					
					request['waypoints'] = wayPoints;
				}
				
				this.directionsService.route(request, function(result, status) { console.log(result); console.log(status);
					if (status == google.maps.DirectionsStatus.OK) {
						thisObj.directionsDisplay.setDirections(result);
						
						var directionDistance = 0;
						var legDisplay = '';
						for(var i = 0; i < result.routes[0].legs.length; i++) {
							var legDistance = parseFloat(result.routes[0].legs[i].distance.value * thisObj.milesInKM).toFixed(2);
							directionDistance += parseFloat(legDistance);
							
							thisObj.destinationLeg.push({origin:thisObj.markers[i].getPosition(), destination:thisObj.markers[i+1].getPosition(), distance:legDistance})
							
							var googleMapsDistanceLegTemplateVariables = {
								leg: thisObj.markerIconAlphabets[i]+' - '+thisObj.markerIconAlphabets[i+1],
								distance: legDistance,
								loaded_distance: i,
							};
			
							legDisplay += _.template(googleMapsDistanceLegTemplate, googleMapsDistanceLegTemplateVariables);
						}
						thisObj.directionDistance = directionDistance;
						$('#distance-list tbody').html(legDisplay);
						$('#direction-map').text(directionDistance.toFixed(2));
					}
					else {
						console.log('error direction service');
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
			$('#distance-list tbody').html('<tr><td colspan="3">No data</td></tr>');
			this.destinationLeg = [];
			
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