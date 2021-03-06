define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'views/base/GoogleMapsView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/delivery/DeliveryLocationModel',	
	'collections/account/AccountCollection',
	'collections/address/AddressCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/delivery/deliveryLocationAddTemplate.html',
	'text!templates/delivery/deliveryLocationSectionItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			GoogleMapsView,
			Validate,
			TextFormatter,
			DeliveryLocationModel,	
			AccountCollection,
			AddressCollection,		
			contentTemplate,
			deliveryLocationAddTemplate,
			deliveryLocationSectionItemTemplate,
			Global,
			Const
){

	var DeliveryLocationAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.dlId = null;
			this.h1Title = 'Stack Location';
			this.h1Small = 'add';

			this.options = {
				sectionFieldClone: null,
				sectionFieldCounter: 0,
				sectionFieldClass: ['name', 'description', 'latitude', 'longitude', 'id', 'map'],
				sectionFieldClassRequired: ['name', 'latitude', 'longitude'],
				sectionFieldExempt: [],
				sectionFieldSeparator: '.',
				removeComma: [],
			};

			this.producerAndWarehouseAccount = new AccountCollection();
			this.producerAndWarehouseAccount.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.producerAndWarehouseAccount.on('error', function(collection, response, options) {
				this.off('error');
			});

			this.addressCollection = new AddressCollection();

		},

		render: function(){
			this.producerAndWarehouseAccount.getProducerAndWarehouseAccount();
			Backbone.View.prototype.refreshTitle('Delivery Location','add');
		},

		displayForm: function () {
			var thisObj = this;

			var innerTemplateVariables = {
				'dl_url' : '#/'+Const.URL.DELIVERYLOCATION,
				'account_list' : '',
			};

			if(this.slId != null)
				innerTemplateVariables['dl_id'] = this.slId;

			var innerTemplate = _.template(deliveryLocationAddTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initGetMapLocation(function (data) {
				var index = $('#' + thisObj.googleMaps.modalIdGetLocation).attr('data-id');
				if(typeof data.location !== 'undefined') {
					if(typeof index == "undefined"){
						thisObj.subContainer.find('#latitude').val(data.location.lat());
						thisObj.subContainer.find('#longitude').val(data.location.lng());
					}
				}
				else {
					thisObj.subContainer.find('#latitude').val('');
					thisObj.subContainer.find('#longitude').val('');
				}
			});

			this.initValidateForm();
			this.generateAccount();
			this.addSection();
			this.focusOnFirstField();
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});

			this.otherInitializations();
		},

		initValidateForm: function () {
			var thisObj = this;

			var validate = $('#locationForm').validate({
				submitHandler: function(form) {
					//var data = $(form).serializeObject();
					var data = thisObj.formatFormField($(form).serializeObject());
					//console.log(data);

					var deliveryLocationModel = new DeliveryLocationModel(data);


					deliveryLocationModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: deliveryLocationModel.getAuth(),
						}
					);
				},
			});
		},

		addSection: function () {
			var clone = null;

			if(this.options.sectionFieldClone == null) {
				var sectionTemplateVars = {};
				var sectionTemplate = _.template(deliveryLocationSectionItemTemplate, sectionTemplateVars);

				this.$el.find('#section-list tbody').append(sectionTemplate);
				var sectionItem = this.$el.find('#section-list tbody').find('.section-item:first-child');
				this.options.sectionFieldClone = sectionItem.clone();				
				this.addIndexToSectionFields(sectionItem);
				clone = sectionItem;			
			}
			else {
				var clone = this.options.sectionFieldClone.clone();
				this.addIndexToSectionFields(clone);
				this.$el.find('#section-list tbody').append(clone);
			}

			this.addValidationToSection();
			return clone;
		},		

		addIndexToSectionFields: function (sectionItem) {
			var sectionFieldClass = this.options.sectionFieldClass;
			for(var i=0; i < sectionFieldClass.length; i++) {
				var field = sectionItem.find('.'+sectionFieldClass[i]);
				if(sectionFieldClass[i] == 'map'){
					field.attr('data-id', this.options.sectionFieldCounter);
				}
				else{ 	
					var name = field.attr('name');	
					var fieldname = name + this.options.sectionFieldSeparator + this.options.sectionFieldCounter;
					field.attr('name', fieldname);	

					if(sectionFieldClass[i] == 'latitude' || sectionFieldClass[i] == 'longitude'){						
						var value = $('#'+sectionFieldClass[i]).val();							
						field.val(value);
					}									
				}
			}

			this.options.sectionFieldCounter++;
		},

		addValidationToSection: function () {
			var thisObj = this;
			var sectionFieldClassRequired = this.options.sectionFieldClassRequired;
			for(var i=0; i < sectionFieldClassRequired.length; i++) {
				$('.'+sectionFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},

		generateAccount: function () {
			var options = '';
			_.each(this.producerAndWarehouseAccount.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});

			this.$el.find('#account_id').append(options);
		},

		events: {
			'click #add-section': 'addSection',
			'click .remove-section': 'removeSection',
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-sl': 'showDeleteConfirmationWindow',
			'click #confirm-delete-dl': 'deleteDeliveryLocation',
			'change #account_id': 'generateAddress',
			'click #map': 'showMap',
			'change #address': 'setCoordinates',
			'click .map': 'showSectionMap'
		},

		generateAddress: function (){
			var thisObj = this;
			var address = '';
			var acct_id = this.subContainer.find("#account_id").val();

			if(acct_id == undefined)
				acct_id = this.model.get('account_id');

			this.addressCollection.fetchStackAddress(acct_id);

			this.addressCollection.fetch({
				success: function (collection, response, options) {					
					address = thisObj.showAddressList();	
					thisObj.$el.find('#address').html(address);																
					thisObj.$el.find('#address').val('');					
				},
				error: function (collection, response, options) {
				},
				headers: this.addressCollection.getAuth()
			});

		},

		showAddressList: function () {
			var thisObj = this;
			var address = '<option disabled>Select Address</option>';

			_.each(this.addressCollection.models, function (model) {
				address += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});

			return address;

		},

		removeSection: function (ev) {
			$(ev.target).closest('tr').remove();

			if(!this.hasSection())
				this.addSection();
		},

		hasSection: function () {
			return (this.$el.find('#section-list tbody .section-item').length)? true : false;
		},

		deleteDeliveryLocation: function () {
			var thisObj = this;

            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    //Global.getGlobalVars().app_router.navigate(Const.URL.STACKLOCATION, {trigger: true});
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},

		formatFormField: function (data) {
			var formData = {sections:[]};
			var sectionFieldClass = this.options.sectionFieldClass;

			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.sectionFieldSeparator);

					if(arrayKey.length < 2)
						if(this.options.removeComma.indexOf(key) < 0)
							formData[key] = value;
						else
							formData[key] = this.removeCommaFromNumber(value);
					else {
						if(arrayKey[0] == sectionFieldClass[0]) {
							var index = arrayKey[1];
							var arraySectionFields = {};

							for(var i = 0; i < sectionFieldClass.length; i++) {
								if(this.options.sectionFieldExempt.indexOf(sectionFieldClass[i]) < 0) {
									var fieldValue = data[sectionFieldClass[i]+this.options.sectionFieldSeparator+index];
									if(!(sectionFieldClass[i] == 'id' && fieldValue == '')) {
										if(this.options.removeComma.indexOf(sectionFieldClass[i]) < 0)
											arraySectionFields[sectionFieldClass[i]] = fieldValue;
										else
											arraySectionFields[sectionFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
									}
								}
							}

							formData.sections.push(arraySectionFields);
						}
					}
				}
			}

			return formData;
		},

        showDeleteConfirmationWindow: function () {
            this.showConfirmationWindow();
        },

		showDeleteConfirmationWindow: function () {
			this.showConfirmationWindow();
		},


		showMap: function (ev) {			
			var thisObj = this;
			this.$el.find($("#"+this.googleMaps.modalIdGetLocation).removeAttr('data-id'));
			var addressVal = this.subContainer.find("#address").val();
			var address = this.subContainer.find("#address option:selected").text();			

			if(addressVal == '') {
				$("#map").next('.error-msg-cont').fadeOut();
				$("<span class='error-msg-cont'><label class='error margin-bottom-0'>Select an Address</label></div>").insertAfter($("#map"));
			}
			else {
				var lat = '';
				var lng = '';

				var geocoder = new google.maps.Geocoder();

			   if (geocoder) {
			      geocoder.geocode({ 'address': address }, function (results, status) {
			         if (status == google.maps.GeocoderStatus.OK) {
			         	$("#map").next('.error-msg-cont').fadeOut();
			            thisObj.googleMaps.showModalGetLocation({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng(), draggableMarker: false});			            
			         }
			         else {
			         	$("#map").next('.error-msg-cont').fadeOut();
			            $("<span class='error-msg-cont'><label class='error margin-bottom-0'>Invalid Address</label></div>").insertAfter($("#map"));
			         }
			      });
			   }
			}

		},

		showSectionMap: function(ev){
			var index = $(ev.target).attr('data-id');
			var lat = $('.latitude[name="latitude.'+ index +'"]').val();
			var lng = $('.longitude[name="longitude.'+ index +'"]').val();

			this.$el.find($("#"+this.googleMaps.modalIdGetLocation).attr('data-id', index));
			this.googleMaps.showModalGetLocation({lat: lat, lng: lng, draggableMarker: true});			            
		},

		setCoordinates: function () {
			var lat = '';
			var lng = '';

			var address = $("#address option:selected").text();

			var geocoder = new google.maps.Geocoder();

		   if (geocoder) {
		      geocoder.geocode({ 'address': address }, function (results, status) {
		         if (status == google.maps.GeocoderStatus.OK) {
		         	$("#map").next('.error-msg-cont').fadeOut();
		         	$("#latitude").val(results[0].geometry.location.lat());
		            $("#longitude").val(results[0].geometry.location.lng());
		            $(".latitude").val(results[0].geometry.location.lat());
		            $(".longitude").val(results[0].geometry.location.lng());
		         }
		         else {
		         	$("#map").next('.error-msg-cont').fadeOut();
		            $("<span class='error-msg-cont'><label class='error margin-bottom-0'>Invalid Address</label></div>").insertAfter($("#map"));
		         }
		      });
		   }

		},

		otherInitializations: function () {},

		destroySubViews: function () {
			if(this.googleMaps != null)
				this.googleMaps.destroyView();
		},
	});

	return DeliveryLocationAddView;

});