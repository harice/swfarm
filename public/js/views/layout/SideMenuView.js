define([
	'backbone',
	'text!templates/layout/sideMenuTemplate.html',
	'constant',
	'models/session/SessionModel',
	'jquerynanoscroller',
	'jquerypushmenu'
], function(Backbone, SideMenuTemplate, Const, Session, nanoScroller, jPushMenu){

	var SideMenuView = Backbone.View.extend({
		el: $("#cl-sidebar"),

		initialize: function() {
			_.bindAll(this,'sidebarCollapse','sideMenuToggle','sideParentMenu','showSideMenu');
		},
		
		render: function(){
			var innerTemplateVariables = {
				token			: Session.get('token'),
				permission		: Session.get('permission').split(',').map(Number),
				su				: parseInt(Session.get('su')),
				constant		: Const
			};

			var compiledTemplate = _.template(SideMenuTemplate, innerTemplateVariables);
			this.$el.html(compiledTemplate);
		},

		events: {
			'click #sidebar-collapse' : 'sidebarCollapse',
			'click ul.cl-vnavigation li a' : 'sideParentMenu',
			'click .parent a' : 'sideMenuToggle',
			'click .cl-toggle' : 'showSideMenu'
		},

		sidebarCollapse: function(e) {
			var b = $("#sidebar-collapse")[0];
		    var w = $("#cl-wrapper");
		    var s = $(".cl-sidebar");
		    
		    if(w.hasClass("sb-collapsed")){
		      $(".fa",b).addClass("fa-angle-left").removeClass("fa-angle-right");
		      w.removeClass("sb-collapsed");
		    }else{
		      $(".fa",b).removeClass("fa-angle-left").addClass("fa-angle-right");
		      w.addClass("sb-collapsed");
		    }
		},

		sideParentMenu: function(e) {
			if(!$(e.currentTarget).closest('li').hasClass('parent')) {
				$("ul.cl-vnavigation li").removeClass('active');
				$(e.currentTarget).closest('li').addClass('active');
			}
		},

		sideMenuToggle: function(e) {
			if(!$("#cl-wrapper").hasClass('sb-collapsed')) {
				if($(e.currentTarget).parent().hasClass('open')) {
					$(e.currentTarget).parent().find("ul").slideUp(300, 'swing',function(){
			           $(e.currentTarget).parent().removeClass("open");
			        });
				} else {
					var ul = $(e.currentTarget).parent().find("ul");
			        ul.slideToggle(300, 'swing', function () {
			          $(e.currentTarget).parent().addClass('open');
			        	$("#cl-wrapper .nscroller").nanoScroller({ preventPageScrolling: true });
			        });
			    }

			    if(!$(e.currentTarget).closest('li').closest('ul').hasClass('sub-menu'))
			    	e.preventDefault();
			} else {
				e.preventDefault();
			}
		},

		showSideMenu: function(e) {
			var ul = $(".cl-vnavigation");
	        ul.slideToggle(300, 'swing', function () {});
	        e.preventDefault();
		}

	});

  return SideMenuView;
  
});