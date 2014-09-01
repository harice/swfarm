define([
	'backbone',
	'views/base/ListView',
	'models/user/UserModel',
	'models/commission/CommissionModel',
	'collections/salesorder/SOWeightInfoCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/commission/userCommissionTemplate.html',
	'text!templates/commission/userCommissionInnerListTemplate.html',
	'text!templates/commission/commissionFormTemplate.html',
	'text!templates/commission/commissionTypeTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			UserModel,
			CommissionModel,
			SOWeightInfoCollection,
			contentTemplate,
			userCommissionTemplate,
			userCommissionInnerListTemplate,
			commissionFormTemplate,
			commissionTypeTemplate,
			Const
){

	var CommissionView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			this.userId = option.id;
			this.h1Title = 'User Commission';
			this.h1Small = '';
			
			this.collection = new SOWeightInfoCollection();
			this.collection.setFilter('userId', this.userId);
			this.collection.listView.searchURLForFilter = false;
			this.collection.setDefaultURL('/apiv1/commission/getClosedWeightTicketByUserIncludingWithCommission');
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayUserCommission();
					thisObj.displayList();
				}
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.userModel = new UserModel({id:this.userId});
			this.userModel.on('change', function() {
				thisObj.renderList(1);
				this.off('change');
			});
		},
		
		render: function(){
			this.userModel.runFetch();
			Backbone.View.prototype.refreshTitle(this.h1Title, this.h1Small);
		},
		
		displayUserCommission: function () {
			var innerTemplateVar = {
				user_fullname: this.userModel.get('lastname')+', '+this.userModel.get('firstname'),
			};
			
			var innerTemplate = _.template(userCommissionTemplate, innerTemplateVar);
			
			var variables = {
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
		displayList: function () {
			
			var data = {
				weight_tickets: this.collection.models,
				commission_types: Const.COMMISSION.TYPE,
				_: _ 
			};
			
			_.extend(data,Backbone.View.prototype.helpers);
			
			var innerListTemplate = _.template(userCommissionInnerListTemplate, data);
			this.subContainer.find("#user-commission-list tbody").html(innerListTemplate);
			
			this.generatePagination();
			
			this.initCommissionWindow();
		},
		
		initCommissionWindow: function () {
			var thisObj = this;
			var commissionFormTemplateVars = {
				commission_type: Const.COMMISSION.TYPE,
				column_id_pre: Const.COMMISSION.COLUMNIDPRE,
				commission_type_template: '',
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
					var data = $(form).serializeObject(); //console.log(data);
					
					var commissionModel = new CommissionModel(data);
					commissionModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.hideConfirmationWindow('modal-with-form-confirm', function () {
									thisObj.displayMessage(response);
									thisObj.renderList();
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
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click .edit-commission': 'showEditCommissionWindow',
			'click #save-commission': 'saveCommission',
			'change .type': 'onChangeCommissionType',
			'keyup #commission-flat-rate': 'formatMoney',
			'blur #commission-flat-rate': 'onBlurMoney',
			'keyup #commission-rate-per-ton': 'onKeyUpCommissionRatePerTon',
			'blur #commission-rate-per-ton': 'onBlurMoney',
		},
		
		showEditCommissionWindow: function (ev) {
			this.subContainer.find('#modal-with-form-confirm input').removeClass('error');
			this.subContainer.find('#modal-with-form-confirm label.error').text('');
			this.subContainer.find('#modal-with-form-confirm .error-msg-cont').html('');
			
			var button = $(ev.currentTarget);
			var wtModel = this.collection.get(button.attr('data-id')); //console.log(wtModel);
			var commission = wtModel.get('commission');
			var tons = wtModel.get('netTons');
			
			var commissionType = _.template(commissionTypeTemplate, {commission_type: Const.COMMISSION.TYPE});
			this.subContainer.find('#commission-type-cont').html(commissionType);
			
			var commissionTypeId = (commission != null && commission.type == Const.COMMISSION.TYPE[1].id)? Const.COMMISSION.TYPE[1].id : Const.COMMISSION.TYPE[0].id;
			this.subContainer.find('[name="type"][value="'+commissionTypeId+'"]').attr('checked', true).trigger('change');
			
			this.subContainer.find('#weightticket_id').val(wtModel.get('id'));
			this.subContainer.find('#order_id').val(wtModel.get('schedule').order_id);
			this.subContainer.find('#user_id').val(this.userId);
			this.subContainer.find('#tons').val(tons);
			this.subContainer.find('#commission-ton').val(this.addCommaToNumber(tons, 4));
			
			this.subContainer.find('#commission-flat-rate').val('');
			this.subContainer.find('#commission-rate-per-ton').val('');
			this.subContainer.find('#commission-total-per-ton').val('');
			if(commission) {
				var totalCommission = this.addCommaToNumber(commission.amountdue, 2);
				if(commission.type == Const.COMMISSION.TYPE[0].id)
					this.subContainer.find('#commission-flat-rate').val(totalCommission);
				else if(commission.type == Const.COMMISSION.TYPE[1].id) {
					this.subContainer.find('#commission-rate-per-ton').val(this.addCommaToNumber(commission.rate, 2));
					this.subContainer.find('#commission-total-per-ton').val(totalCommission);
				}
				
				if(this.subContainer.find('#commission_id').length <= 0)
					this.subContainer.find('#weightticket_id').before('<input type="hidden" id="commission_id" name="id" value="'+commission.id+'" />');
				else
					this.subContainer.find('#commission_id').val(commission.id);
			}
			else {
				if(this.subContainer.find('#commission_id').length > 0)
					this.subContainer.find('#commission_id').remove();
			}
			
			this.showConfirmationWindow('modal-with-form-confirm');
			return false;
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
	});

	return CommissionView;
  
});