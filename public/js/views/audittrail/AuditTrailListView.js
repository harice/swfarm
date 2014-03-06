define([
	'backbone',
	'collections/audittrail/AuditTrailCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/audittrail/auditTrailListTemplate.html',
	'constant',
], function(Backbone, AuditTrailCollection, contentTemplate, auditTrailListTemplate, Const){

	var AuditTrailListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.collection = new AuditTrailCollection();
		},
		
		render: function(){
			this.displayAuditTrail();
			this.collection.options.currentPage = 1;
			this.collection.fetch();
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
		
	});

  return AuditTrailListView;
  
});