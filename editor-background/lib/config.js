/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const {$} = require('atom-space-pen-views');
const popup = require('./popup');

var ConfigWindow = (function() {
  let title = undefined;
  let content = undefined;
  let buttons = undefined;
  let settings = undefined;
  ConfigWindow = class ConfigWindow {
    static initClass() {
  
      title = null;
      content = null;
      buttons = null;
      settings = {};
    }


    constructor(packageName,options){

      this.packageName = packageName;
      if ((options != null ? options.onChange : undefined) != null) {
        this.onChange = options.onChange;
      }
      if ((options != null ? options.onshow : undefined) != null) {
        this.onShow = options.onShow;
      }
      if ((options != null ? options.onHide : undefined) != null) {
        this.onHide = options.onHide;
      }
      this.html = '';
      this.popup = new popup();
      this.cleanPackageName = this.cleanName(this.packageName);
      this.title = this.cleanPackageName+" settings";
      this.loadSettings();
    }

    type(object){
      const funcNameRegex = /function (.{1,})\(/;
      if ((object != null ? object.constructor : undefined) != null) {
        const res = (funcNameRegex).exec(object.constructor.toString());
        if ((res != null ? res[1] : undefined) != null) {
          return res[1];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    upper(match){
      return match.toUpperCase();
    }


    lower(match){
      return match.toLowerCase();
    }

    cleanName(name){
      let result;
      const dotPos = name.lastIndexOf('.');
      if (dotPos>-1) {
        result = name.substr(dotPos+1,name.length-dotPos-1);
      } else {
        result = name;
      }
      result=result
      .replace('-',' ')
      .replace(/([a-z]+)([A-Z]+)/g,"$1 $2")
      .replace(/^[a-z].(.*)/gi,this.lower)
      .replace(/^([a-z]{1})/gi,this.upper);
      return result;
    }

    getConfigValue(name,obj){
      const fullPath = name;
      let value = atom.config.get(fullPath);
      const schema = atom.config.getSchema(fullPath);
      if ((value == null)) {
        if ((obj != null ? obj.default : undefined) != null) {
          value = obj.default;
        } else {
          if ((schema != null ? schema.default : undefined) != null) {
            value = schema.default;
            value = atom.config.makeValueConformToSchema(fullPath,value);
          }
        }
      }
      return value;
    }


    // prepare modified schema with value inside for easy parsing to atoms.config
    schemaToInternalConfig(fullPath){
      let key, val;
      const result = {};
      const schema = atom.config.getSchema(fullPath);
      const {
        type
      } = schema;
      if (type === 'object') {
        const props = schema.properties;
        for (key in props) {
          val = props[key];
          ((key,val)=> {
            return result[key] = this.schemaToInternalConfig(fullPath+'.'+key);
          })(key, val);
        }
      } else {
        for (key in schema) {
          val = schema[key];
          (((key, val) => result[key]=val))(key, val);
        }
        // first make value default
        result.value = atom.config.makeValueConformToSchema(fullPath,schema.default);
        // but if value exists in settings ...
        const config = atom.config.get(fullPath);
        if (config != null) {
          result.value = config;
        }
      }
      return result;
    }


    // get value from config with default if not present
    get(fullPath){
      const internalConfig = this.schemaToInternalConfig(fullPath);
      let result = {};
      // we must convert our internal config to atoms.config
      if (internalConfig != null) {
        // if type is not present then it is object with children
        const keys = Object.keys(internalConfig);
        if ((internalConfig.type == null) && (keys !== [])) {
          for (let key of Array.from(keys)) {
            (key=> {
              return result[key] = this.get(fullPath+'.'+key);
            })(key);
          }
        } else {
          result = internalConfig.value;
        }
      }
      return result;
    }


    getChildCleanName(name,obj){
      let cleanName = this.cleanName(name);
      if (obj.title != null) {
        cleanName = obj.title;
      }
      return cleanName;
    }

    parseFileChild(name,obj){
      const cleanName = this.getChildCleanName(name,obj);
      let value = this.getConfigValue(name,obj);
      if ((value == null)) { value = ''; }
      return `\
<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<input type='text' class='file-text' name='${name}' id='${name}' \
value='${value}'><button class='btn btn-default file-btn'>...</button> \
<input type='file' id='file-${name}' style='display:none;'> \
</div>\
`;
    }

    parseTextChild(name,obj){
      const cleanName = this.getChildCleanName(name,obj);
      let value = this.getConfigValue(name,obj);
      if ((value == null)) { value = ''; }
      return `\
<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<textarea \
class='file-text' \
name='${name}' \
id='${name}' \
value='${value}'>${value}</textarea> \
</div>\
`;
    }

    parseStringChild(name,obj){
      if (obj.toolbox != null) {
        if (obj.toolbox === 'file') {
          return this.parseFileChild(name,obj);
        }
        if (obj.toolbox === 'text') {
          return this.parseTextChild(name,obj);
        }
        if (obj.toolbox === 'ignore') {
          return "";
        }
      }
      const cleanName = this.getChildCleanName(name,obj);
      let value = this.getConfigValue(name,obj);
      if ((value == null)) {
        value = '';
      }
      return `<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<input type='text' name='${name}' id='${name}' value='${value}'> \
</div>`;
    }

    parseSliderChild(name,obj,step){
      const cleanName = this.getChildCleanName(name,obj);
      const value = this.getConfigValue(name,obj);
      const min = obj.minimum;
      const max = obj.maximum;
      return `\
<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<input type='number' class='range' \
data-slider-range='${min},${max}' \
data-slider-step='${step}' \
name='${name}' id='${name}' value='${value}'> \
</div>\
`;
    }

    parseIntegerChild(name,obj){
      const cleanName = this.getChildCleanName(name,obj);
      const value = this.getConfigValue(name,obj);
      if ((obj.minimum != null) && (obj.maximum != null)) {
        let step = 1;
        if (obj.step != null) { ({
          step
        } = obj); }
        return this.parseSliderChild(name,obj,step);
      } else {
        return `\
<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<input type='number' name='${name}' id='${name}' value='${value}'> \
</div>\
`;
      }
    }

    parseNumberChild(name,obj){
      const cleanName = this.getChildCleanName(name,obj);
      const value = this.getConfigValue(name,obj);
      if ((obj.minimum != null) && (obj.maximum != null)) {
        let step = 1;
        if (obj.step != null) { ({
          step
        } = obj); }
        return this.parseIntegerSlider(name,obj,step);
      } else {
        return `\
<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<input type='text' name='${name}' id='${name}' value='${value}'> \
</div>\
`;
      }
    }

    parseBooleanChild(name,obj){
      const cleanName = this.getChildCleanName(name,obj);
      const value = this.getConfigValue(name,obj);
      let checked = '';
      if (value) { checked = " checked='checked' "; }
      return `\
<div class='group'> \
<label><input type='checkbox' name='${name}' id='${name}' ${checked}>${cleanName}</label> \
</div>\
`;
    }
    parseArrayChild(name,obj){
      return '';
    }

    parseEnumOptions(options,selected){
      let result = '';
      for (let option of Array.from(options)) {
        (function(option){
          let sel = '';
          if (selected === option) { sel ='selected="selected"'; }
          return result+=`\
<option value='${option}' ${sel}>${option}</option>\
`;
        })(option);
      }
      return result;
    }

    parseEnumChild(name,obj){
      const cleanName = this.getChildCleanName(name,obj);
      const value = this.getConfigValue(name,obj);
      const options = this.parseEnumOptions(obj.enum,value);
      return `\
<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<select name='${name}' id='${name}'> \
${options} \
</select> \
</div>\
`;
    }

    parseColorChild(name,obj){
      const cleanName = this.getChildCleanName(name,obj);
      let value = this.getConfigValue(name,obj);
      value = value.toHexString();
      return `\
<div class='group'> \
<label for='${name}'>${cleanName}</label> \
<input type='text' class='color-picker' name='${name}' id='${name}' value='${value}'> \
</div>\
`;
    }

    parseTabChild(name,value,level,path){
      const parsers = {
        'string':(name,value)=> this.parseStringChild(name,value),
        'integer':(name,value)=> this.parseIntegerChild(name,value),
        'number':(name,value)=> this.parseNumberChild(name,value),
        'boolean':(name,value)=> this.parseBooleanChild(name,value),
        'object':(name,value)=> this.parseObjectChild(name,value),
        'array':(name,value)=> this.parseArrayChild(name,value),
        'color':(name,value)=> this.parseColorChild(name,value)
      };
      //console.log 'parsing child tab',name,level,path
      if ((value.enum == null)) {
        return parsers[value.type](path,value,level+1);
      } else {
        return this.parseEnumChild(path,value,level+1);
      }
    }

    makeTabs(name,obj,level,path){
      const cleanName = this.getChildCleanName(name,obj);
      const props = obj.properties;
      const tabs = Object.keys(props);
      //console.log 'tabs',tabs
      level = 0;
      let html = "<div class='config-tabs'>";
      const index = 0;
      for (let tab of Array.from(tabs)) {
        (tab=> {
          //console.log 'parsing tab',tab,props[tab]
          if ((props[tab].toolbox == null)) {
            const tabText = this.cleanName(tab);
            return html += `<div class='tab' id='tab-index-${index}'>${tabText}</div>`;
          }
        })(tab);
      }
      html += "</div>"; // header tabs

      html+="<div class='config-content'>";
      for (let key in props) {
        const value = props[key];
        ((key,value) => {
          //console.log 'parsing tab content',key
          if ((value.toolbox == null)) {
            html += `<div class='tab-content' id='content-tab-index-${index}'>`;
            html += this.parseObjectChild(key,value,1,path+'.'+key);
            return html += "</div>";
          }
        })(key, value);
      }
      html += "</div>";
      return html;
    }

    parseObjectChild(name,obj,level,path){
      if ((level == null)) { level = 0; }
      if (path == null) { path = ''; }
      //console.log 'parsing object child',name,obj,level
      if (level > 10) {
        console.error('too much levels... :/');
        throw new Error('something goes terribly wrong... I\'m going out of here');
        return;
      }
      let html = '';
      if (level===0) {
        html += this.makeTabs(name,obj,0,name);
      } else {
        const props = obj.properties;
        for (let key in props) {
          const value = props[key];
          ((key,value)=> {
            return html += this.parseTabChild(key,value,level+1,path+'.'+key);
          })(key, value);
        }
      }
      return html;
    }

    addButtons() {
      const html=`\
<button id='apply-btn' class='btn btn-default popup-btn'>Apply</button> \
<button id='close-btn' class='btn btn-default popup-btn'>Close</button>\
`;
      this.popup.buttons.innerHTML = html;
      const applyBtn = this.popup.element.querySelector('#apply-btn');
      applyBtn.addEventListener('click',ev=> this.applyConfig(ev));
      const closeBtn = this.popup.element.querySelector('#close-btn');
      return closeBtn.addEventListener('click',ev=> this.close(ev));
    }

    loadSettings() {
      this.settings = {};
      this.schema = atom.config.schema.properties[this.packageName];
      this.config = atom.config.get(this.packageName);
      this.default = atom.config.get(this.packageName);
      this.path = '';
      this.html = '<div id="editor-background-config">';
      this.html += this.parseObjectChild(this.packageName,this.schema,0);
      this.html += "</div>";

      this.popup.content.innerHTML = this.html;
      this.popup.title.innerHTML = this.cleanPackageName;
      this.configWnd = this.popup.element.querySelector('.content');
      this.tabs = this.configWnd.querySelectorAll('.tab');
      this.tabsContent = this.configWnd.querySelectorAll('.tab-content');
      for (let index = 0, end = this.tabs.length-1, asc = 0 <= end; asc ? index <= end : index >= end; asc ? index++ : index--) {
        (index=> {
          return this.tabs[index].addEventListener('click',ev=> {
            return this.activateTab(index);
          });
        })(index);
      }

      this.activateTab(0);
      this.bindEvents();
      return this.addButtons();
    }



    saveSettings(settings){
      const values = {};
      const {
        elements
      } = this.popup.content;
      for (let elem of Array.from(elements)) {
        (function(elem){
          const {
            name
          } = elem;
          if (name!== '') {
            if (elem.type === 'checkbox') {
              return values[name]=elem.checked;
            } else {
                return values[name]=elem.value;
              }
          }
        })(elem);
      }
      //console.log values
      return (() => {
        const result = [];
        for (let key in values) {
          const val = values[key];
          result.push((((key, val) => atom.config.set(key,val)))(key, val));
        }
        return result;
      })();
    }


    fileChooser(ev){
      const elem = ev.target;
      return $(elem).parent().children('input[type="file"]').click();
    }

    fileChanged(ev){
      if (ev.target.files[0] != null) {
        const file = ev.target.files[0];
        const path = file.path.replace(/\\/gi,'/');
        return $(ev.target).parent().children('input[type="text"]').val(path);
      }
    }

    bindEvents() {
      $(this.configWnd).find('.file-btn').on('click',ev=> this.fileChooser(ev));
      const file = this.configWnd.querySelector('input[type="file"]');
      return file.addEventListener('change',ev=> {
        return this.fileChanged(ev);
      });
    }

    applyConfig(ev){
      this.saveSettings();
      if (this.onChange != null) {
        return this.onChange();
      }
    }


    close(ev){
      return this.popup.hide();
    }


    activateTab(index){
      this.tabs = $(this.popup.element).find('.tab');
      for (let i = 0, end = this.tabs.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
        (i=> {
          if (i===index) {
            return this.tabs[i].className='tab active';
          } else {
            return this.tabs[i].className = 'tab';
          }
        })(i);
      }

      this.tabsContent = $(this.popup.element).find('.tab-content');

      for (let j = 0, end1 = this.tabsContent.length-1, asc1 = 0 <= end1; asc1 ? j <= end1 : j >= end1; asc1 ? j++ : j--) {
        (j=> {
          if (j===index) {
            return this.tabsContent[j].className = "tab-content active";
          } else {
            return this.tabsContent[j].className = "tab-content";
          }
        })(j);
      }
      return this.popup.center();
    }

    show() {
      return this.popup.show();
    }

    hide() {
      return this.popup.hide();
    }
  };
  ConfigWindow.initClass();
  return ConfigWindow;
})();

module.exports = ConfigWindow;
