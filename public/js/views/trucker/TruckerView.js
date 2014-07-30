define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trucker/truckerViewTemplate.html',
	'models/trucker/TruckerModel',
	'constant'
], function(Backbone, AppView, contentTemplate, truckerViewTemplate, TruckerModel, Const){

	var TruckerView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
            this.truckerId = option.id;
			var thisObj = this;
			
			this.model = new TruckerModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist())
					thisObj.displayTrucker();
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Truckers','view');
		},
		
		displayTrucker: function () {
			var innerTemplateVariables = {
                _: _,
				trucker:this.model,
				trucker_url:'#/'+Const.URL.TRUCKER,
				trucker_edit_url:'#/'+Const.URL.TRUCKER+'/'+Const.CRUD.EDIT
			};
            
            _.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
            
			var innerTemplate = _.template(truckerViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.model.get('name'),
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this trucker?',
										'confirm-delete-trucker',
										'Delete');
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
            'click #delete-trucker': 'showDeleteConfirmationWindow',
			'click #confirm-delete-trucker': 'deleteTrucker',
		},
        
        showDeleteConfirmationWindow: function () {
			this.showConfirmationWindow();
		},
		
		deleteTrucker: function (){
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    //Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth()
            });
		}
	});

	return TruckerView;
  
});