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
			this.resetAddFields();
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
	});
	
	return AddScheduleView;
});
