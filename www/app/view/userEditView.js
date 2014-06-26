/**
 * Created by kai on 6/24/14.
 */
define([
    'app/libs',
    'app/router',
    'app/model/user',
    'text!../template/user_edit' // Template
], function(gdeps, Router, User, Template) {
    var UserEditView = Backbone.View.extend({
        el:'#content',
        initialize: function(options) {
            // Deal with default options and then look at options.pos
            this.router = options.router;
        },
        events:{
            'submit #user_info form':'saveUser',
            'click .delete':'deleteUser'
        },
        render:function(options){
            if (options.id) {
                this.user = new User({id:options.id});
                this.user.fetch({
                    success:function(user){
                        var template = _.template(Template, {user:user});
                    }
                })
            } else {
                var user = new User();
                var template = _.template(Template, {user:user});
                $.ui.addContentDiv('user_info', template, 'Add user');
                this.$el.append($('#user_info'));
                $.ui.loadContent('#user_info', false, false, 'pop');
            }
        },
        deleteUser:function(ev){
            var that = this;
            this.user.destroy({
                success:function(){
                    console.log('destroyed');
                    that.router.navigate('', {trigger:true})
                }
            });
        },
        saveUser:function(ev){
            var that = this;
            var userDetails = $(ev.currentTarget).serializeObject();
            var user = new User();
            user.save(userDetails, {
                success:function(user){
                    that.router.navigate('', {trigger:true});
                }
            })
            return false;
        }
    })
    return UserEditView;
});