/*
 * Webhook Affix
 * https://github.com/webhook/webhook-js
 *
 * Copyright (c) 2013
 * Licensed under the MIT license.
 */

(function ($) {

  "use strict";

  var Affix = function (element, options) {
    this.init(element, options);
  };

  Affix.prototype = {
    init: function (element, options) {
      this.$element = $(element);
      this.options  = this.getOptions(options);
      this.$window  = $(window);

      if (!this.options.offset.top) {
        this.options.offset.top = this.$element.offset().top - 10;
      }

      this.$window.on({
        'scroll.affix': $.proxy(this.checkPosition, this),
        'click.affix': $.proxy(function () {
          setTimeout($.proxy(this.checkPosition, this), 1);
        }, this)
      });

      this.initialwidth = this.$element.width() === this.$element.parent().width() ? 'auto' : this.$element.width();

      this.checkPosition();
    },

    getOptions: function (options) {
      return $.extend({}, $.fn.affix.defaults, this.$element.data(), options);
    },

    checkPosition: function () {

      if (!this.$element.is(':visible')) {
        return;
      }

      var scrollHeight = $(document).height(),
          scrollTop    = this.$window.scrollTop(),
          position     = this.$element.offset(),
          offset       = this.options.offset,
          offsetBottom = offset.bottom,
          offsetTop    = offset.top,
          reset        = 'wy-affix wy-affix-top wy-affix-bottom',
          affix;

      if (typeof offset !== 'object') {
        offsetBottom = offsetTop = offset;
      }

      if (typeof offsetTop === 'function') {
        offsetTop = offset.top();
      }

      if (typeof offsetBottom === 'function') {
        offsetBottom = offset.bottom();
      }

      if (this.$element.height() >= this.$window.height()) {
        affix = 'top';
      } else if (this.options.minWidth >= this.$window.width()) {
        affix = 'top';
      } else if (this.unpin !== null && (scrollTop + this.unpin <= position.top)) {
        affix = false;
      } else if (offsetBottom !== null && (position.top + this.$element.height() >= scrollHeight - offsetBottom)) {
        affix = 'bottom';
      } else if (offsetTop !== null && scrollTop <= offsetTop) {
        affix = 'top';
      } else {
        affix = false;
      }

      if (this.affixed === affix) {
        return;
      }

      this.$element.width(affix ? this.initialWidth : this.$element.width());

      this.affixed = affix;
      this.unpin = affix === 'bottom' ? position.top - scrollTop : null;

      this.$element.removeClass(reset).addClass('wy-affix' + (affix ? '-' + affix : ''));

      this.$element.trigger('affix', affix);
    }

  };


 /* AFFIX PLUGIN DEFINITION
  * ======================= */

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this),
          data    = $this.data('affix'),
          options = typeof option === 'object' && option;

      if (!data) {
        $this.data('affix', (data = new Affix(this, options)));
      }

      if (typeof option === 'string') {
        data[option]();
      }
    });
  };

  $.fn.affix.Constructor = Affix;

  $.fn.affix.defaults = {
    offset: {},
    minWidth: 480,
    minHeight: function () {

    }
  };


 /* AFFIX DATA-API
  * ============== */

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this),
          data = $spy.data();

      data.offset = data.offset || {};

      if (data.offsetBottom) {
        data.offset.bottom = data.offsetBottom;
      }

      if (data.offsetTop) {
        data.offset.top = data.offsetTop;
      }

      $spy.affix(data);
    });
  });

}(window.jQuery));
