define([
	'backbone',
	'collections/audittrail/AuditTrailCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/audittrail/auditTrailListTemplate.html',
	'text!templates/audittrail/auditTrailInnerListTemplate.html',
	'constant',
], function(Backbone, AuditTrailCollection, contentTemplate, auditTrailListTemplate, auditTrailInnerListTemplate, Const){

	var AuditTrailListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.collection = new AuditTrailCollection();
		},
		
		render: function(){
			this.displayAuditTrail();
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(this.collection.options.currentPage , Const.MAXITEMPERPAGE, this.displayList);//last
		},
		
		displayAuditTrail: function () {
			var innerTemplate = _.template(auditTrailListTemplate, {});
			
			var variables = {
				h1_title: "Audit Trail",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function (auditTrailCollection) {
			var data = {
				audittrail: auditTrailCollection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(auditTrailInnerListTemplate, data);
			$("#audit-trail-list tbody").html(innerListTemplate);
			
			$('.page-number').remove();
			var lastPage = Math.ceil(auditTrailCollection.options.maxItem / Const.MAXITEMPERPAGE);
			
			if(lastPage > 1) {
				$('.pagination').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == auditTrailCollection.options.currentPage) {
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
		},
		
		gotoFirstPage: function () {
			if(this.collection.options.currentPage != 1) {
				this.collection.options.currentPage = 1;
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.options.maxItem / Const.MAXITEMPERPAGE);
			if(this.collection.options.currentPage != lastPage) {
				this.collection.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.options.currentPage != page) {
				this.collection.options.currentPage = page;
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
	});

  return AuditTrailListView;
  
});