define([
    'app/libs',
    'app/router',
    'app/view/userListView',
    'app/view/userEditView'
], function(Libs, Router, UserListView, UserEditView){
    var router = new Router();
    var userListView = new UserListView();
    var userEditView = new UserEditView({router:router});

    router.on('route:home', function(){
        userListView.render();
    })
    router.on('route:edit', function(id){
        userEditView.render({id:id});
    })

    Backbone.history.start();
});