define([
	'backbone',
	'bootstrapdatepicker',	
	'jqueryvalidate',
	'jquerytextformatter',
	'views/base/AppView',
	'models/queue/QueueModel',
	'models/reports/ReportModel',
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
	Report,
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
		startDate: '',
		endDate: '',

		otherInits: function () {
			var thisObj = this;

			this.filterId = null;										
		},	

		setCurDate: function (){
			var date = new Date();			
			date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();			
			
			return date;
		},

		setStartDate: function(date){
			this.startDate = date;
		},

		setEndDate: function(date){
			this.endDate = date;
		},

		setFilterId: function(ev) {
			this.filterId = $(ev.target).val();
		},

		getStartDate: function(){
			return this.startDate;

			console.log(this.startDate());
		},

		getEndDate: function(){
			return this.endDate;
		},

		getTitle: function(){
			return this.title;
		},

		getDataModel: function() {
			return this.dataModel;
		},	

		getReportTypes: function (){			
			var types = '<option disabled selected>Select type of Report</option>';
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

			this.initValidateForm();
			this.initCalendars();			
							
		},	

		initValidateForm: function () {
			var thisObj = this;			

			$('#generateReportForm')										
				.bootstrapValidator({					
					live: 'enabled',			
					group: '.calendar-cont',
					submitButtons: '',																		
			        fields: {			        		        
			            transportdatestart: {
			            	container: '.start-error-msg-cont',
			                validators: {									         	                 
			                    date: {
			                        format: 'MM-DD-YYYY',
			                        message: 'The date is not valid.'
			                    }
			                }
			            },
			            transportdateend: {
			            	container: '.end-error-msg-cont',
			                validators: {			                	               
			                    date: {
			                        format: 'MM-DD-YYYY',
			                        message: 'The date is not valid.'
			                    }
			                }
			            }
			        },			        
				})	
				.on('error.validator.bv', function(e, data) {
					 data.element
		                .data('bv.messages')
		                // Hide all the messages
		                .find('.help-block[data-bv-for="' + data.field + '"]').hide()
		                // Show only message associated with current validator
		                .filter('[data-bv-validator="' + data.validator + '"]').show();
				})			
				.on('error.field.bv', function(e, data) {		           
		            data.bv.disableSubmitButtons(false);
		        })		        
		        .on('success.field.bv', function(e, data) {		           
		            data.bv.disableSubmitButtons(false);		          
		        })		       
		        .on('success.form.bv', function(e, data){
		        	 e.preventDefault();
		        });
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
 
 		initCalendars: function () {
			var thisObj = this;					

			$('#filter-operator-date-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'mm-dd-yyyy',
				forceParse:false,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-operator-date-start .input-group.date input').val();
				thisObj.$el.find('#filter-operator-date-end .input-group.date').datepicker('setStartDate', selectedDate);
				$("#generateReportForm").bootstrapValidator('revalidateField', 'transportdatestart');
								
			});
			
			$('#filter-operator-date-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'mm-dd-yyyy',
				forceParse:false,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-operator-date-end .input-group.date input').val();
				thisObj.$el.find('#filter-operator-date-start .input-group.date').datepicker('setEndDate', selectedDate);
				$("#generateReportForm").bootstrapValidator('revalidateField', 'transportdateend');
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
												
			$('#generate').removeClass("hidden");			
		},	

		showSendMailModal: function(ev){
			var thisObj = this;	
			var type = $(ev.target).attr('data-type');
			var model = thisObj.currView.getDataModel();
			var title = thisObj.currView.getTitle();	
			var id = this.filterId;			
			var startDate = this.startDate;			
			var endDate = this.endDate;	

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

		formatField: function(data){
			var newData = [];

			newData['reporttype'] = data['reporttype'];

			if(typeof data['filtername']!= "undefined")
				newData['filtername'] = data['filtername'];

			if(typeof data['stacknumbers']!= "undefined")
				newData['stacknumbers'] = data['stacknumbers'];

			newData['transportdatestart'] = this.convertDateFormat(data['transportdatestart'], this.dateFormat, 'yyyy-mm-dd', '-');
			newData['transportdateend'] = this.convertDateFormat(data['transportdateend'], this.dateFormat, 'yyyy-mm-dd', '-');

			this.setStartDate(newData['transportdatestart']);							
			this.setEndDate(newData['transportdateend']);	

			return newData;
		},

		processData: function(models, template) {
			var thisObj = this;					

			var innerTemplateVariables= {
				'cur_date': this.setCurDate(),				
				'models': models,
				'export_pdf_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'pdf', model:this.dataModel, dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xlsx_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xlsx', model:this.dataModel, dateStart:this.startDate, dateEnd:this.endDate})),
				'export_xls_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'xls', model:this.dataModel, dateStart:this.startDate, dateEnd:this.endDate})),
				'export_csv_url': Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.filterId, type:'excel', format:'csv', model:this.dataModel, dateStart:this.startDate, dateEnd:this.endDate}))
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(template, innerTemplateVariables);

			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},			
		
		events: {	
			'click #generate': 'onclickgenerate',		
			'change #reporttype': 'filterAction',			
			'click .sendmail': 'showSendMailModal',	
			'click #btn_sendmail':'sendMail',	
			'change #filtername': 'setFilterId',
		},		

	})

	return ReportView;
  
});