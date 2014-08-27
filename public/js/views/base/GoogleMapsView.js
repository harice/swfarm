define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/googleMapsModalTemplate.html',
	'text!templates/layout/googleMapsModalTemplate2.html',
	'text!templates/layout/googleMapsDistanceLegTemplate.html',
	'text!templates/layout/locationMarkerInfoWindowTemplate.html',
	'constant',
	'async!http://maps.googleapis.com/maps/api/js?key=AIzaSyAyTqNUdaMOVp8vYoyheHK4_Hk6ZkUb9Ow'
], function(Backbone,
			AppView,
			googleMapsModalTemplate,
			googleMapsModalTemplate2,
			googleMapsDistanceLegTemplate,
			locationMarkerInfoWindowTemplate,
			Const
){
	var GoogleMapsView = AppView.extend({
		
		modalIdGetDD: 'google-maps-modal-getdd',
		mapCanvasIdGetDD: 'map-canvas-getdd',
		
		modalIdGetLocation: 'google-maps-modal-getlocation',
		mapCanvasIdGetLocation: 'map-canvas-getlocation',
		
		modalIdSetLocation: 'google-maps-modal-setlocation',
		mapCanvasIdSetLocation: 'map-canvas-setlocation',
		
		el: '.modal-alert-cont',
		milesInKM: 0.000621371,
		googleMapsDestinationMarkerLimit: 10,
		
		initialize: function(options) {
			this.map = null;
			this.center = new google.maps.LatLng(33.393532, -112.315880);
			this.directionsService = null;
			this.directionsDisplay = null;
			this.directionDistance = 0;
			
			this.markers = [];
			this.destinationLeg = [];
			this.loadedDistances = [];
			
			this.markerIconDefault = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
			this.markerIconAlphabetPre = 'http://www.google.com/mapfiles/marker';
			this.markerIconAlphabets = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
			this.markerIconAlphabetPost = '.png';
			
			this.mapTypes = {
				GETDESTINATIONDISTANCE: 1,
				GETLOCATION: 2,
				SETLOCATION: 3,
			};
			
			this.mapType = null;
			this.isInitMap = false;
		},
		
		initMapGetDestinationDistance: function (callback) {
			var thisObj = this;
			this.mapType = this.mapTypes.GETDESTINATIONDISTANCE;
			
			var googleMapsModalTemplateVariables = {
				modal_title: 'Maps',
				modal_id: this.modalIdGetDD,
				modal_map_canvas_id: this.mapCanvasIdGetDD,
			};
			
			var googleMapsTemplate = _.template(googleMapsModalTemplate, googleMapsModalTemplateVariables);
			this.$el.append(googleMapsTemplate);
			
			$('#'+this.modalIdGetDD).on('shown.bs.modal', function (e) {
				if(!thisObj.isInitMap) {
					thisObj.initMap(thisObj.mapCanvasIdGetDD, function () {
						thisObj.initDropMarker(thisObj.googleMapsDestinationMarkerLimit);
						thisObj.initMapDirectionService();
					});
				}
				
				thisObj.shownModalCallback();
			});
			
			var getType = {};
			if(this.isFunction(callback))
				this.hiddenModalCallback = callback;
		},
		
		initGetMapLocation: function (callback) {
			var thisObj = this;
			this.mapType = this.mapTypes.GETLOCATION;
			
			var googleMapsModalTemplate2Variables = {
				modal_title: 'Maps',
				modal_id: this.modalIdGetLocation,
				modal_map_canvas_id: this.mapCanvasIdGetLocation,
				modal_show_clear: 1,
				modal_show_use_data: 1,
			};
			
			var googleMapsTemplate = _.template(googleMapsModalTemplate2, googleMapsModalTemplate2Variables);
			this.$el.append(googleMapsTemplate);
			
			$('#'+this.modalIdGetLocation).on('shown.bs.modal', function (e) {
				if(!thisObj.isInitMap) {
					thisObj.initMap(thisObj.mapCanvasIdGetLocation, function () {
						thisObj.initDropMarker(1);
					});
				}
				
				thisObj.shownModalCallback();
			});
			
			var getType = {};
			if(this.isFunction(callback))
				this.hiddenModalCallback = callback;
		},
		
		initSetMapLocation: function () {
			var thisObj = this;
			this.mapType = this.mapTypes.SETLOCATION;
			
			var googleMapsModalTemplate2Variables = {
				modal_title: 'Maps',
				modal_id: this.modalIdSetLocation,
				modal_map_canvas_id: this.mapCanvasIdSetLocation,
			};
			
			var googleMapsTemplate = _.template(googleMapsModalTemplate2, googleMapsModalTemplate2Variables);
			this.$el.append(googleMapsTemplate);
			
			$('#'+this.modalIdSetLocation).on('shown.bs.modal', function (e) {
				if(!thisObj.isInitMap) {
					thisObj.initMap(thisObj.mapCanvasIdSetLocation);
				}
				
				thisObj.shownModalCallback();
			});
		},
		
		initMap: function(mapCanvasId, otherInit) {
			var mapOptions = {
				center: this.center,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
			};
			
			this.map = new google.maps.Map(document.getElementById(mapCanvasId), mapOptions);
			
			var getType = {};
			if(this.isFunction(otherInit))
				otherInit();
				
			this.isInitMap = true;
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
		
		showModalGetDestinationDistance: function (distanceMarkers) {
			var thisObj = this;
			
			this.shownModalCallback = function () {
				thisObj.loadedDistances = [];
				
				if(distanceMarkers.length > 0) {
					thisObj.clearMap();
					
					for(var i = 0; i < distanceMarkers.length; i++) {
						var locationFrom = new google.maps.LatLng(distanceMarkers[i].latitudeFrom, distanceMarkers[i].longitudeFrom);
						thisObj.addMarker(locationFrom, thisObj.googleMapsDestinationMarkerLimit);
						thisObj.loadedDistances.push(distanceMarkers[i].isLoadedDistance);
						
						if(i == distanceMarkers.length - 1) {
							var locationTo = new google.maps.LatLng(distanceMarkers[i].latitudeTo, distanceMarkers[i].longitudeTo);
							thisObj.addMarker(locationTo, thisObj.googleMapsDestinationMarkerLimit);
						}
					}
					
					thisObj.calcRoute();
				}
			}
			
			this.showModal(this.modalIdGetDD);
		},
		
		showModalGetLocation: function (marker) {
			var thisObj = this;
			
			this.shownModalCallback = function () {
				thisObj.removeMarkers();
				
				if(marker.lat != '' && marker.lng != '') {
					var location = new google.maps.LatLng(marker.lat, marker.lng);
					thisObj.addMarker(location);
				}
				
				thisObj.centerMap();
			};
			
			this.showModal(this.modalIdGetLocation);
		},
		
		showModalSetLocation: function (markers) {
			var thisObj = this;
			
			this.shownModalCallback = function () {
				thisObj.removeMarkers();
				
				for(var i = 0; i < markers.length; i++) {
					
					var locationMarkerInfoWindowTemplateVariables = {
						account_name: markers[i].accountName,
						location_name: markers[i].name,
					};
			
					var infoWindowTemplateVariables = _.template(locationMarkerInfoWindowTemplate, locationMarkerInfoWindowTemplateVariables);
					
					var infoWindow = new google.maps.InfoWindow({
						content: infoWindowTemplateVariables,
					});
					
					var location = new google.maps.LatLng(markers[i].lat, markers[i].lng);
					
					var marker = thisObj.addMarker(location);
					thisObj.attachInfoWindow(marker, infoWindow);
				}
				
				thisObj.centerMap();
			};
		
			this.showModal(this.modalIdSetLocation);
		},
		
		showModal: function (id) {
			$('#'+id).modal('show');
		},
		
		addMarker: function (location, limit) {
			
			var marker = null;
			
			if(limit == 1) {
				if(typeof this.markers[0] !== 'undefined' && this.markers[0] != null)
					this.markers[0].setMap(null)
				
				marker = new google.maps.Marker({
					position: location, 
					map: this.map,
					draggable:true,
					animation: google.maps.Animation.DROP,
					icon:icon,
				});
				
				if(typeof this.markers[0] !== 'undefined' && this.markers[0] != null)
					this.markers[0] = marker;
				else
					this.markers.push(marker);
			}
			else if((limit != null && this.markers.length < limit) || limit == null){
				var icon;
				
				if(this.markers.length < this.markerIconAlphabets.length && limit != null)
					icon = this.markerIconAlphabetPre + this.markerIconAlphabets[this.markers.length] + this.markerIconAlphabetPost;
				else
					icon = this.markerIconDefault;
				
				marker = new google.maps.Marker({
					position: location, 
					map: this.map,
					draggable:true,
					animation: google.maps.Animation.DROP,
					icon:icon,
				});
				
				this.markers.push(marker);
			}
			
			//console.log('lat: '+this.markers[this.markers.length-1].getPosition().lat());
			
			return marker;
		},
		
		attachInfoWindow: function (marker, infoWindow) {
			google.maps.event.addListener(marker, 'click', function() {
				infoWindow.open(this.map, marker);
			});
		},
		
		events: {
			'click .get-direction-map': 'calcRoute',
			'click .clear-map': 'clearMap',
			'click .center-map': 'centerMap',
			'click .googlemaps-ok': 'useData',
			'change .loaded-distance': 'setLoadedDistance',
		},
		
		setLoadedDistance: function (ev) {
			var element = $(ev.currentTarget);
			var id = element.attr('data-id');
			if(element.is(':checked'))
				this.destinationLeg[id].loaded = true;
			else
				this.destinationLeg[id].loaded = false;
		},
		
		useData: function (ev) {
			
			var thisObj = this;
			var modalId;
			var returnData = {};
			
			switch(this.mapType) {
				case this.mapTypes.GETDESTINATIONDISTANCE:
					modalId = this.modalIdGetDD;
					if(this.destinationLeg.length > 0)
						returnData = {destinationLeg:this.destinationLeg};
					break;
				case this.mapTypes.GETLOCATION:
					modalId = this.modalIdGetLocation;
					if(this.markers.length > 0)
						returnData = {location:this.markers[0].getPosition()};
					break;
				default:
					break;
			}
			
			$('#'+modalId).on('hidden.bs.modal', function (e) {
				thisObj.hiddenModalCallback(returnData);
				$(this).off('hidden.bs.modal');
			});
			
			$('#'+modalId).modal('hide');
			
			return false;
		},
		
		calcRoute: function () { //console.log('calcRoute');
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
				
				this.directionsService.route(request, function(result, status) { //console.log(result); console.log(status);
					if (status == google.maps.DirectionsStatus.OK) {
						thisObj.directionsDisplay.setDirections(result);
						
						var directionDistance = 0;
						var legDisplay = '';
						thisObj.destinationLeg = [];
						for(var i = 0; i < result.routes[0].legs.length; i++) {
							var legDistance = parseFloat(result.routes[0].legs[i].distance.value * thisObj.milesInKM).toFixed(2);
							directionDistance += parseFloat(legDistance);
							
							thisObj.destinationLeg.push({
								origin:thisObj.markers[i].getPosition(),
								destination:thisObj.markers[i+1].getPosition(),
								distance:legDistance,
								loaded:false,
							});
							
							var googleMapsDistanceLegTemplateVariables = {
								leg: thisObj.markerIconAlphabets[i]+' - '+thisObj.markerIconAlphabets[i+1],
								distance: legDistance,
								loaded_distance: i,
							};
							
							if(typeof thisObj.loadedDistances[i] !== 'undefined' && thisObj.loadedDistances[i] == 1)
								googleMapsDistanceLegTemplateVariables['checked'] = true;
								
							legDisplay += _.template(googleMapsDistanceLegTemplate, googleMapsDistanceLegTemplateVariables);
						}
						thisObj.directionDistance = directionDistance;
						$('#distance-list tbody').html(legDisplay);
						$('#direction-map').text(directionDistance.toFixed(2));
					}
					else
						console.log('error direction service');
						
					thisObj.loadedDistances = [];
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
		
		clearMap: function () {
			this.removeMarkers();
			
			switch(this.mapType) {
				
				case this.mapTypes.GETDESTINATIONDISTANCE:
					
					this.removeDirections();
					$('#direction-map').text('0.0');
					$('#distance-list tbody').html('<tr><td colspan="3">No data</td></tr>');
					this.destinationLeg = [];
					this.directionDistance = 0;
					
					break;
				
				default:
					break;
			}
			
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
		
		hiddenModalCallback: function () {},
		shownModalCallback: function () {},
		
		destroyView: function () {
			this.close();
		},
	});

	return GoogleMapsView;
});