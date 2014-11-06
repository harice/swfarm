define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/googleMapsModalTemplate.html',
	'text!templates/layout/googleMapsModalTemplate2.html',
	'text!templates/layout/googleMapsDistanceLegTemplate.html',
	'text!templates/layout/locationMarkerInfoWindowTemplate.html',
	'constant',
	'async!http://maps.googleapis.com/maps/api/js?key=AIzaSyAyTqNUdaMOVp8vYoyheHK4_Hk6ZkUb9Ow&libraries=places'
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

		inputIdSetSearch: 'search-map',
		
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
				input_map_search_id: this.inputIdSetSearch,
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

		initGetDashboardMapLocation: function(mapId, location, callbak){
			var thisObj = this;
			this.mapType = this.mapTypes.GETLOCATION;

			if(!thisObj.isInitMap) {
				thisObj.initDashboardMap(mapId, location);
			}
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
			
			var searchBox = document.getElementById(this.inputIdSetSearch);
			if($(searchBox).length > 0)				
				this.initMapSearch();

			var getType = {};
			if(this.isFunction(otherInit))
				otherInit();
				
			this.isInitMap = true;			
		},

		initMapSearch: function(){
			var thisObj = this;						

			var input = document.getElementById(this.inputIdSetSearch);		
			this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
			
			var autocomplete = new google.maps.places.Autocomplete(input);
  			autocomplete.bindTo('bounds', this.map);
			
			google.maps.event.addListener(autocomplete, 'place_changed', function() {			
			    var place = autocomplete.getPlace();
			    if (!place.geometry) {
			      return;
			    }

			    // If the place has a geometry, then present it on a map.
			    if (place.geometry.viewport) {
			      thisObj.map.fitBounds(place.geometry.viewport);
			      thisObj.map.setCenter(place.geometry.location);			      					
				  thisObj.addMarker(place.geometry.location);				  
			      thisObj.map.setZoom(9); 
			    }
			    else {
			      thisObj.map.setCenter(place.geometry.location);
			      thisObj.addMarker(place.geometry.location);	
			      thisObj.map.setZoom(9); 
			    }			    
			   
			});		
			
		},

		initDashboardMap: function(mapCanvasId, location, otherInit) {	
			var radius = 402.3361244731408;
			var mapOptions = {
				center: location,
				zoom: 13,
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
			var options = {limit: limit};
			google.maps.event.addListener(this.map, 'click', function(event) {
				thisObj.addMarker(event.latLng, options);
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
						var options = {limit: thisObj.googleMapsDestinationMarkerLimit}
						thisObj.addMarker(locationFrom, options);
						thisObj.loadedDistances.push(distanceMarkers[i].isLoadedDistance);
						
						if(i == distanceMarkers.length - 1) {
							var locationTo = new google.maps.LatLng(distanceMarkers[i].latitudeTo, distanceMarkers[i].longitudeTo);
							var options = {limit: thisObj.googleMapsDestinationMarkerLimit}
							thisObj.addMarker(locationTo, options);
						}
					}
					
					thisObj.calcRoute();
				}
			}
			
			this.showModal(this.modalIdGetDD);
		},

		showGetDestinationRoute: function (distanceMarkers, options) {
			var thisObj = this;

			thisObj.loadedDistances = [];
				
			if(distanceMarkers.length > 0) {
				thisObj.clearMap();
				
				for(var i = 0; i < distanceMarkers.length; i++) {
					var locationFrom = new google.maps.LatLng(distanceMarkers[i].latitudeFrom, distanceMarkers[i].longitudeFrom);
					var options = { limit: thisObj.googleMapsDestinationMarkerLimit, draggableMarker: options.draggableMarker }
					thisObj.addMarker(locationFrom, options);
					thisObj.loadedDistances.push(distanceMarkers[i].isLoadedDistance);
					
					if(i == distanceMarkers.length - 1) {
						var locationTo = new google.maps.LatLng(distanceMarkers[i].latitudeTo, distanceMarkers[i].longitudeTo);
						var options = { limit: thisObj.googleMapsDestinationMarkerLimit, draggableMarker: options.draggableMarker };
						thisObj.addMarker(locationTo, options);
					}
				}
				
				thisObj.calcRoute();
			}
		},
		
		showModalGetLocation: function (marker) {			
			var thisObj = this;	
			var options = {draggableMarker: marker.draggableMarker};
			this.shownModalCallback = function () {
				thisObj.removeMarkers();
				
				if(marker.lat != '' && marker.lng != '') {
					var location = new google.maps.LatLng(marker.lat, marker.lng);					
					thisObj.addMarker(location, options);					
				}
				
				thisObj.centerMap();
			};			
			
			this.showModal(this.modalIdGetLocation);
		},
		
		showModalSetLocation: function (markers, options) {
			var thisObj = this;

			this.shownModalCallback = function () {
				thisObj.removeMarkers();
				
				for(var i = 0; i < markers.length; i++) {
					
					var locationMarkerInfoWindowTemplateVariables = {
						account_name: markers[i].accountName,
						location_name: markers[i].name,
						total_tons: markers[i].totalTons
					};
			
					var infoWindowTemplateVariables = _.template(locationMarkerInfoWindowTemplate, locationMarkerInfoWindowTemplateVariables);
					
					var infoWindow = new google.maps.InfoWindow({
						content: infoWindowTemplateVariables,
					});
					
					var location = new google.maps.LatLng(markers[i].lat, markers[i].lng);
					
					if(typeof options != "undefined" && typeof options.draggableMarker != "undefined"){
						options.draggableMarker = false;
						var marker = thisObj.addMarker(location, options);
					}						
					else
						var marker = thisObj.addMarker(location);
						
					thisObj.attachInfoWindow(marker, infoWindow);
				}
				
				thisObj.centerMap();
			};
		
			this.showModal(this.modalIdSetLocation);
		},
		
		showDashboardSetLocation: function (markers, centerPoint, options) {
			var thisObj = this;
			var radius = 402.3361244731408 * 1000;
			var circle = new google.maps.Circle({radius: 10, center: centerPoint}); 
			this.map.fitBounds(circle.getBounds());
			circle.setRadius(radius);
			circle.setCenter(this.map.getCenter());		

			thisObj.removeMarkers();
				
			for(var i = 0; i < markers.length; i++) {									
				var locationMarkerInfoWindowTemplateVariables = {
					account_name: markers[i].accountName,
					location_name: markers[i].address,
				};
		
				var infoWindowTemplateVariables = _.template(locationMarkerInfoWindowTemplate, locationMarkerInfoWindowTemplateVariables);
				
				var infoWindow = new google.maps.InfoWindow({
					content: infoWindowTemplateVariables,
				});
				
				var location = new google.maps.LatLng(markers[i].lat, markers[i].lng);
				
				var marker = thisObj.addMarker(location, options);


				thisObj.attachInfoWindow(marker, infoWindow);
			}

			this.map.fitBounds(circle.getBounds());
			this.map.circleRadius = radius;
											
		},
		
		showModal: function (id) {
			$('#'+id).modal('show');
		},
		
		addMarker: function (location, options) {
			var draggable = true;
			var marker = null;	

			if(typeof options != "undefined" && typeof options.draggableMarker != "undefined")
				draggable = options.draggableMarker;		

									
			if(typeof options != "undefined" && options.limit == 1) {					
				if(typeof this.markers[0] !== 'undefined' && this.markers[0] != null)
					this.markers[0].setMap(null)
				
				marker = new google.maps.Marker({
					position: location, 
					map: this.map,
					draggable: draggable,
					animation: google.maps.Animation.DROP,
					icon:icon,
				});
				
				if(typeof this.markers[0] !== 'undefined' && this.markers[0] != null)
					this.markers[0] = marker;
				else
					this.markers.push(marker);
			}
			else {
				var icon;

				if(typeof options != "undefined" && options.limit != null && this.markers.length < options.limit)
					icon = this.markerIconAlphabetPre + this.markerIconAlphabets[this.markers.length] + this.markerIconAlphabetPost;									
				else
					icon = this.markerIconDefault;
				
				marker = new google.maps.Marker({
					position: location, 
					map: this.map,
					draggable: draggable,
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
			'keypress #search-map': 'searchMap'
		},

		searchMap: function(ev){
			var pacContainerInitialized = false;

			if (!pacContainerInitialized) {
	            $('.pac-container').css('z-index', '9999');
	            pacContainerInitialized = true;
	        }
		},
		
		setLoadedDistance: function (ev) {
			var element = $(ev.currentTarget);
			var id = element.attr('data-id');
			if(element.is(':checked'))
				this.destinationLeg[id].loaded = true;
			else
				this.destinationLeg[id].loaded = false;
		},
		
		useData: function () {
			
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
					if(this.markers.length > 0){
						returnData = {location:this.markers[0].getPosition()};					

						if($("#addAccountForm").length > 0)
							this.updateAddress(returnData);
						else if($("#locationForm").length > 0)
							this.updateSectionCoordinates(returnData);
					}																			

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

		updateAddress: function(data) {
			var index = $('#google-maps-modal-getlocation').attr('data-id');		
			var street = '';
			var city = '';
			var state = '';
			var zipcode = '';
			var lat = data.location.k;
			var lng = data.location.B;
			var statecode;

			var geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(lat, lng);			

			if (geocoder) {
		      geocoder.geocode({ 'latLng': latlng }, function (results, status) {
		         if (status == google.maps.GeocoderStatus.OK) {
		         	_.each(results[0].address_components, function(address){
		         		if(address.types[0] == "street_number" && address.types[0] != undefined)
		         			street = address.short_name + ', ';
		         		if(address.types[0] == "route" && address.types[0] != undefined)
		         			street += address.long_name;
		         		else if(address.types[0] == "route" && address.types[0] == undefined) {
		         			street += '';
		         		}
		         		if(address.types[0] == "locality" && address.types[0] != undefined){
		         			city =  address.long_name;
		         		}
		         		else if(address.types[0] == "locality" && address.types[0] == undefined){		         		
		         			if(address.types[0] == "administrative_area_level_2" && address.types[0] != undefined)
		         				city =  address.long_name;
		         		}
		         		if(address.types[0] == "administrative_area_level_1" && address.types[0] != undefined)
		         			state = address.long_name;
		         		if(address.types[0] == "postal_code" && address.types[0] != undefined)
		         			zipcode = address.long_name;
		         	});
		         		         			         
		         	_.each($('.state[name="state.'+ index +'"] option'), function(option){		         		
		         		if($('.state[name="state.'+ index +'"] option[value="'+ option.value +'"]').text() == state)	
		         			statecode = option.value;	         			
		         	});
		       
		         	$('.latitude[name="latitude.'+ index +'"]').val(latlng.k);
		         	$('.longitude[name="longitude.'+ index +'"]').val(latlng.B);
		         	$('.street[name="street.'+ index +'"]').val(street);
		         	$('.city[name="city.'+ index +'"]').val(city);
		         	$('.state[name="state.'+ index +'"]').val(statecode);
		         	$('.zipcode[name="zipcode.'+ index +'"]').val(zipcode);    			         
		         }
		         else {
		         	console.log("Invalid");
		         }
		      });
		    }
		   				
		},

		updateSectionCoordinates: function(data){
			var index = $('#google-maps-modal-getlocation').attr('data-id');	

			var lat = data.location.k;
			var lng = data.location.B;
			var latField = '.latitude[name="latitude.'+ index +'"]';
			var lngField = '.longitude[name="longitude.'+ index +'"]';
		
			$(latField).val(lat);
		    $(lngField).val(lng);			
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
					else if (status == google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED) {
						if($("#google-maps-modal-getdd").length > 0)
							$("<span class='error-msg-cont padding-top-5'><label class='error'>Waypoints exceeded limit!</label></span>").insertAfter($(".modal-body .table-responsive"));
						else if($("#dashboard_logistics").length > 0)
							$('.graph-cont[data-id="10"]').find('.md-dark.prusia').prepend("<span class='error-msg-cont pull-right padding-top-10 margin-right-10'><label style='color:#ffffff'>Waypoints exceeded limit!</label></span>");
					}	
					else 
						console.log(status);							
					
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