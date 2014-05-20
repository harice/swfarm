define([
	'backbone',
	'views/salesorder/DeliveryScheduleAddView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'models/order/OrderScheduleVariablesModel',
	'models/salesorder/SOScheduleModel',
	'collections/product/ProductCollection',
	'collections/account/AccountCollection',
	'collections/account/AccountTypeCollection',
	'collections/contact/ContactCollection',
	'collections/account/TrailerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/deliveryScheduleAddTemplate.html',
	'text!templates/salesorder/deliveryScheduleProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DeliveryScheduleAddView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			OrderScheduleVariablesModel,
			SOScheduleModel,
			ProductCollection,
			AccountCollection,
			AccountTypeCollection,
			ContactCollection,
			TrailerCollection,
			contentTemplate,
			deliveryScheduleAddTemplate,
			deliveryScheduleProductItemTemplate,
			Global,
			Const
){

	var DeliveryScheduleEditView = DeliveryScheduleAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			this.soId = option.soId;
			this.schedId = option.id;
			this.h1Title = 'Delivery Schedule';
			this.h1Small = 'edit';
			this.inits();
			
			this.model = new SOScheduleModel({id:this.schedId});
			this.model.on('change', function() {
				thisObj.orderScheduleVariablesModel.runFetch();
				thisObj.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyScheduleData: function () {
			var thisObj = this;
			var trucker = this.model.get('trucker');
			var originloader = this.model.get('originloader');
			var destinationloader = this.model.get('destinationloader');
			var trailer = this.model.get('trailer');
			var products = this.model.get('transportscheduleproduct');
			
			this.$el.find('#so-sched-start-date .input-group.date').datepicker('update', this.convertDateFormat(this.model.get('scheduledate'), this.dateFormatDB, this.dateFormat, '-'));
			this.$el.find('#scheduletimeHour').val(this.model.get('scheduletimeHour'));
			this.$el.find('#scheduletimeMin').val(this.model.get('scheduletimeMin'));
			this.$el.find('#scheduletimeAmPm').val(this.model.get('scheduletimeAmPm'));
			
			this.$el.find('#distance').val(this.model.get('distance'));
			this.$el.find('#fuelcharge').val(this.model.get('fuelcharge')).blur();
			
			var i= 0;
			_.each(products, function (product) {
				var productFields = (i > 0)? thisObj.addProduct(): thisObj.$el.find('#product-list tbody .product-item:first-child');
				i++;
				productFields.find('.id').val(product.id);
				productFields.find('.productorder_id').val(product.productorder_id).change();
				productFields.find('.quantity').val(product.quantity).blur();
				
			});
			
			this.$el.find('#truckerAccountType_id').val(trucker.accountidandname.accounttype[0].id);
			this.fetchTruckerAccounts(trucker.accountidandname.accounttype[0].id, trucker.accountidandname.id, trucker.id, this.model.get('truckingrate'));
			
			this.$el.find('#trailer').val(trailer.account_id);
			this.fetchTrailer(trailer.account_id, trailer.id);
			
			this.$el.find('#originloader').val(originloader.accountidandname.id);
			this.fetchOriginLoaderContacts(originloader.accountidandname.id, originloader.id);
			this.$el.find('#originloaderfee').val(this.model.get('originloaderfee')).blur();
			
			this.$el.find('#destinationloader').val(destinationloader.accountidandname.id);
			this.fetchDestinationLoaderContacts(destinationloader.accountidandname.id, destinationloader.id);
			this.$el.find('#destinationloaderfee').val(this.model.get('destinationloaderfee')).blur();
		},
		
		postDisplayForm: function () {
			this.supplyScheduleData();
		},
	});

	return DeliveryScheduleEditView;
});