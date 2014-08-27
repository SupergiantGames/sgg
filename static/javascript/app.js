$(document).ready(function() {
  $('.gallery a, figure a, .media a').fluidbox();
  $('#scene').parallax({
      limitY: 20,
      limitX: 50,
  });
  $("figure[data-type='video']").wrap("<div class='video-wrap'></div>");

  $(document).on('click', '.mobile-menu', function(Event) {
    $("nav ul li.mobile-li").toggle();
  });
});
