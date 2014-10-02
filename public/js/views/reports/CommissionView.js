define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/user/UserCollection',
	'text!templates/reports/CommissionListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	UserCollection,
	commissionListTemplate,
	Global,
	Const
){

	var CommissionView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "User's Name";
			this.reportId = $("#reporttype").val();
			this.model = new Report();
			this.model.on('change', function (){
				thisObj.processData(commissionListTemplate);
				this.off("change");
			});	

			this.collection = new UserCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			})			

		},
		
		render: function(){	
			this.getUserList();			
			Backbone.View.prototype.refreshTitle('Report','Commission Statement');			
		},	

		getUserList: function (){
			var thisObj = this;
			
			this.collection.fetch({
				success: function (collection, response, options) {
					thisObj.displayForm();	
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth()
			});
		},

		getFilterName: function(){
				
			var customers = '<option disabled selected>Select User</option>';
			_.each(this.collection.models, function (model) {
				_.each(model.get('data'), function (data) {
					customers += '<option value="'+data.id+'">'+data.firstname + ' ' + data.lastname +'</option>';
				});
			});

			return customers;
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
				'users': this.model,
				'export_pdf_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'pdf', model:'commission-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xlsx_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xlsx', model:'commission-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xls_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xls', model:'commission-statement', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_csv_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'csv', model:'commission-statement', dateStart:this.startDate, dateEnd:this.endDate}))
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(commissionListTemplate, innerTemplateVariables);

			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},
		

		
	});

  return CommissionView;
  
});