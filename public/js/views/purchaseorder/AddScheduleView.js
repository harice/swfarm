define([
	'backbone',
	'bootstrapdatepicker',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/AccountTruckerAutoCompleteView',
	'collections/account/AccountTruckerCollection',
	'text!templates/purchaseorder/purchaseOrderScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddScheduleTemplate.html',
], function(Backbone,
			DatePicker,
			Validate,
			TextFormatter,
			PhoneNumber,
			AccountTruckerAutoCompleteView,
			AccountTruckerCollection,
			purchaseOrderScheduleTemplate,
			purchaseOrderAddScheduleTemplate
){
	
	var AddScheduleView = Backbone.View.extend({
		//el: $("#po-schedule"),
		el: "#po-schedule",
		
		initialize: function () {
			this.addFieldsClone = null;
			this.truckerAutoCompleteResult = [];
		},
		
		render: function () {
			var thisObj = this;
			
			var compiledTemplate = _.template(purchaseOrderScheduleTemplate, {});
			this.$el.html(compiledTemplate);
			//this.resetAddFields();
		},
		
		resetAddFields: function () {
			var addFieldsContainer = $('#po-schedule-form-cont');
			addFieldsContainer.empty();
			
			if(this.addFieldsClone == null) {
				var addTemplate = _.template(purchaseOrderAddScheduleTemplate, {});
				addFieldsContainer.html(addTemplate);
				this.populateTimeOPtions();
				this.addFieldsClone = addFieldsContainer.find('> form:first-child').clone();
			}
			else
				addFieldsContainer.html(this.addFieldsClone.clone());
				
			this.initCalendar();
			this.initFormProperties();
			this.initTruckerAutocomplete();
		},
		
		populateTimeOPtions: function () {
			var hourOptions = '';
			for(var i=1; i<=12; i++) {
				var hour = i+'';
				hour = (hour.length > 1)? i : '0'+i;
				hourOptions += '<option value="'+i+'">'+hour+'</option>';
			}
			this.$el.find('.hours').html(hourOptions);
			
			var minutesOptions = '';
			for(var i=0; i< 60; i++) {
				var minute = i+'';
				minute = (minute.length > 1)? i : '0'+i;
				minutesOptions += '<option value="'+i+'">'+minute+'</option>';
			}
			this.$el.find('.minutes').html(minutesOptions);
		},
		
		initCalendar: function () {
			this.$el.find('#po-sched-start-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			});
		},
		
		initFormProperties: function () {
			var validate = $('#POScheduleForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					console.log(data);
				},
				errorPlacement: function(error, element) {
					if(element.attr('name') == 'date') {
						element.closest('.calendar-cont').siblings('.error-msg-cont').html(error);
					}
					else {
						error.insertAfter(element);
					}
				},
			});
		},
		
		initTruckerAutocomplete: function () {
			var thisObj = this;
			
			var accountTruckerCollection = new AccountTruckerCollection();
			this.accountTruckerAutoCompleteView = new AccountTruckerAutoCompleteView({
                input: $('#trucker'),
				hidden: $('#trucker-id'),
                collection: accountTruckerCollection,
            });
			
			this.accountTruckerAutoCompleteView.on('loadResult', function () {
				thisObj.truckerAutoCompleteResult = [];
				_.each(accountTruckerCollection.models, function (model) {
					thisObj.truckerAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountTruckerAutoCompleteView.onSelect = function (model) {
				//thisObj.getProducerAddress(model.get('id'));
			};
			
			this.accountTruckerAutoCompleteView.render();
		},
		
		events: {
			//'blur #trucker': 'validateTrucker',
			'click #add-schedule': 'showAddSchedule',
			'click #cancel-add-weight-info': 'cancelAddSchedule',
			'click #add-weight-info': 'showAddWeightTicket',
			'click #show-weight-info': 'showWeightTicket',
		},
		
		/*validateTrucker: function (ev) {
			var labelField = $(ev.target);
			var fieldId = $(ev.target).attr('id');
			var idField = labelField.siblings('#producer-id');
			var producer = this.producerIsInFetchedData(labelField.val(), idField.val());
			
			switch(fieldId) {
				case 'trucker':
					
					break;
				default:
					break;
			}
			
			if(!this.producerAutoCompleteView.$el.is(':hover')) {
				if(producer !== false) {
					if(producer.id != null) {
						labelField.val(producer.name);
						idField.val(producer.id);
						this.resetProducerAddress();
						this.getProducerAddress(producer.id);
					}
					else
						labelField.val(producer.name);
				}
				else {
					labelField.val('');
					idField.val('');
					this.resetProducerAddress();
				}
				labelField.siblings('.autocomplete').hide();
			}
		},*/
		
		showAddSchedule: function () {
			this.resetAddFields();
			console.log('showAddSchedule');
			return false;
		},
		
		cancelAddSchedule: function () {
			$('#po-schedule-form-cont').empty();
			console.log('cancelAddSchedule');
			return false;
		},
		
		showAddWeightTicket: function () {
			console.log('showAddWeightTicket');
			
			return false;
		},
		
		showWeightTicket: function () {
			console.log('showWeightTicket');
			
			return false;
		},
	});
	
	return AddScheduleView;
});
