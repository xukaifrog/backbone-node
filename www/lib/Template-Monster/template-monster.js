(function(templateMonster){
  templateMonster.templates = {};

  templateMonster.getTemplate = function(name){
    if (templateMonster.templates[name] && templateMonster.templates[name]['data']){
      return templateMonster.templates[name]['data'];
    }
    /* Check to see if the template is on the page and load it in? */
    return null;
  };

  templateMonster.loadTemplates = function(_templates){
    for(var template in _templates){
      templateMonster.loadTemplate(_templates[template]);
    }
  };

  templateMonster.loadTemplate = function(templateInfo){
    var name = templateInfo['name'];
    var filename = templateInfo['filename'];
    var callback = templateInfo['callback'] || function(data){};
    
    if (templateMonster.templates[name] && 
        templateMonster.templates[name]['filename'] == filename){
      callback(templateMonster.templates[name]);
      return;
    }
    if (localStorageAvailable()){
      var data = localStorage.getItem(name);
      data = data && JSON.parse(data);
      if (data && data['filename'] && data['filename'] === filename){
        cache(data, callback);
        return;
      }
    }

    $.get(filename, function(data) {
      var obj = {name:name, filename:filename, data:data};
      cache(obj, callback);
      saveTemplate(obj);
    });
  };

  function localStorageAvailable(){
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    }catch (e){
      return false;
    }
  };

  function cache(data, callback){
    templateMonster.templates[data['name']] = data;
    callback(data);
  };

  function saveTemplate(data){
    if (localStorageAvailable()){
      localStorage.setItem(data['name'], JSON.stringify(data));
    }
  };
})(window.templateMonster = window.templateMonster || {});
