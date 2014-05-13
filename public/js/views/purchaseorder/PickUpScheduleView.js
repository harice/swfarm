define([
	'backbone',
	'views/base/AppView',
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
	'text!templates/purchaseorder/purchaseOrderViewScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewScheduleProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
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

	var PickUpScheduleView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.id;
			this.h1Title = 'Pick Up Schedule';
			this.h1Small = 'view';
			
			this.model = new POScheduleModel({id:this.schedId});
			this.model.on('change', function() {
				thisObj.displayForm();
				thisObj.supplyScheduleData();
				thisObj.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {};
			
			var innerTemplate = _.template(purchaseOrderAddScheduleTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		supplyScheduleData: function () {
			var thisObj = this;
			var trucker = this.model.get('trucker');
			var originloader = this.model.get('originloader');
			var destinationloader = this.model.get('destinationloader');
			var trailer = this.model.get('trailer');
			var products = this.model.get('transportscheduleproduct');
			
			this.$el.find('#scheduledate').val(this.convertDateFormat(this.model.get('scheduledate'), this.dateFormatDB, this.dateFormat, '-'));
			this.$el.find('#scheduletimeHour').val(this.model.get('scheduletimeHour'));
			this.$el.find('#scheduletimeMin').val(this.model.get('scheduletimeMin'));
			this.$el.find('#scheduletimeAmPm').val(this.model.get('scheduletimeAmPm'));
			
			this.$el.find('#distance').val(parseFloat(this.model.get('distance')).toFixed(2));
			this.$el.find('#fuelcharge').val(parseFloat(this.model.get('fuelcharge')).toFixed(2));
			this.$el.find('#truckingrate').val(parseFloat(this.model.get('truckingrate')).toFixed(2));
			this.$el.find('#trailerrate').val(parseFloat(this.model.get('trailerrate')).toFixed(2));
			
			this.$el.find('#originloader').val(originloader.accountidandname.name);
			this.$el.find('#originloader_id').val(originloader.lastname+', '+originloader.firstname+' '+originloader.suffix);
			this.$el.find('#originloaderfee').val(parseFloat(this.model.get('originloaderfee')).toFixed(2));
			
			this.$el.find('#destinationloader').val(destinationloader.accountidandname.name);
			this.$el.find('#destinationloader_id').val(destinationloader.lastname+', '+destinationloader.firstname+' '+destinationloader.suffix);
			this.$el.find('#destinationloaderfee').val(parseFloat(this.model.get('destinationloaderfee')).toFixed(2));
			
			this.$el.find('#truckerAccountType_id').val(trucker.accountidandname.accounttype[0].name);
			this.$el.find('#truckerAccount_id').val(trucker.accountidandname.name);
			this.$el.find('#trucker_id').val(trucker.lastname+', '+trucker.firstname+' '+trucker.suffix);
			
			this.$el.find('#trailer').val(trailer.account.name);
			this.$el.find('#trailer_id').val(trailer.number);
			
			var totalQuantity = 0;
			_.each(products, function (product) {
				totalQuantity += parseFloat(product.quantity);
				
				var variables = {
					stock_number: product.productorder.stacknumber,
					product_name: product.productorder.product.name,
					quantity: parseFloat(product.quantity).toFixed(4),
				};
				
				var template = _.template(purchaseOrderPickUpScheduleProductItemTemplate, variables);
				thisObj.$el.find('#product-list tbody').append(template);
			});
			
			this.$el.find('#total-quantity').val(parseFloat(totalQuantity).toFixed(4));
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

	return PickUpScheduleView;
});