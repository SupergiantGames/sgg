$(document).ready(function() {
  $('.gallery a, figure a, .media a').fluidbox();
  $('#scene').parallax({
      limitY: 20,
      limitX: 50,
  });
});
