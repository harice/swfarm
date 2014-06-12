define([
	'backbone',
	'views/base/ListView',
	'models/salesorder/SalesOrderModel',
	'models/salesorder/SOScheduleModel',
	'collections/salesorder/SOScheduleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/deliveryScheduleListTemplate.html',
	'text!templates/salesorder/deliveryScheduleInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			SalesOrderModel,
			SOScheduleModel,
			SOScheduleCollection,
			contentTemplate,
			deliveryScheduleListTemplate,
			deliveryScheduleInnerListTemplate,
			Const
){

	var DeliveryScheduleList = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.extendListEvents();
			this.initSubContainer();
			
			this.soId = option.id;
			var thisObj = this;
			
			this.collection = new SOScheduleCollection({id:option.id});
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
			
			this.model = new SalesOrderModel({id:option.id});
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
			Backbone.View.prototype.refreshTitle('Delivery Schedule','list');
		},
		
		displaySchedule: function () {
			var innerTemplateVar = {
				so_schedule_add_url : '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId+'/'+Const.CRUD.ADD,
				status_filters : '',
			};
			
			var innerTemplate = _.template(deliveryScheduleListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'SO # '+this.model.get('order_number')+' Delivery Schedule',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this schedule?',
										'confirm-delete-schedule',
										'Delete Schedule');
		},
		
		displayList: function () {
			
			var data = {
				so_schedule_edit_url: '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId+'/'+Const.CRUD.EDIT,
				so_schedule_url: '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId,
				so_weight_info_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+this.soId,
				schedules: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(deliveryScheduleInnerListTemplate, data);
			this.subContainer.find("#so-schedule-list tbody").html(innerListTemplate);
			
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
			var soScheduleModel = new SOScheduleModel({id:$(ev.currentTarget).attr('data-id')});
			
			soScheduleModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: soScheduleModel.getAuth(),
            });
			
			return false;
		},
	});

  return DeliveryScheduleList;
  
});