define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/ReportView',
	'views/reports/OperatorsSearchView',
	'views/reports/ProducerSearchView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/reports/ReportModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/reports/ReportFormTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Operator,
			Producer,
			Validate,
			TextFormatter,
			Report,
			contentTemplate,
			reportFormTemplate,
			Global,
			Const
){

	var ReportView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),	

		initialize: function (){
			this.initSubContainer();
			var thisObj = this;

			this.displayFilter();			
		},
		render: function(){								
			Backbone.View.prototype.refreshTitle('Report','Generate');
		},										

		operator: function (){
			this.closeView();
			this.currView = new Operator();			
			this.currView.render();
		},

		producer: function (){
			this.closeView();
			this.currView = new Producer();
			this.currView.render();
		},
		
	});

  return ReportView;
  
});