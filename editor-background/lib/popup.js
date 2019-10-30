/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const {$} = require('atom-space-pen-views');
const SimpleSlider = require('./simpleSlider');
const colorpicker = require('./colorpicker.js');

var Popup = (function() {
  let element = undefined;
  let content = undefined;
  let fadeTime = undefined;
  let visible = undefined;
  let onHide = undefined;
  let controls = undefined;
  let title = undefined;
  let buttons = undefined;
  Popup = class Popup {
    static initClass() {
  
      element = null;
      content = null;
      fadeTime =250;
      visible = false;
      onHide = null;
      controls = {};
      title = null;
      buttons = null;
    }

    constructor(appendElement){
      if ((appendElement == null)) {
        appendElement = document.querySelector('body');
      }

      const html = `<div class="wrapper"> \
<div class="close">X</div> \
<div class="title"></div> \
<form name="contentForm" class="content"> \
</form> \
<span class="loading loading-spinner-tiny inline-block" \
id="working" \
style="display:none;"></span> \
<div class="buttons"></div> \
</div>`;
      this.element = document.createElement('div');
      this.element.className = 'eb-modal-window';
      this.element.innerHTML = html;
      this.content = this.element.querySelector('.content');
      this.form = this.content;
      ({
        fadeTime
      } = this);
      this.element.style.transition = `opacity ${fadeTime}ms`;
      this.element.style.webkitTransition = `opacity ${fadeTime}ms`;
      const close = this.element.querySelector('.close');
      close.addEventListener('click',ev=> {
        return this.hide();
      });
      this.title = this.element.querySelector('.title');
      this.buttons = this.element.querySelector('.buttons');
      //title.addEventListener 'mousedown',(ev)=>
        //@dragWindow(ev)
      appendElement.appendChild(this.element);
      this.element.addEventListener('keydown',ev => ev.stopPropagation());
      this;
    }

    destroy() {
      return this.element.remove();
    }

    center() {
      const w_ = window.getComputedStyle(this.element).width;
      const h_ = window.getComputedStyle(this.element).height;
      const ww = /([0-9]+)/gi.exec(w_);
      const hh = /([0-9]+)/gi.exec(h_);
      if ((ww != null) && (hh != null)) {
        const w = ww[1];
        const h = hh[1];
        const w2 = Math.floor(w / 2);
        const h2 = Math.floor(h / 2);
        this.element.style.left = `calc(50% - ${w2}px)`;
        return this.element.style.top = `calc(50% - ${h2}px)`;
      }
    }

    getControls() {
      this.controls = {};
      this.controls.forms = document.forms;
      return Array.from(document.forms).map((form) =>
        (form=> {
          return Array.from(form.elements).map((el) =>
            (el=> {
              return this.controls[el.name]=el;
            })(el));
        })(form));
    }

    makeSliders() {
      const ranges = this.element.querySelectorAll('.range');
      return Array.from(ranges).map((range) =>
        (function(range){
          $(range).bind('change',function(ev){
            const val = range.value;
            return $(range).simpleSlider('setValue',val);
          });

          const input = document.createElement('input');
          input.type = 'text';
          input.style.minWidth='40px';
          range.parentElement.insertBefore(input,range);
          input.addEventListener('change',() => range.value = input.value);
          const val = range.value || 0;
          input.value = val;
          const dataRange = range.dataset.sliderRange.split(',');
          $(range).simpleSlider({range:dataRange,value:val});
          return $(range).bind('sliderchanged',(ev, data) => input.value = data.value);
        })(range));
    }

    makeColors() {
      const colorPickers = this.element.querySelectorAll('.color-picker');
      return Array.from(colorPickers).map((picker) =>
        (function(picker) {
          $(picker).wrap('<div class="picker-wrapper"></div>');
          const wrapper = $(picker).parent();
          //console.log 'wrapper',wrapper
          const cpicker = new colorpicker(picker,{container:wrapper,format:'hex'});
          return $(cpicker).focus(() => $(cpicker).colorpicker('show'));
        })(picker));
    }

    setVisible() {
      const otherModals = document.querySelectorAll('.eb-modal-window');
      let zIndex = 1;
      for (let modal of Array.from(otherModals)) {
        const cmpSt = window.getComputedStyle(modal);
        if (cmpSt.zIndex > zIndex) { ({
          zIndex
        } = cmpSt); }
      }
      this.element.style.display='block';
      this.element.style.opacity = 1;
      this.element.style.zIndex = zIndex+1;
      this.visible = true;
      this.center();
      this.getControls();
      if (!this.inputParsed) {
        this.makeSliders();
        this.makeColors();
        return this.inputParsed = true;
      }
    }

    show(attrs){
      if ((attrs == null)) {
        return this.setVisible();
      }

      this.inputParsed = false;
      const titleHTML = attrs.title;
      const contentHTML = attrs.content;
      const titleEl = this.element.querySelector('.title');
      const contentEl = this.element.querySelector('.content');
      this.content = contentEl;
      const buttonsEl = this.element.querySelector('.buttons');
      this.buttons = buttonsEl;
      buttonsEl.innerHTML="";
      titleEl.innerHTML = titleHTML;
      contentEl.innerHTML = contentHTML;

      if (attrs.onHide != null) {
        this.onHide = attrs.onHide;
      } else {
        this.onHide = null;
      }

      if ((attrs != null ? attrs.buttons : undefined) != null) {
        for (let name in attrs.buttons) {
          const action = attrs.buttons[name];
          ((name,action)=> {
            let btn = null;
            btn = document.createElement('button');
            btn.className = 'btn btn-default';
            btn.innerText = name;
            btn.addEventListener('click',ev=> {
              return action(ev,this);
            });
            return buttonsEl.appendChild(btn);
          })(name, action);
        }
      }

      this.setVisible();
      if ((attrs != null ? attrs.onShow : undefined) != null) {
        return attrs.onShow(this);
      }
    }

    hide(next){
      this.element.style.opacity = 0;
      this.visible = false;
      return setTimeout(() => {
        this.element.style.display = 'none';
        if (this.onHide != null) {
          this.onHide(this);
        }
        if (next != null) { return next(); }
      }
      , this.fadeTime);
    }

    close() {
      return this.hide(() => {
        return this.content.innerHTML = '';
      });
    }

    destroy() {
      return this.hide(() => {
        this.element.remove();
        return delete this;
      });
    }

    working(value){
      const icon = this.element.querySelector('#working');
      if (value) {
        return icon.style.display='block';
      } else {
        return icon.style.display='none';
      }
    }
  };
  Popup.initClass();
  return Popup;
})();

module.exports = Popup;
