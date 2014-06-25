define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/ListView',
	'collections/purchaseorder/PurchaseOrderCollection',
	'collections/purchaseorder/DestinationCollection',
	'collections/purchaseorder/POStatusCollection',
	'collections/purchaseorder/CancellingReasonCollection',
	'collections/purchaseorder/OrderWeightDetailsByStackCollection',
	'models/purchaseorder/PurchaseOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderInnerListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'text!templates/purchaseorder/purchaseOrderStatusTemplate.html',
	'text!templates/purchaseorder/reasonForCancellationOptionTemplate.html',
	'text!templates/purchaseorder/orderWeightDetailsByStackItemTemplate.html',
	'constant',
], function(Backbone,
			DatePicker,
			ListView,
			PurchaseOrderCollection,
			DestinationCollection,
			POStatusCollection,
			CancellingReasonCollection,
			OrderWeightDetailsByStackCollection,
			PurchaseOrderModel,
			contentTemplate,
			purchaseOrderListTemplate,
			purchaseOrderInnerListTemplate,
			purchaseOrderDestinationTemplate,
			purchaseOrderStatusTemplate,
			reasonForCancellationOptionTemplate,
			orderWeightDetailsByStackItemTemplate,
			Const
){

	var PurchaseOrderListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new PurchaseOrderCollection();
			this.collection.on('sync', function() {
				_.each(this.models, function (model) {
					model.set('created_at', thisObj.convertDateFormat(model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					
					if(model.get('transportdatestart'))
						model.set('transportdatestart', thisObj.convertDateFormat(model.get('transportdatestart').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					if(model.get('transportdateend'))
						model.set('transportdateend', thisObj.convertDateFormat(model.get('transportdateend').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					if(model.get('totalPrice'))
						model.set('totalPrice', thisObj.addCommaToNumber(parseFloat(model.get('totalPrice')).toFixed(2)));
				});
				
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.destinationCollection = new DestinationCollection();
			this.destinationCollection.on('sync', function() {	
				thisObj.poStatusCollection.getModels();
				this.off('sync');
			});
			
			this.destinationCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.poStatusCollection = new POStatusCollection();
			this.poStatusCollection.on('sync', function() {	
				if(thisObj.subContainerExist()) {
					thisObj.displayPO();
					thisObj.renderList(1);
				}
				
				this.off('sync');
			});
			
			this.poStatusCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.cancellingReasonCollection = new CancellingReasonCollection();
			this.cancellingReasonCollection.on('sync', function() {	
				thisObj.destinationCollection.getModels();
				this.off('sync');
			});
			
			this.cancellingReasonCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.destinationCollection.getModels();
			this.cancellingReasonCollection.getModels();
			Backbone.View.prototype.refreshTitle('Purchase Order','list');
		},
		
		displayPO: function () {
			var statusTemplate = _.template(purchaseOrderStatusTemplate, {'statuses': this.poStatusCollection.models});
			var destinationTemplate = _.template(purchaseOrderDestinationTemplate, {'destinations': this.destinationCollection.models});
			var innerTemplateVar = {
				'bid_add_url' : '#/'+Const.URL.BID+'/'+Const.CRUD.ADD,
				'po_add_url' : '#/'+Const.URL.PO+'/'+Const.CRUD.ADD,
				'destination_filters' : destinationTemplate.replace(/<label class="radio-inline">/g, '<li>').replace(/<\/label>/g, '</li>'),
				'status_filters' : statusTemplate,
			};
			var innerTemplate = _.template(purchaseOrderListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Purchase Order',
				h1_small: 'list',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initCalendars();
			this.initCancelWindow();
		},
		
		displayList: function () {
			
			var data = {
				po_url: '#/'+Const.URL.PO,
				po_edit_url: '#/'+Const.URL.PO+'/'+Const.CRUD.EDIT,
				po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE,
				pos: this.collection.models,
				collapsible_id: Const.PO.COLLAPSIBLE.ID,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderInnerListTemplate, data);
			this.subContainer.find("#po-list tbody").html(innerListTemplate);
			
			if(this.collection.models.length > 0)
				this.addCollapsible(this.collection.models);
			
			this.generatePagination();
		},
		
		addCollapsible: function (models) {
			/*_.each(models, function (model) {
				console.log('#collapsible-'+model.get('id'));
				$('#collapsible-'+model.get('id')).collapse();
				$('#collapsible-'+model.get('id')).on('show.bs.collapse', function () {
					$(this).closest('tbody').find('.order-collapsible-item.collapse.in').collapse('toggle');
				});
				$('#collapsible-'+model.get('id')).collapse('toggle');
			});*/
		},
		
		initCalendars: function () {
			var thisObj = this;
			
			this.$el.find('#filter-date-of-purchase .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-date-of-purchase .input-group.date input').val();
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				thisObj.collection.setDate(date);
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-pickup-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-pickup-end .input-group.date input').val();
				thisObj.$el.find('#filter-delivery-end .input-group.date').datepicker('setStartDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
			
				thisObj.collection.setFilter('transportstart', date);
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-pickup-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-pickup-end .input-group.date input').val();
				thisObj.$el.find('#filter-pickup-start .input-group.date').datepicker('setEndDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				thisObj.collection.setFilter('transportend', date);
				thisObj.renderList(1);
			});
		},
		
		initCancelWindow: function (){
			var thisObj = this;
			var options = '';
			_.each(this.cancellingReasonCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('reason')+'</option>';
			});
			var form = _.template(reasonForCancellationOptionTemplate, {'reasons': options});
			
			this.initConfirmationWindowWithForm('Are you sure you want to cancel this PO?',
										'confirm-cancel-po',
										'Yes',
										form,
										'Cancel Purchase Order');
										
			var validate = $('#cancellationReasonForm').validate({
				submitHandler: function(form) {
					
					var data = $(form).serializeObject();
					
					var purchaseOrderModel = new PurchaseOrderModel(data);
						
					purchaseOrderModel.setCancelURL();		
					purchaseOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								thisObj.renderList(1);
								thisObj.hideConfirmationWindow();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: purchaseOrderModel.getAuth(),
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
			'click .sort-date-of-po' : 'sortPODate',
			'change .location_id' : 'filterByDestination',
			'change .statusFilter' : 'filterByStatus',
			'click .cancel-po': 'preShowConfirmationWindow',
			'click #confirm-cancel-po': 'cancelPO',
			'change #reason': 'onChangeReason',
			'click #po-accordion tr.collapse-trigger': 'toggleAccordion',
			'click .stop-propagation': 'linkStopPropagation',
		},
		
		onChangeReason: function (ev) {
			var field = $(ev.target);
			
			if(field.val() == Const.CANCELLATIONREASON.OTHERS)
				$('#cancellation-others-text').show();
			else
				$('#cancellation-others-text').hide();
		},
		
		sortPODate: function () {
			this.sortByField('created_at');
		},
		
		filterByDestination: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('location', filter)
			this.renderList(1);
			return false;
		},
		
		filterByStatus: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('status', filter)
			this.renderList(1);
			return false;
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#cancellationReasonForm #cancelled-order-id').val($(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow('modal-with-form-confirm');
			return false;
		},
		
		cancelPO: function (ev) {
			$('#cancellationReasonForm').submit();
			return false;
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			var id = $(ev.currentTarget).attr('data-id');
			var collapsibleId = Const.PO.COLLAPSIBLE.ID+id;
			
			if(!$('#'+collapsibleId).hasClass('in')) {
				
				$(ev.currentTarget).find('.throbber_wrap').show();
				var orderWeightDetailsByStackCollection = new OrderWeightDetailsByStackCollection(id);
				orderWeightDetailsByStackCollection.on('sync', function() {
					$('#'+collapsibleId).find('.order-weight-details-by-stack').html(thisObj.generateOrderWeightDetailsByStack(this.models));
					$(ev.currentTarget).find('.throbber_wrap').hide();
					$('#'+collapsibleId).closest('tbody').find('.order-collapsible-item.collapse.in').collapse('toggle');
					$('#'+collapsibleId).collapse('toggle');
					this.off('sync');
				});
				
				orderWeightDetailsByStackCollection.on('error', function(collection, response, options) {
					$(ev.currentTarget).find('.throbber_wrap').hide();
					this.off('error');
				});
				orderWeightDetailsByStackCollection.getModels();
			}
			else {
				$('#'+collapsibleId).collapse('toggle');
			}
		},
		
		generateOrderWeightDetailsByStack: function (models) {
			var data = {
				stacks: models,
				_: _ 
			};
			return _.template(orderWeightDetailsByStackItemTemplate, data);
		},
	});

  return PurchaseOrderListView;
  
});