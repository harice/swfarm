define([
  'jquery',
  'backbone',
  'router',
  'collections/notification/NotificationCollection',
  'constant'
], function($, Backbone, Router, NotificationCollection, Const){

  var SessionModel = Backbone.Model.extend({
      
      url : '/apiv1/users/auth',
      notificationDone: true,

      initialize : function(){
          //Check for sessionStorage support
          if(Storage && sessionStorage){
              this.supportStorage = true;
          }
      },

      get : function(key){
          if(this.supportStorage){
              var data = sessionStorage.getItem(key);
              if(data && data[0] === '{'){
                  return JSON.parse(data);
              }else{
                  return data;
              }
          }else{
              return Backbone.Model.prototype.get.call(this, key);
          }
      },


      set : function(key, value){
          if(this.supportStorage){
              sessionStorage.setItem(key, value);
          }else{
              Backbone.Model.prototype.set.call(this, key, value);
          }
          return this;
      },

      unset : function(key){
          if(this.supportStorage){
              sessionStorage.removeItem(key);
          }else{
              Backbone.Model.prototype.unset.call(this, key);
          }
          return this;   
      },

      clear : function(){
          if(this.supportStorage){
              sessionStorage.clear();
          }else{
              Backbone.Model.prototype.clear(this);
          }
      },

      login : function(token){
          var that = this;
          var login = $.ajax({
              url : this.url,
              type : 'GET',
              headers : {
                  'Authorization' : 'Basic ' + token
              }
          });

          login.done(function(response){
              that.set('su', response.user.id);
              that.set('firstname', response.user.firstname);
              that.set('lastname', response.user.lastname);
              that.set('suffix', response.user.suffix);
              that.set('permission', response.permission);
              that.set('token', token);

              that.initNotificationLoop(response.user.id);

              if(that.get('redirectFrom')){
                var path = that.get('redirectFrom');
                that.unset('redirectFrom');
                Backbone.history.navigate(path, { trigger : true });
             }else{
                 Backbone.history.navigate('#/'+Const.URL.DASHBOARD, { trigger : true });
             }
          });
          
          login.fail(function(response,textStatus){
              Backbone.View.prototype.displayGritter('Login failed. Invalid Email Address and Password.', 'danger');
              Backbone.history.navigate('#/'+Const.URL.LOGIN, { trigger : true });
          });
      },

      initNotificationLoop: function(id) {
        var that = this;
        var count = 0;

        this.notificationCollection = new NotificationCollection();
        this.notificationCollection.on('sync', function() {
          that.notificationDone = true;
          console.log(this.models);
          if(!_.isEmpty(this.models)) {           
            count = this.models;            
            $(".notifications_menu").addClass("notified").find(".notification-count").text(count).show();
          }          
        });

        setInterval(function(){  
          console.log("Test1: ", that.notificationDone);        
          if(that.notificationDone == true) {
            that.notificationCollection.getNotificationCount(id);            
            that.notificationDone = false;
          }     console.log("Test2");
        }, 5000)
        
      }
  });

  return new SessionModel(); 
});