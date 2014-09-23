define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',	
	'collections/account/AccountProducerCollection',
	'text!templates/reports/ProducersListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	AccountProducerCollection,
	producersListTemplate,
	Global,
	Const
){

	var ProducerSearchView = ReportView.extend({		
		
		initialize: function() {
			var thisObj = this;		
			this.filtername = "Producer's Name";				
			this.reportId = $("#reporttype").val();
			this.model = new Report();
			this.model.on('change', function (){
				thisObj.processData();
				this.off("change");
			});	

			this.collection = new AccountProducerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			})			

		},
		
		render: function(){	

			this.getProducerList();			
			Backbone.View.prototype.refreshTitle('Report','Producer Statement');			
		},	

		getProducerList: function (){
			var thisObj = this;				
			
			this.collection.fetch({
				success: function (collection, response, options) {
					
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth()
			});
		},

		getFilterName: function(){
				
			var producers = '<option disabled selected>Select Producer</option>';
			_.each(this.collection.models, function (model) {
				producers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return producers;
		},	
				
		onclickgenerate: function() {	
			var thisObj = this;					
			this.filterId = $("#filtername").val();
						
			if(this.checkFields()){								
				this.model.fetchStatement(this.reportId, this.filterId, this.startDate, this.endDate);
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
				'producers': this.model,
				'export_pdf_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'pdf', model:'producer-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xlsx_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xlsx', model:'producer-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xls_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xls', model:'producer-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_csv_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'csv', model:'producer-statement', dateStart:this.startDate, dateEnd:this.endDate}))
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(producersListTemplate, innerTemplateVariables);

			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},			

		
	});

  return ProducerSearchView;
  
});