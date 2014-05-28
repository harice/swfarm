define([
	'backbone',
	'views/base/ListView',
	'collections/salesorder/SalesOrderCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/salesorder/SOStatusCollection',
	'models/salesorder/SalesOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderListTemplate.html',
	'text!templates/salesorder/salesOrderInnerListTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderStatusTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			SalesOrderCollection,
			OriginCollection,
			NatureOfSaleCollection,
			SOStatusCollection,
			SalesOrderModel,
			contentTemplate,
			salesOrderListTemplate,
			salesOrderInnerListTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			salesOrderStatusTemplate,
			Const
){

	var SalesOrderListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new SalesOrderCollection();
			this.collection.on('sync', function() {
				_.each(this.models, function (model) {
					model.set('created_at', thisObj.convertDateFormat(model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					
					if(model.get('transportdatestart'))
						model.set('transportdatestart', thisObj.convertDateFormat(model.get('transportdatestart').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					if(model.get('transportdateend'))
						model.set('transportdateend', thisObj.convertDateFormat(model.get('transportdateend').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					console.log(model.get('totalPrice'));
					if(model.get('totalPrice'))
						model.set('totalPrice', thisObj.addCommaToNumber(parseFloat(model.get('totalPrice')).toFixed(2)));
					console.log(model.get('totalPrice'));
				});
				
				if(thisObj.subContainerExist())
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
				thisObj.soStatusCollection.getModels();
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.soStatusCollection = new SOStatusCollection();
			this.soStatusCollection.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displaySO();
					thisObj.renderList(1);
				}
				this.off('sync');
			});
			this.soStatusCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.originCollection.getModels();
		},
		
		displaySO: function () {
			var statusTemplate = _.template(salesOrderStatusTemplate, {'statuses': this.soStatusCollection.models});
			var originTemplate = _.template(salesOrderOriginTemplate, {'origins': this.originCollection.models});
			var nosTemplate = _.template(salesOrderNatureOfSaleTemplate, {'natureOfSales': this.natureOfSaleCollection.models});
			var innerTemplateVar = {
				'so_add_url' : '#/'+Const.URL.SO+'/'+Const.CRUD.ADD,
				'origin_filters' : originTemplate.replace(/<label class="radio-inline">/g, '<li>').replace(/<\/label>/g, '</li>'),
				'nos_filters' : nosTemplate.replace(/<label class="radio-inline">/g, '<li>').replace(/<\/label>/g, '</li>'),
				'status_filters': statusTemplate,
			};
			var innerTemplate = _.template(salesOrderListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Sales Order',
				h1_small: 'list',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initCalendars();
			
			this.initConfirmationWindow('Are you sure you want to cancel this SO?',
										'confirm-cancel-so',
										'Cancel Sales Order');
		},
		
		displayList: function () {
			
			var data = {
				so_url: '#/'+Const.URL.SO,
				so_edit_url: '#/'+Const.URL.SO+'/'+Const.CRUD.EDIT,
				so_sched_url: '#/'+Const.URL.DELIVERYSCHEDULE,
				sos: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(salesOrderInnerListTemplate, data);
			this.subContainer.find("#so-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		initCalendars: function () {
			var thisObj = this;console.log('initCalendars');
			
			this.$el.find('#filter-date-of-sale .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-date-of-sale .input-group.date input').val();
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				thisObj.collection.setDate(date);
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-delivery-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-delivery-start .input-group.date input').val();
				thisObj.$el.find('#filter-delivery-end .input-group.date').datepicker('setStartDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				thisObj.collection.setFilter('transportstart', date);
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-delivery-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-delivery-end .input-group.date input').val();
				thisObj.$el.find('#filter-delivery-start .input-group.date').datepicker('setEndDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				thisObj.collection.setFilter('transportend', date);
				thisObj.renderList(1);
			});
		},
		
		events: {
			'click .sort-date-of-so' : 'sortSODate',
			'change .location_id' : 'filterByOrigin',
			'change .natureofsale_id' : 'filterByNatureOfSale',
			'change .statusFilter' : 'filterByStatus',
			'click .cancel-so': 'preShowConfirmationWindow',
			'click #confirm-cancel-so': 'cancelSO',
		},
		
		sortSODate: function () {
			this.sortByField('created_at');
		},
		
		filterByOrigin: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('location', filter)
			this.renderList(1);
			return false;
		},
		
		filterByNatureOfSale: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('natureofsale', filter)
			this.renderList(1);
			return false;
		},
		
		filterByStatus: function (ev) {
			var filter = $(ev.target).val(); console.log(filter);
			this.collection.setFilter('status', filter)
			this.renderList(1);
			return false;
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-cancel-so').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		cancelSO: function (ev) {
			var thisObj = this;
			var salesOrderModel = new SalesOrderModel({id:$(ev.currentTarget).attr('data-id')});
				
			salesOrderModel.setCancelURL();		
			salesOrderModel.save(
				null, 
				{
					success: function (model, response, options) {
						thisObj.displayMessage(response);
						thisObj.renderList(thisObj.collection.getCurrentPage());
					},
					error: function (model, response, options) {
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							thisObj.displayMessage(response);
					},
					headers: salesOrderModel.getAuth(),
				}
			);
			
			return false;
		},
	});

  return SalesOrderListView;
  
});