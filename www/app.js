// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
    },
    shim: {
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'underscore': {
            deps:['jquery'],
            exports: '_'
        },
        'jq.appframework': {
            deps: ['jquery'],
            exports: 'af'
        },
        'plugins/allPlugins':{
            deps:['jq.appframework']
        },
        'appframework.ui':{
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['plugins/allPlugins']
        },
        'ui/transitions/all':{
            deps: ['appframework.ui']
        },
        'plugins/af.slidemenu':{
            deps: ['ui/transitions/all']
        },
        'plugins/af.desktopBrowsers':{
            deps: ['jq.appframework']
        }
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);
