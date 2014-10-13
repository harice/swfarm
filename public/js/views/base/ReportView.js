define([
	'backbone',
	'bootstrapdatepicker',	
	'jqueryvalidate',
	'jquerytextformatter',
	'views/base/AppView',
	'models/queue/QueueModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/reports/ReportFormTemplate.html',
	'text!templates/reports/FilterFormTemplate.html',
	'constant',
], function(
	Backbone, 
	DatePicker, 
	Validate,
	TextFormatter,
	AppView, 
	QueueModel,
	contentTemplate, 
	reportFormTemplate, 
	filterFormTemplate,
	Const
){

	var ReportView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		reportTypes: [
			{
				name: "Commission Report",
				id: 1
			}, 
			{
				name: "Customer Sales Report",
				id: 2
			}, 	
			{
				name: "Driver's Statement Report",
				id: 3
			},
			{
				name: "Gross Profit Report",
				id: 4
			}, 
			{
				name: "Inventory Report",
				id: 5
			},
			{
				name: "Operator's Pay Report",
				id: 6
			}, 
			{
				name:"Producer Statement Report",
				id: 7
			}, 
			{
				name: "Trucking Statement Report",
				id: 8
			}, 			 											
		],
		startDate: null,
		endDate: null,

		setCurDate: function (){
			var date = new Date();			
			date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();			
			
			return date;
		},

		getReportTypes: function (){			
			var types = '<option disabled selected>Select type of Report to generate</option>';
			_.each(this.reportTypes, function (type) {
				types += '<option value="'+type.id+'">'+type.name +'</option>';
			});
			return types;
			
		},

		displayFilter: function () {			
			var thisObj = this;

			var innerTemplateVariables = {
				'reports': this.getReportTypes(),
			};

			var innerTemplate = _.template(reportFormTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initCalendars();
							
		},	

		filterAction: function () {
			var thisObj = this;

			var type = this.$el.find("#reporttype").val();
			
			switch(type) {
				case '1':					
					return this.commission();						
					break;
				case '2':
					return this.customer();					
					break;
				case '3':
					return this.driver();					
					break;
				case '4':
					return this.gross();
					break;
				case '5':
					return this.inventory();
					break;
				case '6':
					return this.operator();
					break;
				case '7':				
					return this.producer();
					break;
				case '8':				
					return this.trucker();
					break;
			}			
			
		},

		closeView: function () {
			if(this.currView) {
				this.currView.close();
			}
		},

		checkDate: function() {
			var thisObj = this;
			
			var stat = true;
			var error = "<label class='error'>This field is required</label>";
			var startDate = $('#filter-operator-date-start .input-group.date input');
			var endDate = $('#filter-operator-date-end .input-group.date input');

			var startStat = true;
			var endStat = true;

			if(startDate.val() != '') {
				startStat = true;
				if(startDate.hasClass('error'))
					startDate.removeClass('error');

				startDate.parents('#filter-operator-date-start').find('.error-msg-cont').html('');

				if(startDate.val() != '' && typeof startDate.val() != 'undefined')
					thisObj.startDate = thisObj.convertDateFormat(startDate.val(), thisObj.dateFormat, 'yyyy-mm-dd', '-');				
			}
			else {			
				startStat = false;	
				startDate.addClass("error");
				startDate.parents('#filter-operator-date-start').find('.error-msg-cont').html(error);
			}

			if(endDate.val() != ''){
				endStat = true;
				if(endDate.hasClass('error'))
					endDate.removeClass('error');
				endDate.parents('#filter-operator-date-end').find('.error-msg-cont').html('');

				if(endDate.val() != '' && typeof endDate.val() != 'undefined')
					thisObj.endDate = thisObj.convertDateFormat(endDate.val(), thisObj.dateFormat, 'yyyy-mm-dd', '-');				
			}
			else {
				endStat = false;
				endDate.addClass("error");
				endDate.parents('#filter-operator-date-end').find('.error-msg-cont').html(error);
			}	

			(startStat && endStat) ? stat = true : stat= false;

			return stat;

		},

		checkFields: function() {
			var thisObj = this;
			var stat = true;
			var error = "<label class='error'>This field is required</label>";
			var reportFilter = $('#filtername');
			
			var filterStat = true;			

			if(reportFilter.val()==null) {
				filterStat = false;
				reportFilter.siblings('.error-msg-cont').html(error);
			}
			else {
				filterStat = true;
				reportFilter.siblings('.error-msg-cont').html('');
			}

			(this.checkDate() && filterStat) ? stat = true : stat= false;

			return stat;
		},
 
 		initCalendars: function () {
			var thisObj = this;					

			$('#filter-operator-date-start .input-group.date').datepicker({
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
								
			});
			
			$('#filter-operator-date-end .input-group.date').datepicker({
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
							
			});
			
		},

		displayForm: function () {
			var thisObj = this;	

			var innerTemplateVariables = {
				'filters': thisObj.getFilterName(),
				'filter_name': thisObj.filtername
			};
			
			var innerTemplate = _.template(filterFormTemplate, innerTemplateVariables);
						
			this.$el.html(innerTemplate);			
			this.focusOnFirstField();			
												
			$('.form-button-container').removeClass("hidden");			
		},	

		showSendMailModal: function(ev){
			var thisObj = this;	
			var type = $(ev.target).attr('data-type');
			var model = $(ev.target).attr('data-model');
			var id = $(ev.target).attr('data-id');
			var title = $(ev.target).attr('data-title');	
			var startDate = $("#filter-operator-date-start input").val();			
			var endDate = $("#filter-operator-date-end input").val();			

			this.initSendMailForm(
					"Send Mail as " +type,
					'btn_sendmail',
					'Send',
					title,
					model,
					type,
					id,
					startDate,
					endDate
				);
			
			var validate = $('#sendmail-form').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var queue = new QueueModel(data);
					queue.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								$('#mdl_sendmail').modal('hide');
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: queue.getAuth(),
						}
					);
				},
				rules: {
					recipients: {
						multiemail: true,
					},
				}
			});

			this.showModalForm('mdl_sendmail');

			return false;
		},

		sendMail: function() {
			$('#sendmail-form').submit();
			return false;
		},
		
		events: {
			'click #generate': 'onclickgenerate',
			'change #reporttype': 'filterAction',
			'click #filter-operator-date-start': 'checkdate',
			'click #filter-operator-date-end': 'checkdate',	
			'click .sendmail': 'showSendMailModal',	
			'click #btn_sendmail':'sendMail',	
		},		

	})

	return ReportView;
  
});