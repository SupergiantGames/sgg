'use strict';

var utils = require('./utils.js');
var _ = require('lodash');

var slugger = require('uslug');

/**
 * Defines a set of functions usable in all swig templates, are merged into context on render
 * @param  {Object}   swig        Swig engine
 */
module.exports.swigFunctions = function(swig) {

  var self = this;

  this.context = {};
  this.data = {};
  this.settings = {};
  this.typeInfo = {};

  this.paginate = false;
  this.curPage = 1;
  this.maxPage = -1;
  this.pageUrl = 'page-';
  this.paginationBaseUrl = null;
  this.cachedData = {};
  this.CURRENT_URL = '/';

  /**
   * Returns a standard url for a given object, only works for standard scaffolding url structure
   * @param  {Object}   object     Object to generate url for
   * @returns {String}   Url for the object passed in
   */
  var url = function(object) {
    if(typeof object === 'string') {
      object = { slug: object, name: object };
    }

    var slug = object.slug ? object.slug : (object.name ? slugger(object.name).toLowerCase() : null);
    var prefix = object._type ? object._type : '';

    if(object._type) {
      if(self.typeInfo[object._type] && self.typeInfo[object._type].customUrls &&  self.typeInfo[object._type].customUrls.individualUrl) {
        prefix = utils.parseCustomUrl(self.typeInfo[object._type].customUrls.individualUrl, object);
      }
    } else {
      if(self.typeInfo[object.slug] && self.typeInfo[object.slug].customUrls && self.typeInfo[object.slug].customUrls.listUrl) {
        slug = self.typeInfo[object.slug].customUrls.listUrl;
      }
    }

    var url = '';
    if(prefix) {
      url = '/' + prefix + '/' + slug + '/';
    } else {
      url = '/' + slug + '/';
    }

    return url;
  };

  /**
   * Sets the data set used by all the functions in this class
   * @param  {Object}   data   The data to be used by all functions in this class
   */
  this.setData = function(data) {
    self.cachedData = {};
    self.data = data;
  };

  /**
   * Sets the type info used by all the functions in this class
   * @param  {Object}   typeInfo   The type info to be used by all functions in this class
   */
  this.setTypeInfo = function(typeInfo) {
    self.typeInfo = typeInfo;
  };

  /**
   * Sets the settings used by all the functions in this class
   * @param  {Object}   settings   The settings to be used by all functions in this class
   */
  this.setSettings = function(settings) {
    self.settings = settings;
  };

  /**
   * Returns all content types for a given site
   * @returns  {Array}  An array of type object (slug and name of type)
   */
  var getTypes = function(returnOneOffs) {
    var types = [];

    for(var key in self.typeInfo) {
      if(returnOneOffs || !self.typeInfo[key].oneOff) {
        types.push({ slug: key, name: self.typeInfo[key].name });
      }
    }

    return types;
  };

  /**
   * Returns a published item based off its type and id or a relation string from the CMS
   * @param    {String} Can either be a relation string (from the CMS) or a type name
   * @param    {String} (OPTIONAL) If the first parameter was the type, this must be the ID of the item
   * @returns  {Object} The published item specified by the type/id or relation string passed in
   */
  var getItem = function(type, key) {
    if(!type) {
      return {};
    }

    if(!key) {
      if(Array.isArray(type)) {
        if(type.length > 0) {
          type = type[0];
        } else {
          return {};
        }
      }
      var parts = type.split(" ", 2);
      if(parts.length !== 2) {
        return {};
      }

      type = parts[0];
      key = parts[1];
    }
    
    if(!self.typeInfo[type]) {
      return {};
    }

    var item = self.data[type][key];

    if(!item) {
      return {};
    }

    if(!self.typeInfo[type].oneOff) {
      if(!item.publish_date) {
        return {};
      }

      var now = Date.now();
      var pdate = Date.parse(item.publish_date);

      if(pdate > now + (1 * 60 * 1000)) {
        return {};
      }
    }

    item._type = type;
    return item;
  };

  /**
   * Returns an array of items from a relation
   * @param    {Array}  An array of relation strings from the CMS
   * @returns  {Array}  All published items specified by relation strings
   */
  var getItems = function(arr) {
    if(!arr) {
      return [];
    }
    var items = [];
    arr.forEach(function(itm) {
      var obj = getItem(itm);
      if(!_.isEmpty(obj)) {
        items.push(getItem(itm));
      }
    });

    return items;
  }

  var generatedSlugs = {};
  var generateSlug = function(value) {
    if(!generatedSlugs[value._type]) {
      generatedSlugs[value._type] = {};
    }

    if(value.slug) {
      generatedSlugs[value._type][value.slug] = true;
      return value.slug;
    }

    var tmpSlug = slugger(value.name).toLowerCase();

    var no = 2;
    while(generatedSlugs[value._type][tmpSlug]) {
      tmpSlug = slugger(value.name).toLowerCase() + '_' + no;
      no++;
    }

    generatedSlugs[value._type][tmpSlug] = true;

    return tmpSlug;
  }

  /**
   * Returns all the data specified by the arguments
   * @param    {String} Name of type to retrieve data for
   * @param    {String} (optional) Other type to return with this data, can specifiy as many types as needed
   * @returns  {Array}  All items from type (or types)
   */
  var getCombined = function() {
    var names = [].slice.call(arguments, 0);

    if(self.cachedData[names.join(',')])
    {
      return self.cachedData[names.join(',')];
    }

    // TODO, SLUG NAME THE SAME WAS CMS DOES

    generatedSlugs = {};
    var data = [];
    names.forEach(function(name) {
      var tempData = self.data[name] || {};

      if(self.typeInfo[name] && self.typeInfo[name].oneOff) {
        data = tempData;
        return;
      }

      tempData = _.omit(tempData, function(value, key) { return key.indexOf('_') === 0; });

      var no = 1;
      // convert it into an array
      tempData = _.map(tempData, function(value, key) { 
        var tmpSlug = "";

        value._id = key; 
        value._type = name; 

        if(value.name)  {
          value.slug = generateSlug(value); 
        }

        return value;
      });
      tempData = _.filter(tempData, function(item) { 
        if(!item.publish_date) {
          return false;
        }

        var now = Date.now();
        var pdate = Date.parse(item.publish_date);

        if(pdate > now + (1 * 60 * 1000)) {
          return false;
        }

        return true;
      });

      data = data.concat(tempData);
    });

    
    self.cachedData[names.join(',')] = data;

    return data;
  };

  var paginate = function(data, perPage, pageName) {
    if(self.curPage === 1 && self.paginate === true)
    {
      throw new Error('Can only paginate one set of data in a template.');
    }

    var items = utils.slice(data, perPage, perPage * (self.curPage-1));
    self.paginate = true;

    if(self.paginationBaseUrl === null) {
      self.paginationBaseUrl = self.CURRENT_URL;
    }

    self.pageUrl = pageName || self.pageUrl;
    self.maxPage = Math.ceil(_(data).size() / perPage);

    return items;
  };

  var getCurPage = function() {
    return self.curPage;
  };

  var getMaxPage = function() {
    return self.maxPage;
  };

  var getPageUrl = function(pageNum) {
    if(pageNum == 1) {
      return self.paginationBaseUrl;
    }

    return self.paginationBaseUrl + self.pageUrl + pageNum + '/';
  };

  var getCurrentUrl = function() {
    return self.CURRENT_URL;
  };

  var getSetting = function(key) {
    if(!self.settings.general) {
      return null;
    }

    return self.settings.general[key];
  };

  var randomElement = function(array) {
    if(!array || !_.isArray(array)) {
      return null;
    }

    var index = [Math.floor(Math.random() * array.length)];
    return array[index];
  };

  var sortItems = function(input, property, reverse) {

    if(_.size(input) === 0) {
      return input;
    }

    var first = input[0];
    var sortProperty = '_sort_' + property;

    if(first[sortProperty]) {
      property = sortProperty;
    }

    if(reverse) {
      return _.sortBy(input, property).reverse();
    }
    
    return _.sortBy(input, property)
  };

  var nextItem = function(item, sort_name, reverse_sort) {
    var type = item._type;
    var items = getCombined(type);

    if(sort_name) {
      items = sortItems(items, sort_name, reverse_sort);
    }

    var nextItem = null;
    var previousItem = null;

    items.some(function(itm) {
      if(previousItem && previousItem._id == item._id) {
        nextItem = itm;
        return true;
      }

      previousItem = itm;
    });

    return nextItem;
  };

  var prevItem = function(item, sort_name, reverse_sort) {
    var type = item._type;
    var items = getCombined(type);

    if(sort_name) {
      items = sortItems(items, sort_name, reverse_sort);
    }

    var returnItem = null;
    var previousItem = null;

    items.some(function(itm) {
      if(itm._id == item._id) {
        returnItem = previousItem;
        return true;
      }

      previousItem = itm;
    });

    return returnItem;
  };

  var merge = function() {
    var arrs = [].slice.call(arguments, 0);

    var newArr = [];

    arrs.forEach(function(arr) {
      newArr = newArr.concat(arr);
    })

    return newArr;
  }

  // FUNCTIONS USED FOR PAGINATION HELPING, IGNORE FOR MOST CASES
  this.shouldPaginate = function() {
    return self.curPage <= self.maxPage;
  };

  // Reset initial data
  this.init = function() {
    self.paginate = false;
    self.curPage = 1;
    self.pageUrl = 'page-'
    self.maxPage = -1;
    self.paginationBaseUrl = null;
  };

  this.increasePage = function() {
    self.curPage = self.curPage + 1;
  };
  
  this.setParams = function(params) {
    for(var key in params) {
      self[key] = params[key];
    }
  };

  this.getFunctions = function() {
    return {
      get: getCombined,
      getItem: getItem,
      getItems: getItems,
      getTypes: getTypes,
      paginate: paginate,
      getCurPage: getCurPage,
      getMaxPage: getMaxPage,
      getPageUrl: getPageUrl,
      url: url,
      getCurrentUrl: getCurrentUrl,
      getSetting: getSetting,
      random: randomElement,
      cmsVersion: 'v2',
      merge: merge,
      nextItem: nextItem,
      prevItem: prevItem
    };
  };


  return this;
};