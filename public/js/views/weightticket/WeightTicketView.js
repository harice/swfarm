define([
	'backbone',
	'views/autocomplete/AccountScaleAutoCompleteView',
	'models/weightticket/WeightTicketModel',
	'collections/account/AccountScaleCollection',
	'collections/product/BidProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddWeightTicketTemplate.html',
	'global',
	'constant'
], function(Backbone,
			AccountScaleAutoCompleteView,
			WeightTicketModel,
			AccountScaleCollection,
			BidProductCollection,
			contentTemplate,
			purchaseOrderAddWeightTicketTemplate,
			Global,
			Const
){

	var WeightTicketView = Backbone.View.extend({
		el: '#po-schedule-form-cont',
		
		initialize: function(option) {
			var thisObj = this;
			this.bidId = option.bidId;
			this.schedId = option.schedId;
			this.scaleOriginAutoCompleteResult = [];
			this.scaleDestinationAutoCompleteResult = [];
			this.editExisting = false;
			
			this.bidProductcollection = new BidProductCollection();
			this.bidProductcollection.on('sync', function() {
				thisObj.displayWeightTicket();
			});
			this.bidProductcollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new WeightTicketModel();
			this.model.setURLForGetByScheduleId(this.schedId);
			this.model.on('sync', function() {
				if(this.get('id'))
					thisObj.editExisting = true;
				thisObj.bidProductcollection.fetchBidProducts(thisObj.bidId);
				this.off('sync');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayWeightTicket: function () {
			var thisObj = this;
			var variables = {};
			
			if(this.editExisting)
				variables['weight_ticket_id'] = this.model.get('id');
			
			var compiledTemplate = _.template(purchaseOrderAddWeightTicketTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#WeightTicketForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					data['pickupschedule_id'] = thisObj.schedId;
					data['purchaseorder_id'] = thisObj.bidId;
					console.log(data);
					var weightTicketModel = new WeightTicketModel(data);
					
					weightTicketModel.save(
						null, 
						{
							success: function (model, response, options) {
								// thisObj.displayMessage(response);
                                thisObj.displayGrowl('Weight Ticket successfully saved.', 'success');
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: weightTicketModel.getAuth(),
						}
					);
				},
				errorPlacement: function(error, element) {
					if(element.hasClass('scale-fee')) {
						element.closest('.input-group').siblings('.error-msg-cont').html(error);
					}
					else {
						error.insertAfter(element);
					}
				},
			});
			
			this.supplyProductOptions();
			this.initAutocomplete();
			this.populateWeightTicketData();
		},
		
		supplyProductOptions: function () {
			var thisObj = this;
			_.each(this.bidProductcollection.models, function (model) {
				thisObj.$el.find('#bidproduct_id').append($('<option></option>').attr('value', model.get('id')).text(model.get('stacknumber')+' - '+model.get('product_id_name')[0].name));
			});
		},
		
		initAutocomplete: function () {
			var thisObj = this;
			
			//Scale Origin
			var accountScaleOriginCollection = new AccountScaleCollection();
			this.accountScaleOriginAutoCompleteView = new AccountScaleAutoCompleteView({
                input: $('#originscale'),
				hidden: $('#originscale-id'),
                collection: accountScaleOriginCollection,
            });
			
			this.accountScaleOriginAutoCompleteView.on('loadResult', function () {
				thisObj.scaleOriginAutoCompleteResult = [];
				_.each(accountScaleOriginCollection.models, function (model) {
					thisObj.scaleOriginAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountScaleOriginAutoCompleteView.render();
			
			//Scale Destination
			var accountScaleDestinationCollection = new AccountScaleCollection();
			this.accountScaleDestinationAutoCompleteView = new AccountScaleAutoCompleteView({
                input: $('#destinationscale'),
				hidden: $('#destinationscale-id'),
                collection: accountScaleDestinationCollection,
            });
			
			this.accountScaleDestinationAutoCompleteView.on('loadResult', function () {
				thisObj.scaleDestinationAutoCompleteResult = [];
				_.each(accountScaleDestinationCollection.models, function (model) {
					thisObj.scaleDestinationAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountScaleDestinationAutoCompleteView.render();
		},
		
		populateWeightTicketData: function () {
			if(this.editExisting) {
				this.scaleOriginAutoCompleteResult = [{name:this.model.get('origin_scaler_account').name, id:this.model.get('origin_scaler_account').id}];
				this.scaleDestinationAutoCompleteResult = [{name:this.model.get('destination_scaler_account').name, id:this.model.get('destination_scaler_account').id}];
				
				this.$el.find('#bidproduct_id').val(this.model.get('bidproduct_id'));
				
                this.$el.find('#wtn').val(this.model.get('wtn'));
				this.$el.find('#origin_bales').val(this.model.get('origin_bales'));
				this.$el.find('#origin_gross').val(this.model.get('origin_gross'));
				this.$el.find('#origin_tare').val(this.model.get('origin_tare'));
				this.$el.find('#origin_net').val(this.model.get('origin_net'));
				this.$el.find('#originscale').val(this.model.get('origin_scaler_account').name);
				this.$el.find('#originscale-id').val(this.model.get('origin_scaler_account').id);
				this.$el.find('#origin_scale_fee').val(parseFloat(this.model.get('origin_scale_fee')).toFixed(2));
				
				this.$el.find('#destination_bales').val(this.model.get('destination_bales'));
				this.$el.find('#destination_gross').val(this.model.get('destination_gross'));
				this.$el.find('#destination_tare').val(this.model.get('destination_tare'));
				this.$el.find('#destination_net').val(this.model.get('destination_net'));
				this.$el.find('#destinationscale').val(this.model.get('destination_scaler_account').name);
				this.$el.find('#destinationscale-id').val(this.model.get('destination_scaler_account').id);
				this.$el.find('#destination_scale_fee').val(parseFloat(this.model.get('origin_scale_fee')).toFixed(2));
			}
		},
		
		events: {
			'blur #originscale': 'validateAccount',
			'blur #destinationscale': 'validateAccount',
			'click #back-to-schedule': 'backToSchedule',
			'keyup .gross': 'keyUpGross',
			'keyup .tare': 'keyUpTare',
			'blur .scale-fee': 'onBlurScaleFee',
		},
		
		keyUpGross: function (ev) {
			var grossField = $(ev.target);
			var grossValue = (!isNaN(grossField.val()))? grossField.val() : 0;
			
			var tareField = grossField.closest('tr').find('.tare');
			var tareValue = (!isNaN(tareField.val()))? tareField.val() : 0;
			
			var netField = grossField.closest('tr').find('.net');
			netField.val(grossValue - tareValue);
			
			var subtrahend = 0;
			var minuend = 0;
			if(grossField.hasClass('origin')) {
				subtrahend = grossValue;
				var minuendField = grossField.closest('tbody').find('.gross.destination');
				minuend = (!isNaN(minuendField.val()))? minuendField.val() : 0;
			}
			else {
				minuend = grossValue;
				var subtrahendField = grossField.closest('tbody').find('.gross.origin');
				subtrahend = (!isNaN(subtrahendField.val()))? subtrahendField.val() : 0;
			}
			
			grossField.closest('table').find('#gross-diff').val(subtrahend - minuend);
			
			this.onChangeNet(grossField.closest('tbody').find('.net'));
		},
		
		keyUpTare: function (ev) {
			var tareField = $(ev.target);
			var tareValue = (!isNaN(tareField.val()))? tareField.val() : 0;
		
			var grossField = tareField.closest('tr').find('.gross');
			var grossValue = (!isNaN(grossField.val()))? grossField.val() : 0;
			
			var netField = grossField.closest('tr').find('.net');
			netField.val(grossValue - tareValue);
			
			var subtrahend = 0;
			var minuend = 0;
			if(tareField.hasClass('origin')) {
				subtrahend = tareValue;
				var minuendField = tareField.closest('tbody').find('.tare.destination');
				minuend = (!isNaN(minuendField.val()))? minuendField.val() : 0;
			}
			else {
				minuend = tareValue;
				var subtrahendField = tareField.closest('tbody').find('.tare.origin');
				subtrahend = (!isNaN(subtrahendField.val()))? subtrahendField.val() : 0;
			}
			
			tareField.closest('table').find('#tare-diff').val(subtrahend - minuend);
			
			this.onChangeNet(tareField.closest('tbody').find('.net'));
		},
		
		onChangeNet: function (netField) {
			var netValue = (!isNaN(netField.val()))? netField.val() : 0;
			
			var subtrahend = 0;
			var minuend = 0;
			if(netField.hasClass('origin')) {
				subtrahend = netValue;
				var minuendField = netField.closest('tbody').find('.net.destination');
				minuend = (!isNaN(minuendField.val()))? minuendField.val() : 0;
			}
			else {
				minuend = netValue;
				var subtrahendField = netField.closest('tbody').find('.net.origin');
				subtrahend = (!isNaN(subtrahendField.val()))? subtrahendField.val() : 0;
			}
			
			netField.closest('table').find('#net-diff').val(subtrahend - minuend);
		},
		
		validateAccount: function (ev) {
			var labelField = $(ev.target);
			var labelFieldId = $(ev.target).attr('id');
			var idField = '';
			var account = '';
			var autoCompleteView = null;
			
			switch(labelFieldId) {
				case 'originscale':
					idField = labelField.siblings('#originscale-id');
					autoCompleteView = this.accountScaleOriginAutoCompleteView;
					break;
				case 'destinationscale':
					idField = labelField.siblings('#destinationscale-id');
					autoCompleteView = this.accountScaleDestinationAutoCompleteView;
					break;
				default:
					break;
			}
			
			account = this.accountIsInFetchedData(labelField.val(), idField.val(), labelFieldId);
			
			if(!autoCompleteView.$el.is(':hover')) {
				if(account !== false) {
					if(account.id != null) {
						labelField.val(account.name);
						idField.val(account.id);
					}
					else
						labelField.val(account.name);
				}
				else {
					labelField.val('');
					idField.val('');
				}
				labelField.siblings('.autocomplete').hide();
			}
		},
		
		accountIsInFetchedData: function(name, id, type) {
			
			var autoCompleteResult = null;
			
			switch(type) {
				case 'originscale':
					autoCompleteResult = this.scaleOriginAutoCompleteResult;
					break;
				case 'destinationscale':
					autoCompleteResult = this.scaleDestinationAutoCompleteResult;
					break;
				default:
					break;
			}
			
			if(name != null) {
				for(var i = 0; i < autoCompleteResult.length; i++) {
					if(autoCompleteResult[i].name.toLowerCase() == name.toLowerCase()) {
						
						if(id != null && id != '' && parseInt(id) == parseInt(autoCompleteResult[i].id))
							return {name:autoCompleteResult[i].name};
						
						return {name:autoCompleteResult[i].name, id:autoCompleteResult[i].id};
					}
				}
			}
			return false;
		},
		
		backToSchedule: function () {
			this.backToScheduleCallBack();
			return false;
		},
		
		onBlurScaleFee: function (ev) {
			this.toFixedValue($(ev.target), 2);
		},
		
		backToScheduleCallBack: function () {},
	});

  return WeightTicketView;
  
});
