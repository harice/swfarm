define([
	'backbone',	
	'views/base/AccordionListView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountViewTemplate.html',
	'text!templates/account/tabsAccountTypesTemplate.html',
	'text!templates/account/scaleListTemplate.html',
	'text!templates/account/scaleInnerListTemplate.html',
	'text!templates/account/trailerListTemplate.html',
	'text!templates/account/trailerInnerListTemplate.html',
	'text!templates/account/truckerListTemplate.html',
	'text!templates/account/truckerInnerListTemplate.html',
	'text!templates/account/locationListTemplate.html',
	'text!templates/account/locationInnerListTemplate.html',
	'text!templates/account/contactListTemplate.html',
	'text!templates/account/contactInnerListTemplate.html',
	'models/account/AccountModel',
	'collections/scale/ScaleCollection',
	'collections/account/TrailerCollection',
	'collections/trucker/TruckerCollection',
	'collections/stack/LocationCollection',
	'collections/contact/ContactCollection',
	'global',
	'constant',
], function(
	Backbone, 
	AccordionListView, 
	contentTemplate, 
	accountViewTemplate, 
	tabsAccountTypesTemplate, 
	scaleListTemplate, 
	scaleInnerListTemplate, 
	trailerListTemplate,
	trailerInnerListTemplate,
	truckerListTemplate,
	truckerInnerListTemplate,
	locationListTemplate,
	locationInnerListTemplate,
	contactListTemplate,
	contactInnerListTemplate,
	AccountModel, 
	ScaleCollection, 
	TrailerCollection, 
	TruckerCollection,
	LocationCollection,
	ContactCollection,
	Global, 
	Const
){

	var AccountView = AccordionListView.extend({
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
			this.generateAccountTabPanes();
		},	

		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-account': 'showDeleteConfirmationWindow',
			'click #confirm-delete-account': 'deleteAccount',
			'click .account-tab': 'stopRedirect',
		},	

		stopRedirect: function(ev){
			ev.preventDefault();			
		},

		generateAccountTypesTabs: function(){
			var selectedIndex = 1;
			var url = '/#/' + Const.URL.ACCOUNT + '/' + this.model.get('id')+'#';	
			var tabs = [];

			//Push contacts tab first
			tabs.push({'url': url + 'contacts', 'label': 'Contacts'});

			_.each(this.model.get('accounttype'), function(type){
				var name = (type.name).replace(/\s+/g, '_').toLowerCase();
				if(type.id == Const.ACCOUNT.ADMIN.SCALE || type.id == Const.ACCOUNT.ADMIN.WAREHOUSE || type.id == Const.ACCOUNT.ADMIN.TRAILER || type.id == Const.ACCOUNT.ADMIN.TRUCKER)
					tabs.push({'url': url + name, 'label': type.name});
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

		generateAccountTabPanes: function(){
			var thisObj = this;
			var accountTypes = this.model.get('accounttype');	

			//Populate Contacts Tab Pane
			this.getContacts(this.model.get('id'));		

			_.each(accountTypes, function(type){
				var name = (type.name).replace(/\s+/g, '_').toLowerCase();
				switch(type.id){
					case 6:
						thisObj.getScaleProviders(name);
						break;
					case 7:
						thisObj.getTrailers(name);
						break;
					case 9:
						thisObj.getTruckers(name);
						break;
					case 10:
						thisObj.getStackLocation(name);
						break;
				}
			});

			this.subContainer.find(".tab-pane:first-child").addClass("in active");
		},

		getStackLocation: function(name){
			var thisObj = this;
			var locationCollection = new LocationCollection();
			locationCollection.getLocationByAccount(this.model.get('id'));

			var variables = {
				type_name: name
			};
			var listTemplate = _.template(locationListTemplate, variables);
			$('#account-tabpanes').append(listTemplate);

			locationCollection.on('sync', function(){
				var data = {
					accountName: thisObj.model.get('name'),
	                sl_url: '#/'+Const.URL.STACKLOCATION,
					sl_edit_url: '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.EDIT,
					sls: this.models,
					collapsible_id: Const.STACKLOCATION.COLLAPSIBLE.ID,
					_: _ 
				};	
				
				var innerListTemplate = _.template(locationInnerListTemplate, data);							
				thisObj.subContainer.find("#sl-list tbody").html(innerListTemplate);
				
				var id = this.getCollapseId();
				if(id){
					this.$el.find('.collapse-trigger[data-id="'+id+'"]').trigger('click');
				}				

				this.off('sync');
			});	
		},

		getTruckers: function(name){
			var thisObj = this;
			var truckerCollection = new TruckerCollection();
			truckerCollection.getTruckerNumbersByAccount(this.model.get('id'));

			var variables = {
				type_name: name
			};
			var listTemplate = _.template(truckerListTemplate, variables);
			$('#account-tabpanes').append(listTemplate);

			truckerCollection.on('sync', function(){
				var data = {
					accountName: thisObj.model.get('name'),
	                trucker_url: '#/'+Const.URL.TRUCKER,
					trucker_edit_url: '#/'+Const.URL.TRUCKER+'/'+Const.CRUD.EDIT,
					truckers: this.models,
					truckertypes: Const.ACCOUNT.TRUCKERS,
					_: _ 
				};	

				_.extend(data,Backbone.View.prototype.helpers);			
				
				var innerListTemplate = _.template(truckerInnerListTemplate, data);							
				thisObj.subContainer.find("#trucker-list tbody").html(innerListTemplate);

				this.off('sync');
			});		
		},	

		getTrailers: function(name){
			var thisObj = this;
			var trailerCollection = new TrailerCollection();
			trailerCollection.getTrailerByAccountId(this.model.get('id'));

			var variables = {
				type_name: name
			};
			var listTemplate = _.template(trailerListTemplate, variables);
			$('#account-tabpanes').append(listTemplate);

			trailerCollection.on('sync', function(){
				var data = {
					accountName: thisObj.model.get('name'),
	                trailer_url: '#/'+Const.URL.TRAILER,
					trailer_edit_url: '#/'+Const.URL.TRAILER+'/'+Const.CRUD.EDIT,
					trailers: this.models,
					_: _ 
				};				
				
				var innerListTemplate = _.template(trailerInnerListTemplate, data);							
				thisObj.subContainer.find("#trailer-list tbody").html(innerListTemplate);

				this.off('sync');
			});		
		},		

		getScaleProviders: function(name){
			var thisObj = this;
			var scaleCollection = new ScaleCollection();
			scaleCollection.getScalesByAccount(this.model.get('id'));

			var variables = {
				type_name: name
			};
			var listTemplate = _.template(scaleListTemplate, variables);
			$('#account-tabpanes').append(listTemplate);

			scaleCollection.on('sync', function(){
				var data = {
					accountName: thisObj.model.get('name'),
	                scale_url: '#/'+Const.URL.SCALE,
					scale_edit_url: '#/'+Const.URL.SCALE+'/'+Const.CRUD.EDIT,
					scales: this.models,
					_: _ 
				};				
				
				var innerListTemplate = _.template(scaleInnerListTemplate, data);							
				thisObj.subContainer.find("#scale-list tbody").html(innerListTemplate);

				this.off('sync');
			});	
		},						

		getContacts: function(id){
			var thisObj = this;
			var contactCollection = new ContactCollection();
			contactCollection.getContactsByAccountId(id);			

			var variables = {
				type_name: name
			};
			var listTemplate = _.template(contactListTemplate, variables);
			$('#account-tabpanes').append(listTemplate);

			contactCollection.on('sync', function(){
				var data = {
					accountName: thisObj.model.get('name'),
	                contact_url: '#/'+Const.URL.CONTACT,
					contact_edit_url: '#/'+Const.URL.CONTACT+'/'+Const.CRUD.EDIT,
					account_url: '#/'+Const.URL.ACCOUNT,
					contacts: this.models,
					_: _ 
				};					
				
				var innerListTemplate = _.template(contactInnerListTemplate, data);							
				thisObj.subContainer.find("#contact-list tbody").html(innerListTemplate);

				thisObj.generatePagination(this, this.length);
				this.off('sync');
			});				
		},	

		generatePagination: function (collection, maxItem) {	
			if(maxItem == null)
				var maxItem = collection.getMaxItem();
			else
				collection.setMaxItem(maxItem);

			if(maxItemPerPage == null)
				var maxItemPerPage = collection.getNumPerPage();
			
			$('.page-number').remove();
			
			var lastPage = Math.ceil(maxItem / maxItemPerPage);
			
			$('#perpage').val(collection.listView.numPerPage);			
			
			if(maxItem > 15)
				$('.display-items').show();
			
			if(lastPage > 1) {
				$('.pagination').show();
				//$('.display-items').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == collection.getCurrentPage()) {
						active = ' class="active"';
						activeValue = ' <span class="sr-only">(current)</span>';
					}

					if(collection.getCurrentPage() == lastPage) {
						$('.pagination .next-page').addClass('disabled');
						$('.pagination .last-page').addClass('disabled');
					} else {
						$('.pagination .next-page').removeClass('disabled');
						$('.pagination .last-page').removeClass('disabled');
					}

					if(collection.getCurrentPage() == 1) {
						$('.pagination .prev-page').addClass('disabled');
						$('.pagination .first-page').addClass('disabled');
					} else {
						$('.pagination .prev-page').removeClass('disabled');
						$('.pagination .first-page').removeClass('disabled');
					}
						
					$('.pagination .next-page').parent().before('<li'+active+'><a class="page-number" href="#" data-pagenum="'+i+'">'+i+activeValue+'</a></li>');
				}
			}
			else {
				$('.pagination').hide();
				// $('.display-items').hide();
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