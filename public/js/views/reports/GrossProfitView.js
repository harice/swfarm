define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'text!templates/reports/GrossProfitFormTemplate.html',
	'text!templates/reports/GrossProfitListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	grossProfitFormTemplate,
	grossProfitListTemplate,
	Global,
	Const
){

	var GrossProfit = ReportView.extend({	

		initialize: function() {
			var thisObj = this;
			this.title = "Gross Profit Report";
			this.dataModel = "gross-profit-report";	
							
			if(typeof this.otherInits != "undefined")		
				this.otherInits();				

		},
		
		render: function(){								
			this.displayButton();
			Backbone.View.prototype.refreshTitle('Report','Gross Profit');
		},			

		displayButton: function() {
			var compiledTemplate = _.template(grossProfitFormTemplate);

			this.$el.html(compiledTemplate);

			$('.form-button-container').removeClass("hidden");	
		},		

		onclickgenerate: function() {
			var thisObj = this;	
			var data = this.formatField($("#generateReportForm").serializeObject());
			
			this.model = new Report();	
			this.model.fetchGrossProfit(data['reporttype'], data['transportdatestart'], data['transportdateend']);
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, grossProfitListTemplate);
				this.off("change");
			});	
		},		
		
	});

  return GrossProfit;
  
});