/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const _ = require('underscore');
const atomdoc = require('atomdoc');

class Digester {
  constructor() {
    this.current = {};
  }

  digest(metadata) {
    const classes = {};
    for (let packageObject of Array.from(metadata)) {
      this.current.package = packageObject;
      const {
        files
      } = packageObject;
      for (let filename in files) {
        const fileData = files[filename];
        this.current.filename = filename;
        this.current.objects = fileData.objects;
        this.current.sections = this.extractSections(fileData.objects);

        for (let row in fileData.objects) {
          const columnsObj = fileData.objects[row];
          for (let column in columnsObj) {
            const object = columnsObj[column];
            switch (object.type) {
              case 'class':
                var classResult = this.digestClass(object);
                if (classResult != null) { classes[classResult.name] = classResult; }
                break;
            }
          }
        }
      }
    }

    return {classes};
  }

  digestClass(classEntity) {
    const classDoc = this.docFromDocString(classEntity.doc, {parseReturns: false});
    if (!classDoc) { return; }

    const sections = this.filterSectionsForRowRange(classEntity.range[0][0], classEntity.range[1][0]);
    const classMethods = this.extractEntities(sections, classEntity.classProperties, 'function');
    const instanceMethods = this.extractEntities(sections, classEntity.prototypeProperties, 'function');
    const classProperties = this.extractEntities(sections, classEntity.classProperties, 'primitive');
    const instanceProperties = this.extractEntities(sections, classEntity.prototypeProperties, 'primitive');

    // Only sections that are used should be in the output
    const filteredSections = [];
    for (let section of Array.from(sections)) {
      for (let method of Array.from(classMethods.concat(instanceMethods).concat(classProperties).concat(instanceProperties))) {
        if (section.name === method.sectionName) {
          filteredSections.push(_.pick(section, 'name', 'description'));
          break;
        }
      }
    }

    const parsedAttributes = ['visibility', 'summary', 'description', 'events', 'examples'];

    return _.extend({
      name: classEntity.name,
      superClass: classEntity.superClass,
      filename: this.current.filename,
      srcUrl: this.linkForRow(classEntity.range[0][0]),
      sections: filteredSections,
      classMethods,
      instanceMethods,
      classProperties,
      instanceProperties
    }, _.pick(classDoc, ...Array.from(parsedAttributes)));
  }

  digestEntity(sections, entity, entityPosition) {
    const doc = this.docFromDocString(entity.doc);
    if (doc == null) { return; }

    const parsedAttributes = [
      'visibility', 'summary', 'description', 'arguments',
      'titledArguments', 'events', 'examples', 'returnValues'
    ];

    return _.extend({
      name: entity.name,
      sectionName: this.sectionNameForRow(sections, entityPosition[0]),
      srcUrl: this.linkForRow(entityPosition[0])
    }, _.pick(doc, ...Array.from(parsedAttributes)));
  }

  /*
  Section: Utils
  */

  extractEntities(sections, entityPositions, entityType) {
    const entities = [];
    for (let entityPosition of Array.from(entityPositions)) {
      const entityObject = this.objectFromPosition(entityPosition);
      if (entityObject.type === entityType) {
        const entity = this.digestEntity(sections, entityObject, entityPosition);
        if (entity != null) { entities.push(entity); }
      }
    }
    return entities;
  }

  extractSections(objects) {
    const sections = [];
    for (let row in objects) {
      const columnsObj = objects[row];
      for (let column in columnsObj) {
        const object = columnsObj[column];
        if (object.type === 'comment') {
          const section = this.sectionFromCommentEntity(object);
          if (section != null) { sections.push(section); }
        }
      }
    }
    return sections;
  }

  sectionFromCommentEntity(commentEntity) {
    const doc = atomdoc.parse(commentEntity.doc);
    if ((doc != null ? doc.visibility : undefined) === 'Section') {
      let left;
      return {
        name: doc.summary,
        description: (left = (doc.description != null ? doc.description.replace(doc.summary, '').trim() : undefined)) != null ? left : '',
        startRow: commentEntity.range[0][0],
        endRow: commentEntity.range[1][0]
      };
    } else {
      return null;
    }
  }

  filterSectionsForRowRange(startRow, endRow) {
    const sections = [];
    for (let section of Array.from(this.current.sections)) {
      if ((section.startRow >= startRow) && (section.startRow <= endRow)) { sections.push(section); }
    }
    sections.sort((sec1, sec2) => sec1.startRow - sec2.startRow);
    return sections;
  }

  sectionNameForRow(sections, row) {
    if (!sections.length) { return null; }
    for (let start = sections.length-1, i = start, asc = start <= 0; asc ? i <= 0 : i >= 0; asc ? i++ : i--) {
      const section = sections[i];
      if (row > section.startRow) { return section.name; }
    }
    return null;
  }

  docFromDocString(docString, options) {
    let classDoc;
    if (docString != null) { classDoc = atomdoc.parse(docString, options); }
    if (classDoc && classDoc.isPublic()) {
      return classDoc;
    } else {
      return null;
    }
  }

  objectFromPosition(position) {
    return this.current.objects[position[0]][position[1]];
  }

  linkForRow(row) {
    if (this.current.package.repository == null) { return null; }

    const repo = this.current.package.repository.replace(/\.git$/i, '');
    const filePath = path.normalize(`/blob/v${this.current.package.version}/${this.current.filename}`);
    return `${repo}${filePath}#L${row + 1}`;
  }
}

module.exports = {
  digest(metadata) {
    return new Digester().digest(metadata);
  }
};
