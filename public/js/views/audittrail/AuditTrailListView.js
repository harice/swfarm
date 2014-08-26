define([
	'backbone',
	'views/base/AppView',
	'collections/audittrail/AuditTrailCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/audittrail/auditTrailListTemplate.html',
	'constant',
], function(Backbone, AppView, AuditTrailCollection, contentTemplate, auditTrailListTemplate, Const){

	var AuditTrailListView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(options) {
			this.initSubContainer();
			var thisObj = this;
			
			this.collection = new AuditTrailCollection();
			this.collection.on('sync', function() {
				thisObj.displayAuditTrail();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			if(options.table != null)
				this.collection.options.show.type = options.table;
				
			if(options.id != null)
				this.collection.options.show.id = options.id;
		},
		
		render: function(){
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(this.collection.options.currentPage);
			Backbone.View.prototype.refreshTitle('Audit Trail','list');
		},
		
		displayAuditTrail: function () {
			var innerVar = {
				audittrail_url: '#/'+Const.URL.AUDITTRAIL,
				audit: this.collection.models,
				_: _ 
			};
			
			_.extend(innerVar,Backbone.View.prototype.helpers);

			var innerTemplate = _.template(auditTrailListTemplate, innerVar);
			
			var variables = {
				h1_title: "Audit Trail",
				sub_content_template: innerTemplate
			};

			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.generatePagination(this.collection.options.maxItem, Const.MAXITEMPERPAGE);
		},
		
		generatePagination: function (maxItem, maxItemPerPage) {
			$('.page-number').remove();
			
			var lastPage = Math.ceil(maxItem / maxItemPerPage);
			
			if(lastPage > 1) {
				$('.pagination').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == this.collection.options.currentPage) {
						active = ' class="active"';
						activeValue = ' <span class="sr-only">(current)</span>';
					}
						
					$('.pagination .next-page').parent().before('<li'+active+'><a class="page-number" href="#" data-pagenum="'+i+'">'+i+activeValue+'</a></li>');
				}
			}
			else {
				$('.pagination').hide();
			}
		},
		
		events: {
			'click .first-page' : 'gotoFirstPage',
			'click .last-page' : 'gotoLastPage',
			'click .page-number' : 'gotoPage',
			'click .sort-date' : 'sortDate',
		},
		
		gotoFirstPage: function () {
			if(this.collection.options.currentPage != 1) {
				this.collection.options.currentPage = 1;
				this.collection.getModelsPerPage(1);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.options.maxItem / Const.MAXITEMPERPAGE);
			if(this.collection.options.currentPage != lastPage) {
				this.collection.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.options.currentPage != page) {
				this.collection.options.currentPage = page;
				this.collection.getModelsPerPage(page);
			}
			
			return false;
		},
		
		sortDate: function () {
			this.sortByField('created_at');
		},
		
		sortByField: function (sortField) {
			if(this.collection.options.currentSort == sortField)
				this.collection.options.sort[sortField] = !this.collection.options.sort[sortField];
			
			this.collection.options.currentSort = sortField;
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(1);
		},
	});

  return AuditTrailListView;
  
});