define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/inventory/StackNumberCollection',
	'text!templates/reports/InventoryListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	StackNumberCollection,
	inventoryListTemplate,
	Global,
	Const
){

	var InventorySearchView = ReportView.extend({	

		initialize: function() {
			var thisObj = this;			
			this.filtername = "Stack No";
			this.reportId = $("#reporttype").val();
			this.model = new Report();
			this.model.on('change', function (){				
				thisObj.processData();;
				this.off("change");
			});			

			this.collection = new StackNumberCollection();			
		},
		
		render: function(){
			this.getStackList();								
			Backbone.View.prototype.refreshTitle('Report','Inventory');
		},	

		getStackList: function(){
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

		getFilterName: function (){
			var locations = '<option disabled selected>Select Stack No.</option>';			
			_.each(this.collection.models, function (model) {
				locations += '<option value="'+model.get('id')+'">'+model.get('stacknumber')+'</option>';
			});

			return locations;
		},
			
		onclickgenerate: function() {
			var thisObj = this;			
			this.filterId = $("#filtername").val();
				
			if(this.checkFields()){		
				this.model = new Report();							
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
				'date_from': this.startDate,
				'date_to': this.endDate,
				'locations': this.model,
				'export_pdf_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'pdf', model:'inventory-report', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xlsx_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xlsx', model:'inventory-report', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xls_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xls', model:'inventory-report', dateStart:this.startDate, dateEnd:this.endDate})),
				'export_csv_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'csv', model:'inventory-report', dateStart:this.startDate, dateEnd:this.endDate}))
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(inventoryListTemplate, innerTemplateVariables);
			
			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},



		
	});

  return InventorySearchView;
  
});