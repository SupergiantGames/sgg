/*
Groove.createTicket(params, callback);
where:

params[email] - end user email
params[name] - end user name
params[about] - end user about, this information will be visible when you're either chatting with the end user or responding to his ticket on the right sidebar below his name and email
params[subject] - ticket subject
params[labels] - ticket labels string, labels must be separated with comma
params[message] - ticket message
callback - function that will be called with a ticket JSON rsponse as a parameter
*/

var grooveOnLoad = function () {
  $('form.groove').on('submit', function (event) {
    event.preventDefault();

    var $form = $(this);

    var params = {};
    $.each($form.serializeArray(), function(_, kv) {
      params[kv.name] = kv.value;
    });

    // Groove API blows up if you don't have any params.
    if (!params.name && !params.email && !params.subject && !params.message) {
      return;
    }

    $form.find('input, textarea').attr('disabled', 'disabled');

    $form.find('.wy-control-group-error').removeClass('wy-control-group-error');
    $form.find('.wy-form-message').remove();

    Groove.createTicket(params, function (request) {
      var response = JSON.parse(request.response);

      if (response.errors) {

        $.each(response.errors, function (field, errors) {
          var $field = $form.find('.groove-' + field);
          $field.addClass('wy-control-group-error');
          $.each(errors, function (index, error) {
            $('<div class="wy-form-message">').appendTo($field).text(error);
          });
        });

        $form.find('input, textarea').removeAttr('disabled');

      } else {
        $form.hide();
        $('.groove-alert.wy-alert-success').show();
      }

    });
  });
};

var grooveid = 'supergiantgames';
var groovekey = '7e4e369e-536d-4b5d-87ef-9e9ef9827870';

// var grooveid = 'gpbmike';
// var groovekey = '5234a268-4b6f-4d2a-b701-ecd332d644f9';

(function() {var s=document.createElement('script'); s.type='text/javascript';s.async=true;
s.src=('https:'==document.location.protocol?'https':'http') + '://' + grooveid + '.groovehq.com/widgets/' + groovekey + '/ticket/api.js';
var q = document.getElementsByTagName('script')[0];q.parentNode.insertBefore(s, q);})();
