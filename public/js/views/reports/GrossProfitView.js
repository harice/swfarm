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
			this.reportId = $("#reporttype").val();
				
			this.model = new Report();
			this.model.on('change', function (){				
				thisObj.processData();
				this.off("change");
			});					

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
			
			
			if(this.checkDate()) {
				this.model = new Report();	
				this.model.fetchGrossProfit(this.reportId, this.startDate, this.endDate);
			}

			this.model.on('sync', function (){				
				thisObj.processData();				
				this.off("sync");
			});	
		},

		processData: function() {
			var thisObj = this;
			
			var innerTemplateVariables= {
				'cur_date': this.setCurDate(),
				'date_from': this.startDate,
				'date_to': this.endDate,
				'profits': this.model,
				'export_pdf_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'pdf', model:'gross-profit-report', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xlsx_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xlsx', model:'gross-profit-report', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xls_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xls', model:'gross-profit-report', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_csv_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'csv', model:'gross-profit-report', dateStart:this.startDate, dateEnd:this.endDate}))
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(grossProfitListTemplate, innerTemplateVariables);
			
			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},		

		
	});

  return GrossProfit;
  
});