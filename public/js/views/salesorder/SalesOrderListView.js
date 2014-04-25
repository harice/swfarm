define([
	'backbone',
	'views/base/ListView',
	'collections/salesorder/SalesOrderCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderListTemplate.html',
	'text!templates/salesorder/salesOrderInnerListTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			SalesOrderCollection,
			OriginCollection,
			NatureOfSaleCollection,
			contentTemplate,
			salesOrderListTemplate,
			salesOrderInnerListTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			Const
){

	var SalesOrderListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			var thisObj = this;
			
			this.collection = new SalesOrderCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.originCollection = new OriginCollection();
			this.originCollection.on('sync', function() {	
				thisObj.natureOfSaleCollection.getModels();
				this.off('sync');
			});
			this.originCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.natureOfSaleCollection = new NatureOfSaleCollection();
			this.natureOfSaleCollection.on('sync', function() {
				thisObj.displaySO();
				thisObj.renderList(1);
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.originCollection.getModels();
		},
		
		displaySO: function () {
			var originTemplate = _.template(salesOrderOriginTemplate, {'origins': this.originCollection.models});
			var nosTemplate = _.template(salesOrderNatureOfSaleTemplate, {'natureOfSales': this.natureOfSaleCollection.models});
			var innerTemplateVar = {
				'so_add_url' : '#/'+Const.URL.SO+'/'+Const.CRUD.ADD,
				'origin_filters' : originTemplate.replace(/<label class="radio-inline">/g, '<li>').replace(/<\/label>/g, '</li>'),
				'nos_filters' : nosTemplate.replace(/<label class="radio-inline">/g, '<li>').replace(/<\/label>/g, '</li>'),
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
			
			var data = {
				so_url: '#/'+Const.URL.SO,
				so_edit_url: '#/'+Const.URL.SO+'/'+Const.CRUD.EDIT,
				so_sched_url: '',
				sos: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(salesOrderInnerListTemplate, data);
			$("#so-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		initCalendars: function () {
			var thisObj = this;
			
			this.$el.find('#filter-date-of-sale .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				//thisObj.collection.setDate($('#filter-date-of-purchase .input-group.date input').val());
				//thisObj.renderList(1);
			});
			
			this.$el.find('#filter-delivery-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				//thisObj.collection.setFilter('pickupstart', $('#filter-pickup-start .input-group.date input').val());
				//thisObj.renderList(1);
			});
			
			this.$el.find('#filter-delivery-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				//thisObj.collection.setFilter('pickupend', $('#filter-pickup-end .input-group.date input').val());
				//thisObj.renderList(1);
			});
		},
	});

  return SalesOrderListView;
  
});