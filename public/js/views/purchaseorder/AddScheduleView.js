define([
	'backbone',
	'text!templates/purchaseorder/purchaseOrderScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddScheduleTemplate.html',
], function(Backbone, purchaseOrderScheduleTemplate, purchaseOrderAddScheduleTemplate){
	
	var AddScheduleView = Backbone.View.extend({
		//el: $("#po-schedule"),
		el: "#po-schedule",
		
		initialize: function () {
			this.addFieldsClone = null;
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
		
		events: {
			'click #add-schedule': 'showAddSchedule',
			'click #cancel-add-weight-info': 'cancelAddSchedule',
		},
		
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
	});
	
	return AddScheduleView;
});
