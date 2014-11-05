define([
	'backbone',	
	'views/base/ListView',
	'views/account/contactsAccountView',
	'views/account/warehouseAccountView',
	'views/account/truckersAccountView',
	'views/account/trailersAccountView',
	'views/account/scaleAccountView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountViewTemplate.html',
	'text!templates/account/tabsAccountTypesTemplate.html',	
	'models/account/AccountModel',	
	'global',
	'constant',
], function(
	Backbone, 
	ListView, 
	contactsAccountView,
	warehouseAccountView,
	truckersAccountView,
	trailersAccountView,
	scaleAccountView,
	contentTemplate, 
	accountViewTemplate, 
	tabsAccountTypesTemplate, 	
	AccountModel, 	
	Global, 
	Const
){

	var AccountView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;

			this.model = new AccountModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist()){
					thisObj.displayAccount();					
				}
				this.off("change");
			});			
		},

		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Accounts','view');
		},

		displayAccount: function () {
			//console.log(this.model);
			var innerTemplateVariables = {
				account:this.model,
				account_url:'#/'+Const.URL.ACCOUNT,
				account_edit_url:'#/'+Const.URL.ACCOUNT+'/'+Const.CRUD.EDIT,
				account_types: this.generateAccountTypesTabs()
			}
			var innerTemplate = _.template(accountViewTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.model.get('name'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initConfirmationWindow('Are you sure you want to delete this account?',
										'confirm-delete-account',
										'Delete',
                                        'Delete Account');

			//Show contacts tab on first Load
			this.getContacts(this.model.get('id'), this.model.get('name'));
		},	

		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-account': 'showDeleteConfirmationWindow',
			'click #confirm-delete-account': 'deleteAccount',
			'click .account-tab': 'generateAccountTabPanes',
		},			

		generateAccountTypesTabs: function(){
			var selectedIndex = 1;
			var tabs = [];

			//Push contacts tab first
			tabs.push({'name': 'contacts', 'label': 'Contacts'});

			_.each(this.model.get('accounttype'), function(type){
				var name = (type.name).replace(/\s+/g, '').toLowerCase();
				if(type.id == Const.ACCOUNT.ADMIN.SCALE || type.id == Const.ACCOUNT.ADMIN.WAREHOUSE || type.id == Const.ACCOUNT.ADMIN.TRAILER || type.id == Const.ACCOUNT.ADMIN.TRUCKER)
					tabs.push({'name': name, 'label': type.name});
			});			

			//First account type is active on first load
			tabs[0]['active'] = true;

			//console.log(tabs);
			return this.generateTypeTabs(tabs, '#/'+Const.URL.ACCOUNT, 'Back To Account List');
		},

		generateTypeTabs: function (tabsAttr, backURL, backLabel) {
			var variables = {tabs:tabsAttr};
			if(backURL != null && backLabel != null) {
				variables['back_url'] = backURL;
				variables['back_label'] = backLabel;
			}
			return _.template(tabsAccountTypesTemplate, variables);
		},

		generateAccountTabPanes: function(ev){
			ev.preventDefault();

			var thisObj = this;
			var type = $(ev.target).attr('data-name'); 
			var id = this.model.get('id');
			var name = this.model.get('name');

			switch(type){				
				case 'scaleprovider':
					thisObj.getScaleProviders(id, name);
					break;
				case 'southwestfarmstrucker':					
					thisObj.getTruckers(id, name);
					break;
				case 'trailer':
					thisObj.getTrailers(id, name);
					break;
				case 'warehouse':
					thisObj.getStackLocation(id, name);
					break;
				default:
					thisObj.getContacts(id, name);	
					break;
			}

			this.subContainer.find(".tab-pane:first-child").addClass("in active");
		},

		getStackLocation: function(id, name){
			this.closeView();
			this.currView = new warehouseAccountView({id: id, name: name});
			this.currView.setElement($("#account-tabpanes")).render();		
		},

		getTruckers: function(id, name){
			this.closeView();
			this.currView = new truckersAccountView({id: id, name: name});
			this.currView.setElement($("#account-tabpanes")).render();		
		},	

		getTrailers: function(id, name){
			this.closeView();
			this.currView = new trailersAccountView({id: id, name: name});
			this.currView.setElement($("#account-tabpanes")).render();		
		},		

		getScaleProviders: function(id, name){
			this.closeView();
			this.currView = new scaleAccountView({id: id, name: name});
			this.currView.setElement($("#account-tabpanes")).render();	
		},						

		getContacts: function(id, name){
			this.closeView();
			this.currView = new contactsAccountView({id: id, name: name});
			this.currView.setElement($("#account-tabpanes")).render();				
		},

		closeView: function () {
			if(this.currView) {
				this.currView.close();
			}
		},			

		showDeleteConfirmationWindow: function () {
			this.showConfirmationWindow();
		},

		deleteAccount: function (){
			var thisObj = this;

            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    console.log("Delete account");
                    //Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},
	});

	return AccountView;

});