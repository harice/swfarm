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
			this.filterId = null;	
				

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
			this.filterId = $("#filtername").val();
			
			if(this.checkDate()) {
				this.model.fetchGrossProfit(this.startDate, this.endDate);
				$("#report-form").collapse("toggle");
				$(".collapse-form").addClass("collapsed");
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
				'date_from': thisObj.parseDate($('#filter-operator-date-start .input-group.date input').val()),
				'date_to': thisObj.parseDate($('#filter-operator-date-end .input-group.date input').val()),
				'profits': this.model,
				'export_pdf_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({id:this.filterId, type:'pdf', model:'gross-profit', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xlsx_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({id:this.filterId, type:'excel', format:'xlsx', model:'gross-profit', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xls_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({id:this.filterId, type:'excel', format:'xls', model:'gross-profit', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_csv_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({id:this.filterId, type:'excel', format:'csv', model:'gross-profit', dateStart:this.startDate, dateEnd:this.endDate}))
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