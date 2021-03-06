define([
	'backbone',
	'views/base/AccordionListView',
	'collections/salesorder/SalesOrderCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/salesorder/SOStatusCollection',
	'collections/salesorder/CancellingReasonCollection',
	'collections/purchaseorder/OrderWeightDetailsByStackCollection',
	'models/salesorder/SalesOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderListTemplate.html',
	'text!templates/salesorder/salesOrderInnerListTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderStatusTemplate.html',
	'text!templates/purchaseorder/reasonForCancellationOptionTemplate.html',
	'text!templates/purchaseorder/orderWeightDetailsByStackItemTemplate.html',
	'constant',
], function(Backbone,
			AccordionListView,
			SalesOrderCollection,
			OriginCollection,
			NatureOfSaleCollection,
			SOStatusCollection,
			CancellingReasonCollection,
			OrderWeightDetailsByStackCollection,
			SalesOrderModel,
			contentTemplate,
			salesOrderListTemplate,
			salesOrderInnerListTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			salesOrderStatusTemplate,
			reasonForCancellationOptionTemplate,
			orderWeightDetailsByStackItemTemplate,
			Const
){

	var SalesOrderListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new SalesOrderCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			/*this.originCollection = new OriginCollection();
			this.originCollection.on('sync', function() {	
				thisObj.natureOfSaleCollection.getModels();
				this.off('sync');
			});
			this.originCollection.on('error', function(collection, response, options) {
				this.off('error');
			});*/
			
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
					thisObj.resetSearchFilters();	
					thisObj.renderList(thisObj.collection.listView.currentPage);
				}
				this.off('sync');
			});
			this.soStatusCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.cancellingReasonCollection = new CancellingReasonCollection();
			this.cancellingReasonCollection.on('sync', function() {	
				//thisObj.originCollection.getModels();
				thisObj.natureOfSaleCollection.getModels();
				this.off('sync');
			});
			
			this.cancellingReasonCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.cancellingReasonCollection.getModels();
			Backbone.View.prototype.refreshTitle('Sales Order','list');
		},
		
		displaySO: function () {
			var statusTemplate = _.template(salesOrderStatusTemplate, {'statuses': this.soStatusCollection.models});
			//var originTemplate = _.template(salesOrderOriginTemplate, {'origins': this.originCollection.models});
			var nosTemplate = _.template(salesOrderNatureOfSaleTemplate, {'natureOfSales': this.natureOfSaleCollection.models});
			var innerTemplateVar = {
				'so_add_url' : '#/'+Const.URL.SO+'/'+Const.CRUD.ADD,
				//'origin_filters' : originTemplate.replace(/<label class="radio-inline">/g, '<li>').replace(/<\/label>/g, '</li>'),
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
			this.initCancelWindow();
			//this.setListOptions();
		},
		
		displayList: function () {
			
			var data = {
				so_url: '#/'+Const.URL.SO,
				so_edit_url: '#/'+Const.URL.SO+'/'+Const.CRUD.EDIT,
				so_sched_url: '#/'+Const.URL.DELIVERYSCHEDULE,
				account_url: '#/'+Const.URL.ACCOUNT,
				sos: this.collection.models,
				schedule_url: '#/'+Const.URL.DELIVERYSCHEDULE,
				add: Const.CRUD.ADD,
				collapsible_id: Const.SO.COLLAPSIBLE.ID,
				so_status_open: Const.STATUSID.OPEN,
				_: _ 
			};
			
			_.extend(data,Backbone.View.prototype.helpers);
			
			var innerListTemplate = _.template(salesOrderInnerListTemplate, data);
			this.subContainer.find("#so-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();
		},

		resetSearchFilters: function(){
			var options = this.collection.listView;				

			if(options.search != '')
				this.collection.setSearch('');
			
			if(options.filter != ' ')
				this.collection.setFilter('filter', '');	

			if(options.filters.status != '')
				this.collection.setFilter('status', '');

			if(options.filters.location != '')
				this.collection.setFilter('location', '');

			if(options.date != '')
				this.collection.setDate('');
			
			if(options.filters.transportstart != '')
				this.collection.setFilter('transportstart', '');

			if(options.filters.transportend != '')
				this.collection.setFilter('transportend', '');

		},
		
		initCalendars: function () {
			var thisObj = this;
			
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

			this.$el.find('#filter-export-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
				forceParse:false,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-export-start .input-group.date input').val();
				//thisObj.$el.find('#filter-export-end .input-group.date').datepicker('setStartDate', selectedDate);		

				thisObj.$el.find('#filter-export-end .input-group.date').datepicker('setDate', selectedDate)
			});
			
			this.$el.find('#filter-export-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
				forceParse:false,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-export-end .input-group.date input').val();
				thisObj.$el.find('#filter-export-start .input-group.date').datepicker('setEndDate', selectedDate);
				
			});
		},
		
		initCancelWindow: function (){
			var thisObj = this;
			var options = '';
			_.each(this.cancellingReasonCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('reason')+'</option>';
			});
			var form = _.template(reasonForCancellationOptionTemplate, {'reasons': options});
			
			this.initConfirmationWindowWithForm('Are you sure you want to cancel this SO?',
										'confirm-cancel-so',
										'Yes',
										form,
										'Cancel Sales Order');
										
			var validate = $('#cancellationReasonForm').validate({
				submitHandler: function(form) {
					
					var data = $(form).serializeObject();
					
					var salesOrderModel = new SalesOrderModel(data);
						
					salesOrderModel.setCancelURL();		
					salesOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								thisObj.renderList(1);
								thisObj.hideConfirmationWindow('modal-with-form-confirm');
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
				},
				rules: {
					others: {
						require_reason_others: true,
					},
				},
			});
		},
		
		events: {
			'click .sort-date-of-so' : 'sortSODate',
			'change .location_id' : 'filterByOrigin',
			'change .natureofsale_id' : 'filterByNatureOfSale',
			'change .statusFilter' : 'filterByStatus',
			'click .cancel-so': 'preShowConfirmationWindow',
			'click #confirm-cancel-so': 'cancelSO',
			'change #reason': 'onChangeReason',
			'click #order-accordion tr.collapse-trigger': 'toggleAccordion',
			'click .stop-propagation': 'linkStopPropagation',
			'click .close-so': 'showCloseConfirmationWindow',
			'click #confirm-close-order': 'closeOrder',
			'change #exportdatestart': 'exportSO',
			'change #exportdateend': 'exportSO'
		},
		
		onChangeReason: function (ev) {
			var field = $(ev.target);
			
			if(field.val() == Const.CANCELLATIONREASON.OTHERS)
				$('#cancellation-others-text').show();
			else
				$('#cancellation-others-text').hide();
		},
		
		sortSODate: function () {
			this.sortByField('created_at');
		},
		
		filterByOrigin: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('location', filter);
			this.renderList(1);
			return false;
		},
		
		filterByNatureOfSale: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('natureofsale', filter);
			this.renderList(1);
			return false;
		},
		
		filterByStatus: function (ev) {
			var filter = $(ev.target).val(); //console.log(filter);
			this.collection.setFilter('status', filter);
			this.renderList(1);
			return false;
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#cancellationReasonForm #cancelled-order-id').val($(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow('modal-with-form-confirm');
			$('#modal-with-form-confirm').on('shown.bs.modal', function (e) {
				$("#reason").focus();
			});
			
			return false;
		},
		
		cancelSO: function (ev) {
			$('#cancellationReasonForm').submit();
			return false;
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			
			this.toggleAccordionAndRequestACollection(ev.currentTarget,
				Const.SO.COLLAPSIBLE.ID,
				OrderWeightDetailsByStackCollection,
				function (collection, id) {
					var collapsibleId = Const.SO.COLLAPSIBLE.ID+id;
					$('#'+collapsibleId).find('.order-weight-details-by-stack').html(thisObj.generateOrderWeightDetailsByStack(collection.models, id));
				}
			);
			
			return false;
		},
		
		generateOrderWeightDetailsByStack: function (models, soId) {			

			var data = {
				stacks: models,
				schedule_url: '/#/'+Const.URL.DELIVERYSCHEDULE+'/'+soId,
				weight_info_url: '/#/'+Const.URL.SOWEIGHTINFO+'/'+soId,
				location: '',				
				_: _ 
			};
			
			_.extend(data,Backbone.View.prototype.helpers);

			return _.template(orderWeightDetailsByStackItemTemplate, data);
		},
		
		showCloseConfirmationWindow: function (ev) {
			var id = $(ev.currentTarget).attr('data-id');
			this.initConfirmationWindow('Are you sure you want to close this sales order?',
										'confirm-close-order',
										'Close Sales Order',
										'Close Sales Order',
										false);
			this.showConfirmationWindow();
			this.$el.find('#modal-confirm #confirm-close-order').attr('data-id', id);
			return false;
		},
		
		closeOrder: function (ev) {
			var thisObj = this;
			var id = $(ev.currentTarget).attr('data-id');
			
			var salesOrderModel = new SalesOrderModel({id:id});
			salesOrderModel.setCloseURL();
			salesOrderModel.save(
				null,
				{
					success: function (model, response, options) {
						thisObj.hideConfirmationWindow('modal-confirm', function () {
							thisObj.subContainer.find('#'+Const.SO.COLLAPSIBLE.ID+id+' .editable-button').remove();
							thisObj.subContainer.find('.collapse-trigger[data-id="'+id+'"] .td-status').html('<label class="label label-default">Closed</label>');
						});
						thisObj.displayMessage(response);
					},
					error: function (model, response, options) {
						thisObj.hideConfirmationWindow();
						if(typeof response.responseJSON.error == 'undefined')
							alert(response.responseJSON);
						else
							thisObj.displayMessage(response);
					},
					headers: salesOrderModel.getAuth(),
				}
			);
			
			return false;
		},

		exportSO: function() {
			var dataModel = "sales-order";
			var export_csv_url = Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({type:'excel', format:'csv', model: dataModel, dateStart: $("#exportdatestart").val(), dateEnd: $("#exportdateend").val()}));						

			$("#export-so").attr('href', export_csv_url).removeAttr('disabled');
		}
	});

  return SalesOrderListView;
  
});