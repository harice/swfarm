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
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
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
			purchaseOrderTabbingTemplate,
			purchaseOrderAddScheduleTemplate,
			purchaseOrderPickUpScheduleProductItemTemplate,
			Global,
			Const
){

	var PickUpScheduleView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.id;
			this.h1Title = 'Pick Up Schedule';
			this.h1Small = 'view';
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 2)}));
			
			this.model = new POScheduleModel({id:this.schedId});
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyScheduleData();
				}
				thisObj.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Pickup Schedule','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {'schedule_edit_url': '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId+'/'+Const.CRUD.EDIT+'/'+this.schedId};
			
			var innerTemplate = _.template(purchaseOrderAddScheduleTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this schedule?',
										'confirm-delete-schedule',
										'Delete Schedule');
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
			
			this.$el.find('#distance').val(this.addCommaToNumber(this.model.get('distance')));
			this.$el.find('#fuelcharge').val(this.addCommaToNumber(this.model.get('fuelcharge')));
			this.$el.find('#truckingrate').val(this.addCommaToNumber(this.model.get('truckingrate')));
			this.$el.find('#trailerrate').val(this.addCommaToNumber(this.model.get('trailerrate')));
			
			this.$el.find('#originloader').val(originloader.accountidandname.name);
			this.$el.find('#originloader_id').val(originloader.lastname+', '+originloader.firstname+' '+originloader.suffix);
			this.$el.find('#originloaderfee').val(this.addCommaToNumber(this.model.get('originloaderfee')));
			
			this.$el.find('#destinationloader').val(destinationloader.accountidandname.name);
			this.$el.find('#destinationloader_id').val(destinationloader.lastname+', '+destinationloader.firstname+' '+destinationloader.suffix);
			this.$el.find('#destinationloaderfee').val(this.addCommaToNumber(this.model.get('destinationloaderfee')));
			
			this.$el.find('#truckerAccountType_id').val(trucker.accountidandname.accounttype[0].name);
			this.$el.find('#truckerAccount_id').val(trucker.accountidandname.name);
			this.$el.find('#trucker_id').val(trucker.lastname+', '+trucker.firstname+' '+trucker.suffix);
			
			this.$el.find('#trailer').val(trailer.account.name);
			this.$el.find('#trailer_id').val(trailer.number);
			
			var totalQuantity = 0;
			_.each(products, function (product) {
				var quantity = parseFloat(product.quantity);
				totalQuantity += quantity;
				
				var variables = {
					stock_number: product.productorder.stacknumber,
					product_name: product.productorder.product.name,
					quantity: thisObj.addCommaToNumber(quantity.toFixed(4)),
				};
				
				var template = _.template(purchaseOrderPickUpScheduleProductItemTemplate, variables);
				thisObj.$el.find('#product-list tbody').append(template);
			});
			
			this.$el.find('#total-quantity').val(this.addCommaToNumber(totalQuantity.toFixed(4)));
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-schedule': 'showConfirmationWindow',
			'click #confirm-delete-schedule': 'deleteAccount',
		},
		
		deleteAccount: function (){
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},
	});

	return PickUpScheduleView;
});