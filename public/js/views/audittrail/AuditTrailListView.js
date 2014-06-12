define([
	'backbone',
	'views/base/AppView',
	'collections/audittrail/AuditTrailCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/audittrail/auditTrailListTemplate.html',
	'text!templates/audittrail/auditTrailInnerListTemplate.html',
	'constant',
], function(Backbone, AppView, AuditTrailCollection, contentTemplate, auditTrailListTemplate, auditTrailInnerListTemplate, Const){

	var AuditTrailListView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(options) {
			this.initSubContainer();
			var thisObj = this;
			
			this.collection = new AuditTrailCollection();
			this.collection.on('sync', function() {
				//console.log('collection.on.sync')
				thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				//console.log('collection.on.error')
				//console.log(collection);
				//console.log(response);
				//console.log(options);
				this.off('error');
			});
			
			if(options.table != null)
				this.collection.options.show.type = options.table;
				
			if(options.id != null)
				this.collection.options.show.id = options.id;
		},
		
		render: function(){
			this.displayAuditTrail();
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(this.collection.options.currentPage , Const.MAXITEMPERPAGE);
			Backbone.View.prototype.refreshTitle('Audit Trail','list');
		},
		
		displayAuditTrail: function () {
			var innerTemplate = _.template(auditTrailListTemplate, {});
			
			var variables = {
				h1_title: "Audit Trail",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
		displayList: function () {
			var data = {
				audittrail_url: '#/'+Const.URL.AUDITTRAIL,
				audittrail: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(auditTrailInnerListTemplate, data);
			this.subContainer.find("#audit-trail-list tbody").html(innerListTemplate);
			
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
						
					$('.pagination .last-page').parent().before('<li'+active+'><a class="page-number" href="#" data-pagenum="'+i+'">'+i+activeValue+'</a></li>');
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
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.options.maxItem / Const.MAXITEMPERPAGE);
			if(this.collection.options.currentPage != lastPage) {
				this.collection.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.options.currentPage != page) {
				this.collection.options.currentPage = page;
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE);
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
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
		},
	});

  return AuditTrailListView;
  
});