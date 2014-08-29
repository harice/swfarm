define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/purchaseorder/PurchaseOrderModel',
	'models/purchaseorder/POScheduleModel',
	'models/purchaseorder/POWeightInfoModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/purchaseorder/weightInfoViewTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			PurchaseOrderModel,
			POScheduleModel,
			POWeightInfoModel,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			weightInfoViewTemplate,
			Global,
			Const
){

	var WeightInfoView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.h1Title = 'Weight Info';
			this.h1Small = 'view';
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 3)}));
			
			this.purchaseOrderModel = new PurchaseOrderModel({id:this.poId});
			this.purchaseOrderModel.on('change', function() {
				thisObj.poScheduleModel.runFetch();
				thisObj.off('change');
			});
			
			this.poScheduleModel = new POScheduleModel({id:this.schedId});
			this.poScheduleModel.on('change', function() {
				thisObj.model.runFetch();
				thisObj.off('change');
			});
			
			this.model = new POWeightInfoModel({id:this.schedId});
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
				}
				
				this.off('change');
			});
		},
		
		render: function(){
			this.purchaseOrderModel.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Ticket','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				pickup_weight_info_edit_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.PICKUP,
				pickup_weight_info_add_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.PICKUP,
				dropoff_weight_info_edit_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.DROPOFF,
				dropoff_weight_info_add_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.DROPOFF,
                weight_info_edit_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT,
                weight_info_print_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+'print',
                weight_info_mail_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.model.id+'/'+'mail',
				previous_po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
                weight_info_id: thisObj.model.id,
                po: this.purchaseOrderModel,
                schedule: this.poScheduleModel,
                wi: this.model,
			};
			
			if((!this.model.get('status') || (this.model.get('status') && this.model.get('status').id != Const.STATUSID.CLOSED)) && 
				this.purchaseOrderModel.get('status').id == Const.STATUSID.OPEN)
				innerTemplateVariables['editable'] = true;
			
			if(this.model.get('weightticketscale_pickup') != null)
				innerTemplateVariables['has_pickup_info'] = true;
			if(this.model.get('weightticketscale_dropoff') != null)
				innerTemplateVariables['has_dropoff_info'] = true;

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);

			var innerTemplate = _.template(weightInfoViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click .close-weight-ticket': 'showCloseWeightTicketConfirmationWindow',
			'click #confirm-close-wt': 'closeWeightTicket',
			'click #mail-weight-ticket': 'showMailForm',
            'click #confirm-mail-weight-ticket': 'mailWeightTicket'
		},
                
        showMailForm: function() {
            this.initModalForm('',
                'confirm-mail-weight-ticket',
                'Send',
                'Send Email',
                false);
            this.showModalForm();
            
            return false;
        },
                
        mailWeightTicket: function(ev) {
            
            var thisObj = this;
            var formData = {
                weightticket: $('#mail-weight-ticket-form input[name=weightticket]').prop('checked'),
                loadingticket: $('#mail-weight-ticket-form input[name=loadingticket]').prop('checked'),
                recipients: $('#mail-weight-ticket-form input[name=recipient]').val()
            };
			
			var weightInfoModel = new POWeightInfoModel({id:this.schedId});
			weightInfoModel.setEmailURL();
			weightInfoModel.save(
				formData,
				{
					success: function (model, response, options) {
						thisObj.displayMessage(response);
					},
					error: function (model, response, options) {
						if(typeof response.responseJSON.error === 'undefined')
							alert(response.responseJSON);
						else
							thisObj.displayMessage(response);
					},
					headers: weightInfoModel.getAuth()
				}
			);
                
            return false;
        },
		
		showCloseWeightTicketConfirmationWindow: function (ev) {
			this.initConfirmationWindow('Are you sure you want to close this weight ticket?',
										'confirm-close-wt',
										'Close Weight Ticket',
										'Close Weight Ticket',
										false);
			this.showConfirmationWindow();
			
			return false;
		},
		
		closeWeightTicket: function (ev) {
			
			var thisObj = this;
			
			var weightInfoModel = new POWeightInfoModel({id:this.schedId});
			weightInfoModel.setCloseURL();
			weightInfoModel.save(
				null,
				{
					success: function (model, response, options) {
						thisObj.hideConfirmationWindow('modal-confirm', function () {
							thisObj.subContainer.find('.editable-button').remove();
							thisObj.subContainer.find('#weight-status').removeClass('label-success').addClass('label-default').html('Closed');

							var weight_info_print_url = '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+'print';
							thisObj.subContainer.find('#weight-ticket-actions').prepend('<a href="'+weight_info_print_url+'" class="btn btn-primary btn-sm btn-trans btn-rad"><i class="fa fa-print width-10"></i> Print</a><a id="mail-weight-ticket" class="btn btn-primary btn-sm btn-trans btn-rad"><i class="fa fa-envelope-o width-10"></i> Email</a>');
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
					headers: weightInfoModel.getAuth(),
				}
			);
                
			return false;
		}
	});

	return WeightInfoView;
});