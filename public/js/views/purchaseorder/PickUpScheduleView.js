define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'models/purchaseorder/PurchaseOrderModel',
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
			PurchaseOrderModel,
			OrderScheduleVariablesModel,
			POScheduleModel,
			ProductCollection,
			AccountCollection,
			AccountTypeCollection,
			ContactCollection,
			TrailerCollection,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			purchaseOrderViewScheduleTemplate,
			purchaseOrderViewScheduleProductItemTemplate,
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
			this.h1Title = 'Pickup Schedule';
			this.h1Small = 'view';
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 2)}));
			
			this.purchaseOrderModel = new PurchaseOrderModel({id:this.poId});
			this.purchaseOrderModel.on('change', function() {
				thisObj.model.runFetch();
				thisObj.off('change');
			});
			
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
			this.purchaseOrderModel.runFetch();
			Backbone.View.prototype.refreshTitle('Pickup Schedule','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'schedule_edit_url': '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId+'/'+Const.CRUD.EDIT+'/'+this.schedId,
				'weight_info_url': '#/'+Const.URL.POWEIGHTINFO+'/'+this.poId+'/'+this.schedId,
				po : this.purchaseOrderModel,
				pu : this.model
			};

			if(this.model.get('status').name.toLowerCase() != Const.STATUS.CLOSED && this.purchaseOrderModel.get('status').name.toLowerCase() == Const.STATUS.OPEN)
				innerTemplateVariables['editable'] = true;

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			
			var innerTemplate = _.template(purchaseOrderViewScheduleTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
		},
		
		supplyScheduleData: function () {
			var thisObj = this;
			var products = this.model.get('transportscheduleproduct');
			
			var totalQuantity = 0;
			_.each(products, function (product) {
				var quantity = parseFloat(product.quantity);
				totalQuantity += quantity;
				
				var variables = {
					stock_number: product.productorder.stacknumber,
					product_name: product.productorder.product.name,
					location_to: product.sectionto.storagelocation.name+' - '+product.sectionto.name,
					quantity: Backbone.View.prototype.helpers.numberFormatTons(quantity)
				};
				
				var template = _.template(purchaseOrderViewScheduleProductItemTemplate, variables);
				thisObj.$el.find('#product-list tbody').append(template);
			});
			
			this.$el.find('#total-quantity').html(Backbone.View.prototype.helpers.numberFormatTons(totalQuantity));
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-schedule': 'showDeleteConfirmationWindow',
			'click #confirm-delete-schedule': 'deleteAccount',
			'click #close-schedule': 'showCloseScheduleConfirmationWindow',
			'click #confirm-close-schedule': 'closeSchedule',
		},
		
		showDeleteConfirmationWindow: function () {
			this.initConfirmationWindow('Are you sure you want to delete this schedule?',
										'confirm-delete-schedule',
										'Delete Schedule',
										'Delete Schedule',
										false);
			this.showConfirmationWindow();
			
			return false;
		},
		
		deleteAccount: function (){
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
					thisObj.hideConfirmationWindow('modal-confirm', function () { Backbone.history.history.back(); });
					thisObj.displayMessage(response);
                },
                error: function (model, response, options) {
                    thisObj.hideConfirmationWindow();
					thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},
		
		showCloseScheduleConfirmationWindow: function () {
			this.initConfirmationWindow('Are you sure you want to close this schedule?',
										'confirm-close-schedule',
										'Close Schedule',
										'Close Schedule',
										false);
			this.showConfirmationWindow();
			
			return false;
		},
		
		closeSchedule: function (ev) {
			var thisObj = this;
			
			var scheduleModel = new POScheduleModel({id:this.schedId});
			scheduleModel.setCloseURL();
			scheduleModel.save(
				null,
				{
					success: function (model, response, options) {
						thisObj.hideConfirmationWindow('modal-confirm', function () {
							thisObj.subContainer.find('.editable-button').remove();
						});
						thisObj.displayMessage(response);
					},
					error: function (model, response, options) {
						thisObj.hideConfirmationWindow();
						if(typeof response.responseJSON.error == 'undefined')
							alert(response.responseJSON);
						else
							thisObj.displayMessage(response);
					},
					headers: scheduleModel.getAuth(),
				}
			);
			
			return false;
		},
	});

	return PickUpScheduleView;
});