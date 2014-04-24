define([
	'backbone',
	'views/purchaseorder/PickUpScheduleAddView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'models/purchaseorder/TruckingRateModel',
	'models/purchaseorder/POScheduleModel',
	'collections/account/AccountTruckerCollection',
	'collections/account/AccountLoaderCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddScheduleTemplate.html',
	'global',
	'constant',
], function(Backbone,
			PickUpScheduleAddView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			TruckingRateModel,
			POScheduleModel,
			AccountTruckerCollection,
			AccountLoaderCollection,
			contentTemplate,
			purchaseOrderAddScheduleTemplate,
			Global,
			Const
){

	var PickUpScheduleEditView = PickUpScheduleAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.poid = option.poid;
			this.truckingRatePerMile = null;
			
			this.truckingRateModel = new TruckingRateModel();
			this.truckingRateModel.on('change', function() {
				thisObj.truckingRatePerMile = this.get('truckingrate');
				thisObj.displayForm();
				thisObj.supplyScheduleData();
				this.off('change');
			});
			
			this.model = new POScheduleModel({id:option.id});
			this.model.on('change', function() {
				thisObj.truckingRateModel.runFetch();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyScheduleData: function () {
			this.$el.find('#bid_id').before('<input id="schedId" type="hidden" name="id" value="'+this.model.get('id')+'" />');
			this.$el.find('#po-sched-start-date input').val(this.model.get('scheduledate'));
			
			this.accountTruckerAutoCompleteView.autoCompleteResult = [{name:this.model.get('trucker')[0].name, id:this.model.get('trucker')[0].id}];
			this.toggleTruckingRate(this.model.get('trucker')[0].accounttype);
			this.accountLoaderOriginAutoCompleteView.autoCompleteResult = [{name:this.model.get('origin_loader')[0].name,id:this.model.get('origin_loader')[0].id}];
			this.accountLoaderDestinationAutoCompleteView.autoCompleteResult = [{name:this.model.get('destination_loader')[0].name,id:this.model.get('destination_loader')[0].id}];
			
			this.$el.find('#trucker').val(this.model.get('trucker')[0].name);
			this.$el.find('#trucker-id').val(this.model.get('trucker')[0].id);
			
			this.$el.find('#originloader').val(this.model.get('origin_loader')[0].name);
			this.$el.find('#originloader-id').val(this.model.get('origin_loader')[0].id);
			
			this.$el.find('#destinationloader').val(this.model.get('destination_loader')[0].name);
			this.$el.find('#destinationloader-id').val(this.model.get('destination_loader')[0].id);
			
			this.$el.find('.hours').val(this.model.get('scheduletimeHour'));
			this.$el.find('.minutes').val(this.model.get('scheduletimeMin'));
			this.$el.find('.ampm').val(this.model.get('scheduletimeAmPm'));
			this.$el.find('#distance').val(this.model.get('distance'));
			this.$el.find('#fuelcharge').val(this.model.get('fuelcharge')).blur();
			this.$el.find('#truckingrate').val(this.model.get('truckingrate')).blur();
			this.$el.find('#originloadersfee').val(this.model.get('originloadersfee')).blur();
			this.$el.find('#destinationloadersfee').val(this.model.get('destinationloadersfee')).blur();
			
			this.$el.find('#delete-schedule').show();
		},
	});

  return PickUpScheduleEditView;
  
});