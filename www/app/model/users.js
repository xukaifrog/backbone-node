/**
 * Created by kai on 6/24/14.
 */
define(['app/gdeps'
], function(){
    var Users = Backbone.Collection.extend({
        url:'/users'
    })
    return Users;
})
