$(document).ready(function() {
  $('.gallery a, figure a, .media a').fluidbox();
  $('#scene').parallax({
      limitY: 20,
      limitX: 50,
  });
  $("figure[data-type='video']").wrap("<div class='video-wrap'></div>");

  $(document).on('click', '.nav-mobile', function(Event) {
    $(".nav-wrap").toggleClass("active");
  });
  $('.slide-reviews').slick({
    infinite: true,
    arrows: false,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    vertical: true,
    autoplay: true,
    autoplaySpeed: 5000
  });
});
