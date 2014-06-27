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
					thisObj.renderList(thisObj.collection.listView.currentPage);
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
			this.setListOptions();
		},
		
		displayList: function () {
			
			var data = {
				po_url: '#/'+Const.URL.PO,
				po_edit_url: '#/'+Const.URL.PO+'/'+Const.CRUD.EDIT,
				po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE,
				pos: this.collection.models,
				schedule_url: '#/'+Const.URL.PICKUPSCHEDULE,
				add: Const.CRUD.ADD,
				collapsible_id: Const.PO.COLLAPSIBLE.ID,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderInnerListTemplate, data);
			this.subContainer.find("#po-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();
		},
		
		collapseSelected: function () {
			var id = this.collection.getCollapseId();
			if(id)
				this.$el.find('.collapse-trigger[data-id="'+id+'"]').trigger('click');
		},
		
		setListOptions: function () {
			var options = this.collection.listView;
			//console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);
			
			if(options.filters.status != '')
				this.$el.find('[name="statusFilter"][value="'+options.filters.status+'"]').attr('checked', true);
				
			if(options.filters.location != '')
				this.$el.find('[name="location_id"][value="'+options.filters.location+'"]').attr('checked', true);
				
			if(options.date != '')
				this.$el.find('#filter-date-of-purchase .input-group.date').datepicker('update', this.convertDateFormat(options.date, 'yyyy-mm-dd', this.dateFormat, '-'));
			
			if(options.filters.transportstart != '')
				this.$el.find('#filter-pickup-start .input-group.date').datepicker('update', this.convertDateFormat(options.filters.transportstart, 'yyyy-mm-dd', this.dateFormat, '-'));
				
			if(options.filters.transportend != '')
				this.$el.find('#filter-pickup-end .input-group.date').datepicker('update', this.convertDateFormat(options.filters.transportend, 'yyyy-mm-dd', this.dateFormat, '-'));
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
				var selectedDate = $('#filter-pickup-start .input-group.date input').val();
				thisObj.$el.find('#filter-pickup-end .input-group.date').datepicker('setStartDate', selectedDate);
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
			'click #order-accordion tr.collapse-trigger': 'toggleAccordion',
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
				var thisId = id;
				this.collection.setCollapseLatestId(id);
				
				$(ev.currentTarget).find('.throbber_wrap').show();
				var orderWeightDetailsByStackCollection = new OrderWeightDetailsByStackCollection(id);
				orderWeightDetailsByStackCollection.on('sync', function() {
					thisObj.collection.setCollapseId(id);
					$(ev.currentTarget).find('.throbber_wrap').hide();
					//console.log(thisId+' == '+thisObj.collection.getCollapseLatestId());
					if(thisId == thisObj.collection.getCollapseLatestId() && thisObj.subContainerExist()) {
						_.each(this.models, function (model) {
							var schedules = model.get('schedule');
							if(schedules.length > 0) {
								for(var i=0; i<schedules.length; i++) {
									var s = schedules[i].transportscheduledate.split(' ');
									schedules[i].transportscheduledate = thisObj.convertDateFormat(s[0], 'yyyy-mm-dd', thisObj.dateFormat, '-')+' '+s[1];			
								}
								model.set('schedule', schedules);
							}
						});
						
						$('#'+collapsibleId).find('.order-weight-details-by-stack').html(thisObj.generateOrderWeightDetailsByStack(this.models, id));
						$('#'+collapsibleId).closest('tbody').find('.order-collapsible-item.collapse.in').collapse('toggle');
						$('#'+collapsibleId).collapse('toggle');
					}
					this.off('sync');
				});
				
				orderWeightDetailsByStackCollection.on('error', function(collection, response, options) {
					$(ev.currentTarget).find('.throbber_wrap').hide();
					this.off('error');
				});
				orderWeightDetailsByStackCollection.getModels();
			}
			else {
				this.collection.setCollapseId(null);
				$('#'+collapsibleId).collapse('toggle');
			}
		},
		
		generateOrderWeightDetailsByStack: function (models, poId) {
			var data = {
				stacks: models,
				schedule_url: '/#/'+Const.URL.PICKUPSCHEDULE+'/'+poId,
				weight_info_url: '/#/'+Const.URL.POWEIGHTINFO+'/'+poId,
				_: _ 
			};
			return _.template(orderWeightDetailsByStackItemTemplate, data);
		},
	});

  return PurchaseOrderListView;
  
});