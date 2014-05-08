define([
	'backbone',
	'views/base/ListView',
	'models/purchaseorder/PurchaseOrderModel',
	'collections/purchaseorder/POScheduleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderPickUpScheduleListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderPickUpScheduleInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			PurchaseOrderModel,
			POScheduleCollection,
			contentTemplate,
			purchaseOrderPickUpScheduleListTemplate,
			purchaseOrderPickUpScheduleInnerListTemplate,
			Const
){

	var PickUpScheduleList = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.extendListEvents();
			
			this.poid = option.id;
			var thisObj = this;
			
			/*this.collection = new POScheduleCollection({id:option.id});
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});*/
			
			this.model = new PurchaseOrderModel({id:option.id});
			this.model.on('change', function() {
				thisObj.displayPickUpSchedule();
				//thisObj.renderList(1);
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayPickUpSchedule: function () {
			var innerTemplateVar = {
				po_schedule_add_url : '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poid+'/'+Const.CRUD.ADD,
				status_filters : '',
			};
			
			var innerTemplate = _.template(purchaseOrderPickUpScheduleListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'PO # '+this.model.get('ponumber')+' Pick Up Schedule',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initCalendars();
		},
		
		displayList: function () {
			
			var data = {
				po_schedule_edit_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poid+'/'+Const.CRUD.EDIT,
				po_schedule_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poid,
				schedules: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderPickUpScheduleInnerListTemplate, data);
			$("#po-schedule-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		initCalendars: function () {
			var thisObj = this;
			
			this.$el.find('#filter-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				//thisObj.collection.setDate($('#filter-date-of-purchase .input-group.date input').val());
				//thisObj.renderList(1);
			});
		},
		
		events: {
		},
	});

  return PickUpScheduleList;
  
});