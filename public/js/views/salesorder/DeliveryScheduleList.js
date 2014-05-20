define([
	'backbone',
	'views/base/ListView',
	'models/salesorder/SalesOrderModel',
	'collections/salesorder/SOScheduleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/deliveryScheduleListTemplate.html',
	'text!templates/salesorder/deliveryScheduleInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			SalesOrderModel,
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
			
			this.soId = option.id;
			var thisObj = this;
			
			this.collection = new SOScheduleCollection({id:option.id});
			this.collection.on('sync', function() {
				_.each(this.models, function (model) {
					model.set('scheduledate', thisObj.convertDateFormat(model.get('scheduledate').split(' ')[0], thisObj.dateFormatDB, thisObj.dateFormat, '-'));
				});
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new SalesOrderModel({id:option.id});
			this.model.on('change', function() {
				thisObj.displayPickUpSchedule();
				thisObj.renderList(1);
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayPickUpSchedule: function () {
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
			this.$el.html(compiledTemplate);
		},
		
		displayList: function () {
			
			var data = {
				so_schedule_edit_url: '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId+'/'+Const.CRUD.EDIT,
				so_schedule_url: '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId,
				schedules: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(deliveryScheduleInnerListTemplate, data);
			$("#so-schedule-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

  return DeliveryScheduleList;
  
});