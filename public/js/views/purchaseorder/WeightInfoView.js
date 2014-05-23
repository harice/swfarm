define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/purchaseorder/POWeightInfoModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/weightInfoViewTemplate.html',
	'text!templates/purchaseorder/weightInfoViewProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			POWeightInfoModel,
			contentTemplate,
			weightInfoViewTemplate,
			weightInfoViewProductItemTemplate,
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
			
			this.model = new POWeightInfoModel({id:this.schedId});
			this.model.on('change', function() {
				if(typeof this.get('weightTicketNumber') === 'undefined')
					Global.getGlobalVars().app_router.navigate(Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD, {trigger: true});
				else {
					thisObj.displayForm();
					thisObj.supplyWeightInfoData();
				}
				
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				weight_info_edit_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT,
				previous_po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
			};
			
			var innerTemplate = _.template(weightInfoViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
		supplyWeightInfoData: function () {
			var pickupInfo = this.model.get('weightticketscale_pickup');
			var dropoffInfo = this.model.get('weightticketscale_dropoff');
			
			this.$el.find('#pickup-info .scale-account').val(pickupInfo.scaler_account[0].name);
			this.$el.find('#pickup-info .scale-name').val(pickupInfo.scale.name);
			this.$el.find('#pickup-info .fee').val(this.addCommaToNumber(pickupInfo.fee));
			this.$el.find('#pickup-info .bales').val(this.addCommaToNumber(pickupInfo.bales));
			this.$el.find('#pickup-info .gross').val(this.addCommaToNumber(pickupInfo.gross));
			this.$el.find('#pickup-info .tare').val(this.addCommaToNumber(pickupInfo.tare));
			var pickupNet = parseFloat(pickupInfo.gross) - parseFloat(pickupInfo.tare);
			this.$el.find('#pickup-info .net').text(this.addCommaToNumber(pickupNet.toFixed(4)));
			
			this.$el.find('#dropoff-info .scale-account').val(dropoffInfo.scaler_account[0].name);
			this.$el.find('#dropoff-info .scale-name').val(dropoffInfo.scale.name);
			this.$el.find('#dropoff-info .fee').val(this.addCommaToNumber(dropoffInfo.fee));
			this.$el.find('#dropoff-info .bales').val(this.addCommaToNumber(dropoffInfo.bales));
			this.$el.find('#dropoff-info .gross').val(this.addCommaToNumber(dropoffInfo.gross));
			this.$el.find('#dropoff-info .tare').val(this.addCommaToNumber(dropoffInfo.tare));
			var dropffNet = parseFloat(dropoffInfo.gross) - parseFloat(dropoffInfo.tare);
			this.$el.find('#dropoff-info .net').text(this.addCommaToNumber(dropffNet.toFixed(4)));
		},
	});

	return WeightInfoView;
});