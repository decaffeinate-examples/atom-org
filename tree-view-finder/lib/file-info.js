/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FileInfo;
const {requirePackages} = require('atom-utils');
const fs = require('fs-plus');

module.exports =
(FileInfo = (function() {
  FileInfo = class FileInfo {
    static initClass() {
      this.prototype.visible = false;
      this.prototype.debug = false;
      this.prototype.sortKey = 'name';
      this.prototype.sortOrder = 'ascent';
    }

    constructor() {
      this.updateThread = this.updateThread.bind(this);
      this.calcOptWidthName = this.calcOptWidthName.bind(this);
      this.calcOptWidthSize = this.calcOptWidthSize.bind(this);
      this.calcOptWidthMdate = this.calcOptWidthMdate.bind(this);
    }

    destroy() {}

    initialize() {
      if (this.debug) { return console.log('file-info: initialize'); }
    }

    show(treeView) {
      if (this.debug) { console.log('file-info: show: treeView =', treeView); }
      if (!treeView) { return; }
      this.treeView = treeView;
      this.visible = true;
      return this.update();
    }

    hide() {
      if (this.debug) { console.log('file-info: hide'); }
      this.visible = false;
      this.update();
      return this.treeView = null;
    }

    update() {
      if (this.treeView != null) {
        if (this.visible) {
          return this.add();
        } else {
          return this.delete();
        }
      }
    }

    delete() {
      let element;
      if (this.debug) { console.log('file-info: delete'); }
      let elements = this.treeView.element.querySelectorAll('.entry .file-info');
      for (element of Array.from(elements)) {
        element.classList.remove('file-info');
        if (this.debug) { element.classList.remove('file-info-debug'); }
      }
      elements = this.treeView.element.querySelectorAll('.entry .file-info-added');
      return (() => {
        const result = [];
        for (element of Array.from(elements)) {
          result.push(element.remove());
        }
        return result;
      })();
    }

    add() {
        if (this.debug) { console.log('file-info: add'); }
        return this.updateWidth();
      }

    updateWidth(nameWidth, sizeWidth, mdateWidth) {
      if (nameWidth == null) { ({
        nameWidth
      } = this); }
      if (sizeWidth == null) { ({
        sizeWidth
      } = this); }
      if (mdateWidth == null) { ({
        mdateWidth
      } = this); }
      if (this.debug) { console.log('file-info: updateWidth:', nameWidth, sizeWidth, mdateWidth); }
      this.nameWidth = nameWidth;
      this.sizeWidth = sizeWidth;
      this.mdateWidth = mdateWidth;

      if (this.treeView && this.visible) {
        const ol = this.treeView.element.querySelector('.tree-view');
        if (this.debug) {
          console.log("file-info: updateWidth: querySelector('.tree-view') =",
            ol, ol.getBoundingClientRect());
        }
        this.offset = ol.getBoundingClientRect().left;
        this.fileEntries = this.treeView.element.querySelectorAll('.entry');
        this.fileEntryIndex = 0;
        clearInterval(this.timer);
        if (this.debug) { console.log('file-info: update thread...'); }
        if (this.debug) { console.log('file-info: update thread...', this.updateThread); }
        return this.timer = setInterval(this.updateThread, 1);
      }
    }

    updateThread() {
        let fileEntry;
        if (!this.treeView || !this.visible) {
          clearInterval(this.timer);
          this.timer = null;
          this.fileEntries = null;
          return;
        }

        let cost = 0;
        let added = 0;
        while ((fileEntry = this.fileEntries[this.fileEntryIndex++])) {
          var padding, size;
          let name = fileEntry.querySelector('span.name');
          if (!name.classList.contains('file-info')) {
            added++;
            name.classList.add('file-info');
            if (this.debug) { name.classList.add('file-info-debug'); }
            const stat = fs.statSyncNoException(name.dataset.path);

            padding = document.createElement('span');
            padding.textContent = '\u00A0';  // XXX
            fileEntry.dataset.name = name.textContent.toLowerCase();  // use for sorting
            padding.classList.add('file-info-added');
            padding.classList.add('file-info-padding');
            if (this.debug) { padding.classList.add('file-info-debug'); }
            name.parentNode.appendChild(padding);

            size = document.createElement('span');
            const innerSize = document.createElement('span');
            if (fileEntry.classList.contains('file')) {
              innerSize.textContent = this.toSizeString(stat.size);
              fileEntry.dataset.size = stat.size;  // use for sorting
            } else {
              innerSize.textContent = '--';
              fileEntry.dataset.size = -1;  // use for sorting
            }
            innerSize.classList.add('file-info-inner-size');
            if (this.debug) { innerSize.classList.add('file-info-debug'); }
            size.appendChild(innerSize);
            size.classList.add('file-info-added');
            size.classList.add('file-info-size');
            if (this.debug) { size.classList.add('file-info-debug'); }
            name.parentNode.appendChild(size);

            const date = document.createElement('span');
            const innerDate = document.createElement('span');
            innerDate.textContent = this.toDateString(stat.mtime);
            fileEntry.dataset.mdate = stat.mtime.getTime();  // use for sorting
            innerDate.classList.add('file-info-inner-mdate');
            if (this.debug) { innerDate.classList.add('file-info-debug'); }
            date.appendChild(innerDate);
            date.classList.add('file-info-added');
            date.classList.add('file-info-mdate');
            if (this.debug) { date.classList.add('file-info-debug'); }
            name.parentNode.appendChild(date);
          }

          name = fileEntry.querySelector('span.name');
          [padding] = Array.from(name.parentNode.querySelectorAll('.file-info-padding'));
          [size] = Array.from(name.parentNode.querySelectorAll('.file-info-size'));
          const [mdate] = Array.from(name.parentNode.querySelectorAll('.file-info-mdate'));

          const rect = name.getBoundingClientRect();
          const margin = this.nameWidth - ((rect.left - this.offset) + rect.width);
          if (margin < 10) {
            padding.style.marginRight = margin + 'px';
            padding.style.width = '0px';
          } else {
            padding.style.marginRight = '0px';
            padding.style.width = margin + 'px';
          }
          if (this.debug) {
            console.log('file-info: updateWidth:', (this.fileEntryIndex-1) + ':',
              padding.style.width, padding.style.marginRight,
              '(' + this.nameWidth + ' - ' + (rect.left - this.offset) + ' - ' + rect.width + ')');
          }
          size.style.width = this.sizeWidth + 'px';
          mdate.style.width = this.mdateWidth+ 'px';
          if (50 < ++cost) {
            if (added) { this.sort(this.sortKey, this.sortOrder); }
            return;
          }
        }

        if (this.debug) { console.log('file-info: update thread...done'); }
        clearInterval(this.timer);
        if (added) { return this.sort(this.sortKey, this.sortOrder); }
      }

    toSizeString(size) {
      if (size < 1) {
        return 'Zero bytes';
      }
      if (size < 2) {
        return '1 byte';
      }
      if (size < 1000) {
        return size + ' bytes';
      }
      if (size < 999500) {
        return (Math.round(size/1000)/1) + ' KB';
      }
      if (size < 999950000) {
        return (Math.round(size/100000)/10) + ' MB';
      }
      return (Math.round(size/10000000)/100) + ' GB';
    }

    toDateString(date) {
      const shortMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const res = new Date(date + '');
      return shortMonth[res.getMonth()] + ' ' + res.getDate() + ', ' + 
        res.getFullYear() + ', ' + res.getHours() + ':' + res.getMinutes();
    }

    calcOptWidthName() {
      const ol = this.treeView.element.querySelector('.tree-view');
      const offset = ol.getBoundingClientRect().left;
      const elems = this.treeView.element.querySelectorAll('.entry span.name');
      let maxWidth = 0;
      for (let elem of Array.from(elems)) {
        const rect = elem.getBoundingClientRect();
        const width = ((rect.left - this.offset) + rect.width);
        maxWidth = Math.max(width, maxWidth);
      }
      return maxWidth;
    }

    calcOptWidthSize() {
      return this.calcOptWidth('.entry .file-info-inner-size');
    }

    calcOptWidthMdate() {
      return this.calcOptWidth('.entry .file-info-inner-mdate');
    }

    calcOptWidth(selector) {
      const elems = this.treeView.element.querySelectorAll(selector);
      let maxWidth = 0;
      for (let elem of Array.from(elems)) {
        maxWidth = Math.max(elem.offsetWidth, maxWidth);
      }
      return maxWidth + 16;
    }

    // XXX, messy...
    sort(key, order) {
      if (key == null) { key = 'name'; }
      if (order == null) { order = 'ascent'; }
      if (!this.treeView) { return; }
      this.sortKey = key;
      this.sortOrder = order;
      if (this.debug) {
        console.log('file-info: sort:',
          'key =', this.sortKey, ', order =', this.sortOrder);
      }
      const ols = this.treeView.element.querySelectorAll('ol.entries.list-tree');
      return (() => {
        const result = [];
        for (let ol of Array.from(ols)) {
        // if ol.childNodes.length
        //   console.log '====================', ol, ol.childNodes
          var aWin, bWin, li;
          let ar = [];
          for (li of Array.from(ol.childNodes)) {
            // console.log li.dataset['name'], 'value =', li.dataset[key]
            ar.push(li);
          }
          for (li of Array.from(ar)) {
            ol.removeChild(li);
          }
          if (order === 'ascent') {
            bWin = -1;
            aWin = 1;
          } else {
            bWin = 1;
            aWin = -1;
          }
          var stringCompFunc = function(a, b, key) {
            if (key == null) { key = 'name'; }
            if (a.dataset[key] < b.dataset[key]) {
              return bWin;
            }
            if (a.dataset[key] > b.dataset[key]) {
              return aWin;
            }
            return 0;
          };
          var numberCompFunc = function(a, b, key) {
            if (key == null) { key = 'name'; }
            return (a.dataset[key] - b.dataset[key]) * aWin;
          };
          if (key === 'name') {
            ar.sort((a, b) => stringCompFunc(a, b, key));
          } else {
            ar.sort(function(a, b) {
              let res;
              if ((res = numberCompFunc(a, b, key)) === 0) {
                res = stringCompFunc(a, b, 'name');
              }
              return res;
            });
          }
          for (li of Array.from(ar)) {
            ol.appendChild(li);
          }
          result.push(ar = null);
        }
        return result;
      })();
    }
  };
  FileInfo.initClass();
  return FileInfo;
})());
