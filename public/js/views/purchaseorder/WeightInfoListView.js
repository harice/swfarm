define([
	'backbone',
	'views/base/ListView',
	'models/purchaseorder/PurchaseOrderModel',
	'models/purchaseorder/POWeightInfoModel',
	'collections/purchaseorder/POWeightInfoCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/purchaseorder/weightInfoListTemplate.html',
	'text!templates/purchaseorder/weightInfoInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			PurchaseOrderModel,
			POWeightInfoModel,
			POWeightInfoCollection,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			purchaseOrderPickUpScheduleListTemplate,
			purchaseOrderPickUpScheduleInnerListTemplate,
			Const
){

	var WeightInfoListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 3)}));
			
			this.collection = new POWeightInfoCollection({id:this.poId});
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
					//thisObj.renderList(1);
				}
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Information','list');
		},
		
		displaySchedule: function () {
			var innerTemplateVar = {
				po_schedule_add_url : '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId+'/'+Const.CRUD.ADD,
				po_list_url: '#/'+Const.URL.PO,
				status_filters : '',
			};
			
			var innerTemplate = _.template(purchaseOrderPickUpScheduleListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'PO # '+this.model.get('order_number')+' Weight Information',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
		},
		
		displayList: function () {
			/*
			var data = {
				po_schedule_edit_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId+'/'+Const.CRUD.EDIT,
				po_schedule_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
				schedules: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderPickUpScheduleInnerListTemplate, data);
			this.subContainer.find("#po-weight-info-list tbody").html(innerListTemplate);
			
			this.generatePagination();*/
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

  return WeightInfoListView;
  
});