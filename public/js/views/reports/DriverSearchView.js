define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/contact/ContactCollection',
	'text!templates/reports/DriversPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	ContactCollection,
	driverListTemplate,
	Global,
	Const
){

	var DriverSearchView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "Driver's Name";	
			this.reportId = $("#reporttype").val();
			this.model = new Report();
			this.model.on('change', function (){				
				thisObj.processData();
				this.off("change");
			});	

			this.collection = new ContactCollection();			

		},
		
		render: function(){
			this.collection.getContactsByAccountType(9);
			this.getDriversList();								
			Backbone.View.prototype.refreshTitle('Report','Driver Pay');
		},	

		getDriversList: function(){
			var thisObj = this;	

			this.collection.on('sync', function (){	
				thisObj.displayForm();																	
				this.off('sync');
			})	
		},			

		getFilterName: function (){
			var drivers = '<option disabled selected>Select Driver</option>';			
			_.each(this.collection.models, function (model) {
				drivers += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return drivers;
		},			
				
		onclickgenerate: function() {	
			var thisObj = this;			
			this.filterId = $("#filtername").val();
									
			if(this.checkFields()){	
				this.model = new Report();			
				this.model.fetchStatement(this.reportId, this.filterId, this.startDate, this.endDate);
				//this.model.fetchDriverStatement(this.filterId, this.startDate, this.endDate);
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
				'date_from': this.startDate,
				'date_to': this.endDate,
				'drivers': this.model,
				'export_pdf_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'pdf', model:'driver-pay-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xlsx_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xlsx', model:'driver-pay-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xls_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xls', model:'driver-pay-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_csv_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'csv', model:'driver-pay-statement', dateStart:this.startDate, dateEnd:this.endDate}))
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(driverListTemplate, innerTemplateVariables);

			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},



		
	});

  return DriverSearchView;
  
});