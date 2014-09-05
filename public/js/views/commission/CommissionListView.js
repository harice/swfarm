define([
	'backbone',
	'views/base/AccordionListView',
	'models/commission/CommissionModel',
	'collections/user/CommissionedUserCollection',
	'collections/commission/WeightTicketByUserCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/commission/commissionListTemplate.html',
	'text!templates/commission/commissionInnerListTemplate.html',
	'text!templates/commission/weightTicketByUserTemplate.html',
	'text!templates/commission/commissionFormTemplate.html',
	'text!templates/commission/commissionTypeTemplate.html',
	'constant',
], function(Backbone,
			AccordionListView,
			CommissionModel,
			UserCollection,
			WeightTicketByUserCollection,
			contentTemplate,
			commissionListTemplate,
			commissionInnerListTemplate,
			weightTicketByUserTemplate,
			commissionFormTemplate,
			commissionTypeTemplate,
			Const
){

	var CommissionListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.options = {
				removeComma: ['rate', 'amountdue'],
			};
			
			this.collection = new UserCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayStackLocation();
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Commission','list');
		},
		
		displayStackLocation: function () {
			var innerTemplateVar = {};
			var innerTemplate = _.template(commissionListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Commission',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			this.setListOptions();
		},
		
		displayList: function () {
			
			var data = {
                commission_single_url: '#/'+Const.URL.COMMISSION,
				users: this.collection.models,
				collapsible_id: Const.COMMISSION.COLLAPSIBLE.ID,
				_: _ 
			};
			
			var innerListTemplate = _.template(commissionInnerListTemplate, data);
			this.subContainer.find("#commission-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();
			
			this.initCommissionWindow();
		},
		
		setListOptions: function () {
			/*var options = this.collection.listView; //console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);*/
		},
		
		events: {
			'click tr.collapse-trigger': 'toggleAccordion',
			'click .edit-commission': 'showEditCommissionWindow',
			'change .type': 'onChangeCommissionType',
			'keyup #commission-flat-rate': 'formatMoney',
			'blur #commission-flat-rate': 'onBlurMoney',
			//'keyup #commission-ton': 'onKeyUpCommissionTon',
			//'blur #commission-ton': 'onBlurTon',
			'keyup #commission-rate-per-ton': 'onKeyUpCommissionRatePerTon',
			'blur #commission-rate-per-ton': 'onBlurMoney',
			'click #save-commission': 'saveCommission',
			'click .stop-propagation': 'linkStopPropagation',
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			
			this.toggleAccordionAndRequestACollection(ev.currentTarget,
				Const.COMMISSION.COLLAPSIBLE.ID,
				WeightTicketByUserCollection,
				function (collection, id) {
					var collapsibleId = Const.COMMISSION.COLLAPSIBLE.ID+id;
					$('#'+collapsibleId).find('.weight-ticket-by-user table tbody').html(thisObj.generateWeightTicketByUser(collection.models, id));
				}
			);
			
			return false;
		},
		
		generateWeightTicketByUser: function (models, userId) {
			var data = {
				user_id: userId,
				wts: models,
				wt_url: '/#/'+Const.URL.SOWEIGHTINFO,
				weight_ticket_by_user_id: Const.COMMISSION.WEIGHTTICKETBYUSERID,
				_: _ 
			};

			_.extend(data,Backbone.View.prototype.helpers);

			return _.template(weightTicketByUserTemplate, data);
		},
		
		showEditCommissionWindow: function (ev) { //console.log('showEditCommissionWindow');
			this.subContainer.find('#modal-with-form-confirm input').removeClass('error');
			this.subContainer.find('#modal-with-form-confirm label.error').text('');
			this.subContainer.find('#modal-with-form-confirm .error-msg-cont').html('');
			
			var button = $(ev.currentTarget);
			var tons = button.attr('data-tons');
			this.subContainer.find('#weightticket_id').val(button.attr('data-id'));
			this.subContainer.find('#order_id').val(button.attr('data-order-id'));
			this.subContainer.find('#user_id').val(button.attr('data-user-id'));
			this.subContainer.find('#tons').val(tons);
			this.subContainer.find('#commission-ton').val(this.addCommaToNumber(tons));
			
			this.showConfirmationWindow('modal-with-form-confirm');
			return false;
		},
		
		initCommissionWindow: function () {
			var thisObj = this;
			var commissionFormTemplateVars = {
				commission_type: Const.COMMISSION.TYPE,
				column_id_pre: Const.COMMISSION.COLUMNIDPRE,
				commission_type_template: _.template(commissionTypeTemplate, {commission_type: Const.COMMISSION.TYPE}),
			};
			var form = _.template(commissionFormTemplate, commissionFormTemplateVars);
			
			this.initConfirmationWindowWithForm('',
										'save-commission',
										'Save',
										form,
										'Compute Commission');
			
			this.subContainer.find('[name="type"][value="'+Const.COMMISSION.TYPE[0].id+'"]').attr('checked', true).trigger('change');
			
			var validate = $('#commissionForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					var deleteID = Const.COMMISSION.WEIGHTTICKETBYUSERID+data.order_id+'-'+data.weightticket_id;
					
					var commissionModel = new CommissionModel(data);
					commissionModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.hideConfirmationWindow('modal-with-form-confirm', function () {
									var tbody = thisObj.subContainer.find('#'+deleteID).closest('tbody');
									thisObj.subContainer.find('#'+deleteID).remove();
									//console.log("tbody.find('tr').length: "+tbody.find('tr').length);
									if(tbody.find('tr').length <= 0)
										tbody.html('<tr><td colspan="3">No results found.</td></tr>');
									thisObj.displayMessage(response);
								});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: commissionModel.getAuth(),
						}
					);
				},
				errorPlacement: function(error, element) {
					if(element.hasClass('form-date')) {
						element.closest('.calendar-cont').siblings('.error-msg-cont').html(error);
					}
					else if(element.hasClass('price')) {
						element.closest('.input-group').siblings('.error-msg-cont').html(error);
					}
					else {
						error.insertAfter(element);
					}
				},
			});
		},
		
		onChangeCommissionType: function (ev) {
			var id = parseInt($(ev.currentTarget).val());
			
			if(id == Const.COMMISSION.TYPE[0].id) {
				var selectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[0].id;
				var unselectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[1].id;
			}
			else {
				var selectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[1].id;
				var unselectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[0].id;
			}
			
			this.subContainer.find('#'+selectedColumnId+' input').attr('disabled', false);
			this.subContainer.find('#'+selectedColumnId+' label').css('color', 'inherit');
			
			this.subContainer.find('#'+unselectedColumnId+' input').attr('disabled', true).removeClass('error');
			this.subContainer.find('#'+unselectedColumnId+' input').attr('disabled', true);
			this.subContainer.find('#'+unselectedColumnId+' label').css('color', '#ddd');
			this.subContainer.find('#'+unselectedColumnId+' label.error').text('');
			this.subContainer.find('#'+unselectedColumnId+' .error-msg-cont').html('');
		},
		
		onKeyUpCommissionTon: function (ev) {
			var tonField = $(ev.target)
			this.fieldAddCommaToNumber(tonField.val(), ev.target, 4);
			
			var tons = this.getFloatValueFromField(tonField);
			var rate = this.getFloatValueFromField(this.subContainer.find('#commission-rate-per-ton'));
			
			this.computeTotalPrice(tons, rate);
		},
		
		onKeyUpCommissionRatePerTon: function (ev) {
			var rateField = $(ev.target)
			this.fieldAddCommaToNumber(rateField.val(), ev.target, 2);
			
			var tons = this.getFloatValueFromField(this.subContainer.find('#commission-ton'));
			var rate = this.getFloatValueFromField(rateField);
			
			this.computeCommissionPerTon(tons, rate);
		},
		
		computeCommissionPerTon: function (tons, rate) {
			var commission = 0;
			commission = tons * rate;
			this.subContainer.find('#commission-total-per-ton').val(this.addCommaToNumber(commission.toFixed(2)));
		},
		
		saveCommission: function (ev) { //console.log('saveCommission');
			this.subContainer.find('#commissionForm').submit();
			return false;
		},
		
		removeComma: function (data) {
			for(var key in data) {
				if(typeof data[key] !== 'function' && this.options.removeComma.indexOf(key) >= 0) {
					data[key] = this.removeCommaFromNumber(data[key]);
				}
			}
			
			return data;
		},
	});

	return CommissionListView;
  
});