define([
	'backbone',
	'views/base/ListView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderListTemplate.html',
	'text!templates/salesorder/salesOrderInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			contentTemplate,
			salesOrderListTemplate,
			salesOrderInnerListTemplate,
			Const
){

	var SalesOrderListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			var thisObj = this;
		},
		
		render: function(){
			this.displaySO();
		},
		
		displaySO: function () {
			//var destinationTemplate = _.template(bidDestinationTemplate, {'destinations': this.bidDestinationCollection.models});
			var innerTemplateVar = {
				'so_add_url' : '#/'+Const.URL.SO+'/'+Const.CRUD.ADD,
				'destination_filters' : '',
			};
			var innerTemplate = _.template(salesOrderListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Sales Order',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initCalendars();
		},
		
		displayList: function () {
			
			/*var data = {
				po_url: '#/'+Const.URL.PO,
				po_edit_url: '#/'+Const.URL.PO+'/'+Const.CRUD.EDIT,
				po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE,
				pos: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(salesOrderInnerListTemplate, data);
			$("#po-list tbody").html(innerListTemplate);
			
			this.generatePagination();*/
		},
		
		initCalendars: function () {
			/*var thisObj = this;
			
			this.$el.find('#filter-date-of-purchase .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				thisObj.collection.setDate($('#filter-date-of-purchase .input-group.date input').val());
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-pickup-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				thisObj.collection.setFilter('pickupstart', $('#filter-pickup-start .input-group.date input').val());
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-pickup-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				thisObj.collection.setFilter('pickupend', $('#filter-pickup-end .input-group.date input').val());
				thisObj.renderList(1);
			});*/
		},
	});

  return SalesOrderListView;
  
});