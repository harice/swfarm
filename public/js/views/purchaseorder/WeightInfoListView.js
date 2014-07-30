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
			weightInfoListTemplate,
			weightInfoInnerListTemplate,
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
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new PurchaseOrderModel({id:this.poId});
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
			Backbone.View.prototype.refreshTitle('Weight Ticket','list');
		},
		
		displaySchedule: function () {
			var innerTemplateVar = {};
			
			var innerTemplate = _.template(weightInfoListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'PO # '+this.model.get('order_number')+' Weight Information',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
		},
		
		displayList: function () {
			var data = {
				weightInfo_url: '/#/'+Const.URL.POWEIGHTINFO+'/'+this.poId,
				po_schedule_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
				weightInfo: this.collection.models,
				_: _ 
			};
			
			if(this.model.get('status').name.toLowerCase() == Const.STATUS.OPEN)
				data['editable'] = true;
			
			_.extend(data,Backbone.View.prototype.helpers);

			var innerListTemplate = _.template(weightInfoInnerListTemplate, data);
			this.subContainer.find("#po-weight-info-list tbody").html(innerListTemplate);
			if(this.subContainer.find("#po-weight-info-list tbody").find('tr').length == 0)
				this.subContainer.find("#po-weight-info-list tbody").html('<tr><td colspan="6">No result found.</td></tr>');
			
			this.generatePagination();
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

  return WeightInfoListView;
  
});