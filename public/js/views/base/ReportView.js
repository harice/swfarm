define([
	'backbone',
	'bootstrapdatepicker',	
	'jqueryvalidate',
	'jquerytextformatter',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/reports/ReportFormTemplate.html',
	'constant',
], function(
	Backbone, 
	DatePicker, 
	Validate,
	TextFormatter,
	AppView, 
	contentTemplate, 
	reportFormTemplate, 
	Const
){

	var ReportView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		reportTypes: [
			{
				name:"Producer Statement Report",
				id: 1
			}, 
			{
				name: "Trucking Statement Report",
				id: 2
			}, 
			{
				name: "Inventory Report",
				id: 3
			}, 
			{
				name: "Sales Report",
				id: 4
			}, 
			{
				name: "Commission Report",
				id: 5
			}, 
			{
				name: "Gross Profit Report",
				id: 6
			}, 
			{
				name: "Operator's Pay Report",
				id: 7
			}, 
			{
				name: "Driver's Statement Report",
				id: 8
			}
		],

		setCurDate: function (){
			var date = new Date();			
			date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();			
			
			return date;
		},

		getReportTypes: function (){			
			var types = '<option value="">Select type of Report to generate</option>';
			_.each(this.reportTypes, function (type) {
				types += '<option value="'+type.id+'">'+type.name +'</option>';
			});
			return types;
			
		},

		displayFilter: function () {
			var thisObj = this;

			var innerTemplateVariables = {
				'reports': this.getReportTypes(),
				'date': this.setCurDate(),
			};

			var innerTemplate = _.template(reportFormTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.filterAction();		
		},	

		filterAction: function () {
			var thisObj = this;

			this.$el.find("#reporttype").change(function(){				
				var type = $(this).val();
				var name = $(this).text();
				switch(type) {
					case '1':
						return thisObj.producer();
						break;
					case '7':						
						return thisObj.operator();
						break;
					default:
						console.log("Default");
				}				
			});
		},

		closeView: function () {
			if(this.currView) {
				this.currView.close();
			}
		},
 
 		initCalendars: function () {
			var thisObj = this;
			
			this.$el.find('#filter-operator-date-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-operator-date-start .input-group.date input').val();
				thisObj.$el.find('#filter-operator-date-end .input-group.date').datepicker('setStartDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');

				thisObj.startDate = date;
				//thisObj.renderList(1);
			});
			
			this.$el.find('#filter-operator-date-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-operator-date-end .input-group.date input').val();
				thisObj.$el.find('#filter-operator-date-start .input-group.date').datepicker('setEndDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				thisObj.endDate = date;
				//thisObj.renderList(1);
			});
		},		

		events: {
			'click #generate': 'onclickgenerate',
		},	

	})

	return ReportView;
  
});