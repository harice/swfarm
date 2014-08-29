define([
	'backbone',
	'views/base/AccordionListView',
	'collections/user/CommissionedUserCollection',
	'collections/commission/WeightTicketByUserCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/commission/commissionListTemplate.html',
	'text!templates/commission/commissionInnerListTemplate.html',
	'text!templates/commission/weightTicketByUserTemplate.html',
	'text!templates/commission/commissionFormTemplate.html',
	'constant',
], function(Backbone,
			AccordionListView,
			UserCollection,
			WeightTicketByUserCollection,
			contentTemplate,
			commissionListTemplate,
			commissionInnerListTemplate,
			weightTicketByUserTemplate,
			commissionFormTemplate,
			Const
){

	var CommissionListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
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
			
			this.initConvertToPOWindow();
		},
		
		setListOptions: function () {
			/*var options = this.collection.listView; //console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);*/
		},
		
		events: {
			'click tr.collapse-trigger': 'toggleAccordion',
			'click .edit-commission': 'showEditCommissionWindow',
			'change .commission_type': 'onChangeCommissionType',
			'keyup #commission-flat-rate': 'formatMoney',
			'blur #commission-flat-rate': 'onBlurMoney',
			'keyup #commission-ton': 'onKeyUpCommissionTon',
			'blur #commission-ton': 'onBlurTon',
			'keyup #commission-rate-per-ton': 'onKeyUpCommissionRatePerTon',
			'blur #commission-rate-per-ton': 'onBlurMoney',
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
				_: _ 
			};

			_.extend(data,Backbone.View.prototype.helpers);

			return _.template(weightTicketByUserTemplate, data);
		},
		
		showEditCommissionWindow: function (ev) {
			this.showConfirmationWindow('modal-with-form-confirm');
			return false;
		},
		
		initConvertToPOWindow: function () {
			var thisObj = this;
			var form = _.template(commissionFormTemplate, {commission_type: Const.COMMISSION.TYPE, column_id_pre: Const.COMMISSION.COLUMNIDPRE});
			
			this.initConfirmationWindowWithForm('',
										'save-commission',
										'Save',
										form,
										'Compute Commission');
			
			this.subContainer.find('[name="commission_type"][value="'+Const.COMMISSION.TYPE[0].id+'"]').attr('checked', true)
				.trigger('change');
			//$('#modal-with-form-confirm .i-circle.warning').remove();
			//$('#modal-with-form-confirm h4').remove();
			
			/*
			var validate = $('#convertToPOForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					//console.log(data);
					
					thisObj.bidTransportdateStart = data.transportdatestart;
					thisObj.bidTransportdateEnd = data.transportdateend;
					thisObj.bidLocationId = data.location_id;
					
					thisObj.isConvertToPO = true;
					thisObj.subContainer.find('#poForm').submit();
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
			});*/
		},
		
		onChangeCommissionType: function (ev) {
			var id = parseInt($(ev.currentTarget).val());
			
			if(id == Const.COMMISSION.TYPE[0].id) {
				var selectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[0].id;
				this.subContainer.find('#'+selectedColumnId+' input').attr('disabled', false);
				this.subContainer.find('#'+selectedColumnId+' label').css('color', 'inherit');
				
				var unselectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[1].id;
				this.subContainer.find('#'+unselectedColumnId+' input').attr('disabled', true);
				this.subContainer.find('#'+unselectedColumnId+' label').css('color', '#ddd');
			}
			else {
				var selectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[1].id;
				this.subContainer.find('#'+selectedColumnId+' input').attr('disabled', false);
				this.subContainer.find('#'+selectedColumnId+' label').css('color', 'inherit');
				
				var unselectedColumnId = Const.COMMISSION.COLUMNIDPRE+Const.COMMISSION.TYPE[0].id;
				this.subContainer.find('#'+unselectedColumnId+' input').attr('disabled', true);
				this.subContainer.find('#'+unselectedColumnId+' label').css('color', '#ddd');
			}
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
	});

	return CommissionListView;
  
});