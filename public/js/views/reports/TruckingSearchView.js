define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',	
	'jqueryvalidate',
	'jquerytextformatter',
	'bootstrapmultiselect',
	'models/reports/ReportModel',
	'collections/contact/ContactCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/reports/TruckersFormTemplate.html',
	'text!templates/reports/TruckersListTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			ReportsView,
			Validate,
			TextFormatter,
			bootstrapMultiSelect,
			Report,
			ContactCollection,
			contentTemplate,
			truckerFormTemplate,
			truckerListTemplate,
			Global,
			Const
){

var TruckerSearchView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			this.truckerId = null;		

			this.model = new Report();
			this.model.on('change', function (){
				thisObj.processData();
				this.off("change");
			});		

			this.collection = new ContactCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){
				thisObj.displayForm();							
				this.off('sync');
			})			

		},
		
		render: function(){								
			this.collection.getContactsByAccountType(8);
			Backbone.View.prototype.refreshTitle('Trucker','Search');
		},

		setCurDate: function (){
			var date = new Date();			
			date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();			
			
			return date;
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

		getTruckers: function (){
			var truckers = '<option value="">Select Trucker</option>';			
			_.each(this.collection.models, function (model) {
				truckers += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return truckers;
		},	
		
		displayForm: function () {
			var thisObj = this;			

			var innerTemplateVariables = {
				'date': this.curdate,
				'truckers': this.getTruckers(),
			};

			var innerTemplate = _.template(truckerFormTemplate, innerTemplateVariables);
						
			this.$el.find("#report-filter").html(innerTemplate);
			
			this.focusOnFirstField();
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
				

			thisObj.initCalendars();
			
			$('.form-button-container').show();		
		},	

		events: {
			'click #generate': 'onclickgenerate',
		},					

		onclickgenerate: function() {
			this.producerId = $("#truckername").val();			
			this.model.fetchProducersStatement(this.truckerId, this.startDate, this.endDate);

		},

		processData: function() {
			var thisObj = this;
						
			
			var innerTemplateVariables= {
				'trucker_id': this.truckerId,
				'truckers': this.model,
			}
			var compiledTemplate = _.template(truckerListTemplate, innerTemplateVariables);
			this.$el.find("#report-list").html(compiledTemplate);
		},

		
	});

  return TruckerSearchView;
  
});