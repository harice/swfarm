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
				_.each(this.models, function (model) {
					var transportScheduleDate = model.get('transportScheduleDate').split(' ');
					model.set('transportScheduleDate', thisObj.convertDateFormat(transportScheduleDate[0], thisObj.dateFormatDB, thisObj.dateFormat, '-')+' '+transportScheduleDate[1]);
					model.set('gross', thisObj.addCommaToNumber(parseFloat(model.get('gross')).toFixed(4)));
					model.set('tare', thisObj.addCommaToNumber(parseFloat(model.get('tare')).toFixed(4)));
					model.set('netWeight', thisObj.addCommaToNumber(parseFloat(model.get('netWeight')).toFixed(4)));
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
			Backbone.View.prototype.refreshTitle('Weight Information','list');
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
				weightInfo: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(weightInfoInnerListTemplate, data);
			this.subContainer.find("#po-weight-info-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

  return WeightInfoListView;
  
});