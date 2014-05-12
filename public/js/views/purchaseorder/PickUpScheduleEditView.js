define([
	'backbone',
	'views/purchaseorder/PickUpScheduleAddView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'models/order/OrderScheduleVariablesModel',
	'models/purchaseorder/POScheduleModel',
	'collections/product/ProductCollection',
	'collections/account/AccountCollection',
	'collections/account/AccountTypeCollection',
	'collections/contact/ContactCollection',
	'collections/account/TrailerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderPickUpScheduleProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			PickUpScheduleAddView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			OrderScheduleVariablesModel,
			POScheduleModel,
			ProductCollection,
			AccountCollection,
			AccountTypeCollection,
			ContactCollection,
			TrailerCollection,
			contentTemplate,
			purchaseOrderAddScheduleTemplate,
			purchaseOrderPickUpScheduleProductItemTemplate,
			Global,
			Const
){

	var PickUpScheduleEditView = PickUpScheduleAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.id;
			this.h1Title = 'Pick Up Schedule';
			this.h1Small = 'edit';
			this.inits();
			
			this.model = new POScheduleModel({id:this.schedId});
			this.model.on('change', function() {
				thisObj.inits();
				thisObj.orderScheduleVariablesModel.runFetch();
				thisObj.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyPOData: function () {
			var thisObj = this;
			var trucker = this.model.get('trucker');
			var originloader = this.model.get('originloader');
			var destinationloader = this.model.get('destinationloader');
			var trailer = this.model.get('trailer');
			
			this.$el.find('#po-sched-start-date .input-group.date').datepicker('update', this.convertDateFormat(this.model.get('scheduledate').split(' ')[0], this.dateFormatDB, this.dateFormat, '-'));
			this.$el.find('#scheduletimeHour').val(this.model.get('scheduletimeHour'));
			this.$el.find('#scheduletimeMin').val(this.model.get('scheduletimeMin'));
			this.$el.find('#scheduletimeAmPm').val(this.model.get('scheduletimeAmPm'));
			
			this.$el.find('#truckerAccountType_id').val(trucker.accountidandname.accounttype);
			this.fetchTruckerAccounts(trucker.accountidandname.accounttype, trucker.accountidandname.id, trucker.id);
			
			this.$el.find('#trailer').val(trailer.account_id);
			this.fetchTrailer(trailer.account_id, trailer.id);
			
			this.$el.find('#distance').val(this.model.get('distance'));
			this.$el.find('#fuelcharge').val(this.model.get('fuelcharge')).blur();
			
			this.$el.find('#originloader').val(originloader.accountidandname.id);
			this.fetchOriginLoaderContacts(originloader.accountidandname.id, originloader.id);
			this.$el.find('#originloaderfee').val(this.model.get('originloaderfee')).blur();
			
			this.$el.find('#destinationloader').val(destinationloader.accountidandname.id);
			this.fetchDestinationLoaderContacts(destinationloader.accountidandname.id, destinationloader.id);
			this.$el.find('#destinationloaderfee').val(this.model.get('destinationloaderfee')).blur();
		},
		
		postDisplayForm: function () {
			this.supplyPOData();
		},
	});

	return PickUpScheduleEditView;
});