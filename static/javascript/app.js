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
  $('.slide-store').slick({
    infinite: true,
    arrows: false,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 3,
      responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
});
