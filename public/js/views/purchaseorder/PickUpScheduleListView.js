define([
	'backbone',
	'views/base/ListView',
	'models/purchaseorder/PurchaseOrderModel',
	'models/purchaseorder/POScheduleModel',
	'collections/purchaseorder/POScheduleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/purchaseorder/purchaseOrderPickUpScheduleListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderPickUpScheduleInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			PurchaseOrderModel,
			POScheduleModel,
			POScheduleCollection,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			purchaseOrderPickUpScheduleListTemplate,
			purchaseOrderPickUpScheduleInnerListTemplate,
			Const
){

	var PickUpScheduleList = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.extendListEvents();
			this.initSubContainer();
			
			this.poId = option.id;
			var thisObj = this;
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 2)}));
			
			this.collection = new POScheduleCollection({id:option.id});
			this.collection.on('sync', function() {
				_.each(this.models, function (model) {
					model.set('scheduledate', thisObj.convertDateFormat(model.get('scheduledate').split(' ')[0], thisObj.dateFormatDB, thisObj.dateFormat, '-'));
					model.set('distance', thisObj.addCommaToNumber(parseFloat(model.get('distance')).toFixed(2)));
				});
				
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new PurchaseOrderModel({id:option.id});
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displaySchedule();
					thisObj.renderList(1);
				}
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Pickup Schedule','list');
		},
		
		displaySchedule: function () {
			var innerTemplateVar = {
				po_schedule_add_url : '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId+'/'+Const.CRUD.ADD,
				po_list_url: '#/'+Const.URL.PO,
				status_filters : '',
			};
			
			var innerTemplate = _.template(purchaseOrderPickUpScheduleListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'PO # '+this.model.get('order_number')+' Pick Up Schedule',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this schedule?',
										'confirm-delete-schedule',
										'Delete Schedule');
		},
		
		displayList: function () {
			
			var data = {
				po_schedule_edit_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId+'/'+Const.CRUD.EDIT,
				po_schedule_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
				po_weight_info_url: '#/'+Const.URL.POWEIGHTINFO+'/'+this.poId,
				schedules: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderPickUpScheduleInnerListTemplate, data);
			this.subContainer.find("#po-schedule-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click .delete-schedule': 'preShowConfirmationWindow',
			'click #confirm-delete-schedule': 'deleteSchedule',
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-schedule').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteSchedule: function (ev) {
			var thisObj = this;
			var poScheduleModel = new POScheduleModel({id:$(ev.currentTarget).attr('data-id')});
			
			poScheduleModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: poScheduleModel.getAuth(),
            });
			
			return false;
		},
	});

  return PickUpScheduleList;
  
});