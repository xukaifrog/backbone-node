/**
 * Created by kai on 6/24/14.
 */
define([
// add global app dependency
    'app/libs' // App
// additional module dependencies
], function(){
    var Router = Backbone.Router.extend({
        routes:{
            "":'home',
            "edit/:id":'edit',
            "new":'edit',
            "test":'alert2'
        }
})
// what we return here will be used by other modules
    return Router;
});