define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contract/contractViewTemplate.html',
	'models/contract/ContractModel',
	'global',
	'constant'
], function(Backbone, AppView, contentTemplate, contractViewTemplate, ContractModel, Global, Const){

	var ContractView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
            this.contractId = option.id;
			var thisObj = this;
			
			this.model = new ContractModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist())
					thisObj.displayContract();
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Contracts','view');
		},
		
		displayContract: function () {
            // Format dates
            if(this.model.get('contract_date_start'))
                this.model.set('contract_date_start', this.convertDateFormat(this.model.get('contract_date_start').split(' ')[0], 'yyyy-mm-dd', this.dateFormat, '-'));
            if(this.model.get('contract_date_end'))
                this.model.set('contract_date_end', this.convertDateFormat(this.model.get('contract_date_end').split(' ')[0], 'yyyy-mm-dd', this.dateFormat, '-'));
            
            // Get total tons and bales
            var products = this.model.get("products");
            
            var total_tons = 0.0;
            _.each(products, function(product) {
                total_tons = total_tons + parseFloat(product.pivot.tons);
            });
            
            var total_bales = 0;
            _.each(products, function(product) {
                total_bales = total_bales + product.pivot.bales;
            });
            
			var innerTemplateVariables = {
				contract:this.model,
				contract_url:'#/'+Const.URL.CONTRACT,
				contract_edit_url:'#/'+Const.URL.CONTRACT+'/'+Const.CRUD.EDIT,
                total_tons: total_tons.toFixed(4),
                total_bales: total_bales
			};
            
			var innerTemplate = _.template(contractViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.model.get('name'),
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this contract?',
										'confirm-delete-contract',
										'Delete');
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #close-contract': 'closeContract',
			'click #confirm-close-contract': 'closeContract'
		},
		
		closeContract: function (){
			var thisObj = this;
            
            this.model.setCloseURL();
            
            this.model.save(null, {
                success: function(model, response, options) {
                    var contractId = model.get('id');
                    var contractModel = new ContractModel({id:contractId});
                    
                    contractModel.fetch({
                        success: function(contract) {
                            $('#view-contract .status').html(contract.get('status').name);
                            Global.getGlobalVars().app_router.navigate(Const.URL.CONTRACT, {trigger: true});
                        },
                        wait: true,
                        headers: thisObj.model.getAuth()
                    });
                        
                    thisObj.displayMessage(response);
                },
                error: function(model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: this.model.getAuth()
            });
		},
        
        openContract: function (){
			var thisObj = this;
            
            this.model.setOpenURL();
            
            this.model.save(null, {
                success: function(model, response, options) {
                    thisObj.displayMessage(response);
                },
                error: function(model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: this.model.getAuth()
            });
		}
	});

	return ContractView;
  
});