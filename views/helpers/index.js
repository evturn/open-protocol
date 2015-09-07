var moment = require('moment'),
    _ = require('underscore'),
    hbs = require('handlebars');

module.exports = function() {

  var _helpers = {};


  // {{#ifeq keyToCheck data.myKey}}

  _helpers.ifeq = function(a, b, options) {
    if (a == b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  };

  //  @messages:[]
  //
  //  *Usage example:*
  //  `{{#if messages.warning}}
  //     <div class="alert alert-warning">
  //       {{{flashMessages messages.warning}}}
  //     </div>
  //   {{/if}}`

  _helpers.flashMessages = function(messages) {
    var output = '';
    for (var i = 0; i < messages.length; i++) {

      if (messages[i].title) {
        output += '<h4>' + messages[i].title + '</h4>';
      }

      if (messages[i].detail) {
        output += '<p>' + messages[i].detail + '</p>';
      }

      if (messages[i].list) {
        output += '<ul>';
        for (var ctr = 0; ctr < messages[i].list.length; ctr++) {
          output += '<li>' + messages[i].list[ctr] + '</li>';
        }
        output += '</ul>';
      }
    }
    return new hbs.SafeString(output);
  };

  _helpers.debug = function(value) {
    console.log('Current Context');
    console.log('====================');
    console.log('====================');
    console.log(this);
    console.log('====================');
    console.log('====================');
    if (value) {
      console.log('Value');
      console.log('====================');
      console.log('====================');
      console.log(val);
      console.log('====================');
      console.log('====================');
    }
  };

  return _helpers;

};