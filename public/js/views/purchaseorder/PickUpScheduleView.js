define([
	'backbone',
	'views/base/AppView',
	'models/purchaseorder/POScheduleModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewScheduleTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			POScheduleModel,
			contentTemplate,
			purchaseOrderViewScheduleTemplate,
			Global,
			Const
){

	var PickUpScheduleView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			this.poid = option.poid;
			this.model = new POScheduleModel({id:option.id});
			this.model.on('change', function() {
				thisObj.displayForm();
				thisObj.supplyScheduleData();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var schedId = this.model.get('id');
			var innerTemplateVariables = {
				po_weight_info_url: '#/'+Const.URL.WEIGHTINFO+'/'+this.poid+'/'+schedId,
				po_schedule_edit_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poid+'/'+Const.CRUD.EDIT+'/'+schedId,
				po_schedule_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poid,
			};
			var innerTemplate = _.template(purchaseOrderViewScheduleTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "View Pick Up Schedule",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		supplyScheduleData: function () {
			this.$el.find('#po-sched-start-date').val(this.model.get('scheduledate'));
			this.$el.find('#truckerview').val(this.model.get('trucker')[0].name);
			this.$el.find('#originloaderview').val(this.model.get('origin_loader')[0].name);
			this.$el.find('#destinationloaderview').val(this.model.get('destination_loader')[0].name);
			this.$el.find('.hours').val(this.model.get('scheduletimeHour'));
			this.$el.find('.minutes').val(this.model.get('scheduletimeMin'));
			this.$el.find('.ampm').val(this.model.get('scheduletimeAmPm'));
			this.$el.find('#distance').val(this.model.get('distance'));
			this.$el.find('#fuelcharge').val(this.model.get('fuelcharge'));
			this.toFixedValue(this.$el.find('#fuelcharge'), 2);
			this.$el.find('#truckingrate').val(this.model.get('truckingrate'));
			this.toFixedValue(this.$el.find('#truckingrate'), 2);
			this.$el.find('#originloadersfee').val(this.model.get('originloadersfee'));
			this.toFixedValue(this.$el.find('#originloadersfee'), 2);
			this.$el.find('#destinationloadersfee').val(this.model.get('destinationloadersfee'));
			this.toFixedValue(this.$el.find('#destinationloadersfee'), 2);
		},
	});

  return PickUpScheduleView;
  
});