$(function(){
  /*Return to top*/
  var offset = 220;
  var duration = 500;
  var button = $('<a href="#" class="back-to-top"><i class="fa fa-angle-up"></i></a>');
  button.appendTo("body");

  jQuery(window).scroll(function() {
  if (jQuery(this).scrollTop() > offset) {
    jQuery('.back-to-top').fadeIn(duration);
  } else {
    jQuery('.back-to-top').fadeOut(duration);
  }
  });

  jQuery('.back-to-top').click(function(event) {
    event.preventDefault();
    jQuery('html, body').animate({scrollTop: 0}, duration);
    return false;
  });
});