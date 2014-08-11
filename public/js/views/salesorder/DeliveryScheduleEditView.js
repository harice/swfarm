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
			this.initSubContainer();
			var thisObj = this;
			this.soId = option.soId;
			this.schedId = option.id;
			this.h1Title = 'Delivery Schedule';
			this.h1Small = 'edit';
			this.inits();
			
			this.model = new SOScheduleModel({id:this.schedId});
			this.model.on('change', function() {
				if(thisObj.subContainerExist())
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
			var truckerNumber = this.model.get('truckvehicle');
			
			this.$el.find('#so-sched-start-date .input-group.date').datepicker('update', Backbone.View.prototype.helpers.formatDate(this.model.get('date')));
			this.$el.find('#scheduletimeHour').val(Backbone.View.prototype.helpers.formatDateBy(this.model.get('date'),'h'));
			this.$el.find('#scheduletimeMin').val(Backbone.View.prototype.helpers.formatDateBy(this.model.get('date'),'i'));
			this.$el.find('#scheduletimeAmPm').val(Backbone.View.prototype.helpers.formatDateBy(this.model.get('date'),'A'));
			
			this.$el.find('#distance').val(this.addCommaToNumber(this.model.get('distance')));
			this.$el.find('#fuelcharge').val(this.addCommaToNumber(this.model.get('fuelcharge')));
			
			var i= 0;
			var totalQuantity = 0;
			_.each(products, function (product) {
				var productFields = (i > 0)? thisObj.addProduct(): thisObj.$el.find('#product-list tbody .product-item:first-child');
				i++;
				
				var quantity = parseFloat(product.quantity);
				totalQuantity += quantity;
				
				productFields.find('.id').val(product.id);
				productFields.find('.productorder_id').val(product.productorder_id).change();
				productFields.find('.quantity').val(thisObj.addCommaToNumber(quantity.toFixed(4)));
			});
			this.$el.find('#total-quantity').val(this.addCommaToNumber(totalQuantity.toFixed(4)));
			
			this.$el.find('#truckerAccountType_id').val(trucker.accountidandname.accounttype[0].id);
			this.fetchTruckerAccounts(trucker.accountidandname.accounttype[0].id, trucker.accountidandname.id, trucker.id, truckerNumber.id, this.model.get('truckingrate'));
			
			this.$el.find('#trailer').val(trailer.account_id);
			this.fetchTrailer(trailer.account_id, trailer.id);
			
			this.$el.find('#originloader').val(originloader.accountidandname.id);
			this.fetchOriginLoaderContacts(originloader.accountidandname.id, originloader.id);
			this.$el.find('#originloaderfee').val(thisObj.addCommaToNumber(this.model.get('originloaderfee')));
			
			this.$el.find('#destinationloader').val(destinationloader.accountidandname.id);
			this.fetchDestinationLoaderContacts(destinationloader.accountidandname.id, destinationloader.id);
			this.$el.find('#destinationloaderfee').val(thisObj.addCommaToNumber(this.model.get('destinationloaderfee')));
		},
		
		postDisplayForm: function () {
			if(this.subContainerExist())
				this.supplyScheduleData();
		},
	});

	return DeliveryScheduleEditView;
});