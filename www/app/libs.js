/**
 * Created by kai on 6/24/14.
 */

define([
// these are path alias that we configured in our bootstrap
    'jquery', // libs/jquery/jquery
    'underscore', // libs/underscore.underscore.min
    'backbone', // libs/backbone/backbone
    'jq.appframework',
    'plugins/allPlugins',
    'appframework.ui',
    'ui/transitions/all',
    'plugins/af.slidemenu',
    'plugins/af.desktopBrowsers'
// additional module dependencies
], function($, _, Backbone, af) {
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

    //Touche event when it is browser
    if (!((window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in window)) {
        var script = document.createElement("script");
        script.src = "lib/plugins/af.desktopBrowsers.js";
        var tag = $("head").append(script);
        //$.os.desktop=true;
    }

    //$.ui.autoLaunch = false;
    $.ui.openLinksNewTab = false;
    $.ui.splitview=false;
    //To disable the default routing of App Framework, simply set
    $.ui.useInternalRouting = false;
    //Override the back button text
    $.ui.backButtonText="Back"

    // This code is used to run as soon as intel.xdk activates
    var onDeviceReady = function () {
        intel.xdk.device.setRotateOrientation("portrait");
        intel.xdk.device.setAutoRotate(false);
        //webRoot = intel.xdk.webRoot + "";
        //hide splash screen
        intel.xdk.device.hideSplashScreen();
        $.ui.blockPageScroll(); //block the page from scrolling at the header/footer
    };
    document.addEventListener("intel.xdk.device.ready", onDeviceReady, false);
    $.ui.ready(function () {
        //This function will get executed when $.ui.launch has completed
    });

     $(document).ready(function(){
        $.ui.launch();
    });


// PRIVATE FUNCTIONS

// what we return here will be used by other modules
// app is also extended with Backbone.Events
    return _.extend(app, {
// GLOBAL FUNCTIONS
}, Backbone.Events);
});