define([
	'backbone',
	'views/base/ListView',
	'constant',
], function(Backbone, ListView, Const){

	var AccordionListView = ListView.extend({
		collapseSelected: function () {
			var id = this.collection.getCollapseId();
			if(id)
				this.$el.find('.collapse-trigger[data-id="'+id+'"]').trigger('click');
		},
		
		toggleAccordionAndRequestACollection: function (triggerElement, collapsibleIdPre, AccordionCollection, successCallBack, errorCallBack) {
			var thisObj = this;
			var id = $(triggerElement).attr('data-id');
			var collapsibleId = collapsibleIdPre+id;
			
			if(!$('#'+collapsibleId).hasClass('in')) {
				var thisId = id;
				this.collection.setCollapseLatestId(id);
				
				$(triggerElement).find('.throbber_wrap').show();
				var accordionCollection = new AccordionCollection(id);
				accordionCollection.on('sync', function() {
					thisObj.collection.setCollapseId(id);
					$(triggerElement).find('.throbber_wrap').hide();
					// console.log(thisId+' == '+thisObj.collection.getCollapseLatestId());
					if(thisId == thisObj.collection.getCollapseLatestId() && thisObj.subContainerExist()) {
						if(thisObj.isFunction(successCallBack))
							successCallBack(this, id);
						
						$('#'+collapsibleId).closest('tbody').find('.list-view-collapse.collapse.in').collapse('toggle');
						$('.accordion-list-cont tr').find('.accordion-carret').removeClass('fa-angle-down').addClass('fa-angle-right');
						$('#'+collapsibleId).collapse('toggle');
						$('.accordion-list-cont tr.collapse-trigger[data-id="'+id+'"]').find('.accordion-carret').removeClass('fa-angle-right').addClass('fa-angle-down');
					}
					this.off('sync');
				});
				
				accordionCollection.on('error', function() {
					if(thisObj.isFunction(errorCallBack))
						errorCallBack();
					$(triggerElement).find('.throbber_wrap').hide();
					this.off('error');
				});
				accordionCollection.getModels();
			}
			else {
				this.collection.setCollapseId(null);
				$('#'+collapsibleId).collapse('toggle');
				$(triggerElement).find('.accordion-carret').removeClass('fa-angle-down').addClass('fa-angle-right');
			}
		},
		
		toggleAccordionNormal: function (triggerElement, collapsibleIdPre) {
			var thisObj = this;
			var id = $(triggerElement).attr('data-id');
			var collapsibleId = collapsibleIdPre+id;
			
			if(!$('#'+collapsibleId).hasClass('in')) { console.log('toggleAccordionNormal:if');
				var thisId = id;
				thisObj.collection.setCollapseId(id);
				
				$('#'+collapsibleId).closest('tbody').find('.list-view-collapse.collapse.in').collapse('toggle');
				$('.accordion-list-cont tr').find('.accordion-carret').removeClass('fa-angle-down').addClass('fa-angle-right');
				$('#'+collapsibleId).collapse('toggle');
				$('.accordion-list-cont tr.collapse-trigger[data-id="'+id+'"]').find('.accordion-carret').removeClass('fa-angle-right').addClass('fa-angle-down');
			}
			else { console.log('toggleAccordionNormal:else');
				this.collection.setCollapseId(null);
				$('#'+collapsibleId).collapse('toggle');
				$(triggerElement).find('.accordion-carret').removeClass('fa-angle-down').addClass('fa-angle-right');
			}
		},
	});

  return AccordionListView;
  
});