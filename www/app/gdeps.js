/**
 * Created by kai on 6/24/14.
 */

define([
// these are path alias that we configured in our bootstrap
    'jquery', // libs/jquery/jquery
    'underscore', // libs/underscore.underscore.min
    'backbone' // libs/backbone/backbone

// additional module dependencies
], function($, _, Backbone) {
// set up the interactions for the app separate from backbone

// global app object to hold settings
    var app = {
        root: '/'
    };

// PRIVATE VARIABLES
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        })
        return o;
    }

    $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
        options.url = 'http://127.0.0.1:3000' + options.url;
        options.crossDomain = {
            crossDomain: true
        };
        options.xhrFields = {
            withCredentials: true
        };
    });

// PRIVATE FUNCTIONS

// what we return here will be used by other modules
// app is also extended with Backbone.Events
    return _.extend(app, {
// GLOBAL FUNCTIONS
}, Backbone.Events);
});