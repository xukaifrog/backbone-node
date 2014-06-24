/**
 * Created by kai on 6/24/14.
 */
define([
    'app/gdeps',
    'app/model/users',
    'text!../template/user_list' // Template
    ], function(gdeps, Users, Template){
    var UserListView = Backbone.View.extend({
        el:'.page',
        render:function(){
            var users = new Users();
            var that = this;
            users.fetch({
                success:function(users){
                    var template = _.template(Template, {users:users.models});
                    that.$el.html(template);
                }
            })
        }
    })
    return UserListView;
});