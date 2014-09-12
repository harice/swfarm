define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'views/base/GoogleMapsView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/stack/StackLocationModel',
	'collections/account/AccountCollection',
	'collections/address/AddressCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stack/stackLocationAddTemplate.html',
	'text!templates/stack/stackLocationSectionItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			GoogleMapsView,
			Validate,
			TextFormatter,
			StackLocationModel,
			AccountCollection,
			AddressCollection,
			contentTemplate,
			stackLocationAddTemplate,
			stackLocationSectionItemTemplate,
			Global,
			Const
){

	var StackLocationAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.slId = null;
			this.h1Title = 'Stack Location';
			this.h1Small = 'add';
			
			this.options = {
				sectionFieldClone: null,
				sectionFieldCounter: 0,
				sectionFieldClass: ['name', 'description', 'id'],
				sectionFieldClassRequired: ['name'],
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
			Backbone.View.prototype.refreshTitle('Stack Location','add');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'sl_url' : '#/'+Const.URL.STACKLOCATION,
				'account_list' : '',
			};
			
			if(this.slId != null)
				innerTemplateVariables['sl_id'] = this.slId;
			
			var innerTemplate = _.template(stackLocationAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initGetMapLocation(function (data) {
				if(typeof data.location !== 'undefined') {					
					thisObj.subContainer.find('#latitude').val(data.location.lat());
					thisObj.subContainer.find('#longitude').val(data.location.lng());
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
					
					var stackLocationModel = new StackLocationModel(data);
					
					stackLocationModel.save(
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
							headers: stackLocationModel.getAuth(),
						}
					);
				},
			});
		},
		
		addSection: function () {
			var clone = null;
			
			if(this.options.sectionFieldClone == null) {
				var sectionTemplateVars = {};
				var sectionTemplate = _.template(stackLocationSectionItemTemplate, sectionTemplateVars);
				
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
				var name = field.attr('name');
				field.attr('name', name + this.options.sectionFieldSeparator + this.options.sectionFieldCounter);
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
			'click #confirm-delete-sl': 'deleteStockLocation',
			'change #account_id': 'generateAddress',
			'click #map': 'showMap',
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
				},
				error: function (collection, response, options) {
				},
				headers: this.addressCollection.getAuth()
			});
					
		},

		showAddressList: function () {
			var thisObj = this;
			var address = '<option value="">Select an address</option>';
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
		
		deleteStockLocation: function () {
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
		

		showMap: function () {
			var thisObj = this;
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
			            thisObj.googleMaps.showModalGetLocation({lat: results[0].geometry.location.k, lng: results[0].geometry.location.B});		           	           
			           
			         }
			         else {
			         	$("#map").next('.error-msg-cont').fadeOut();
			            $("<span class='error-msg-cont'><label class='error margin-bottom-0'>Invalid Address</label></div>").insertAfter($("#map"));
			         }
			      });
			   } 
			}   

		},
		
		otherInitializations: function () {},
		
		destroySubViews: function () {
			if(this.googleMaps != null)
				this.googleMaps.destroyView();
		},
	});

	return StackLocationAddView;
  
});