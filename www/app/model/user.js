/**
 * Created by kai on 6/24/14.
 */
define(['app/libs'
], function(){
    var User = Backbone.Model.extend({
        urlRoot:'/users'
    })
    return User;
})