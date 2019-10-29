/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Run this to update the static list of completions stored in the completions.json
// file at the root of this repository.

const path = require('path');
const fs = require('fs');
const request = require('request');
const fetchPropertyDescriptions = require('./fetch-property-docs');

const PropertiesURL = 'https://raw.githubusercontent.com/adobe/brackets/master/src/extensions/default/CSSCodeHints/CSSProperties.json';

const propertiesPromise = new Promise(resolve => request({json: true, url: PropertiesURL}, function(error, response, properties) {
  if (error != null) {
    console.error(error.message);
    resolve(null);
  }
  if (response.statusCode !== 200) {
    console.error(`Request for CSSProperties.json failed: ${response.statusCode}`);
    resolve(null);
  }
  return resolve(properties);
}));

const propertyDescriptionsPromise = fetchPropertyDescriptions();

Promise.all([propertiesPromise, propertyDescriptionsPromise]).then(function(values) {
  let propertyName;
  const properties = {};
  const propertiesRaw = values[0];
  const propertyDescriptions = values[1];
  const sortedPropertyNames = JSON.parse(fs.readFileSync(path.join(__dirname, 'sorted-property-names.json')));
  for (propertyName of Array.from(sortedPropertyNames)) {
    var metadata;
    if (!(metadata = propertiesRaw[propertyName])) { continue; }
    metadata.description = propertyDescriptions[propertyName];
    properties[propertyName] = metadata;
    if (propertyDescriptions[propertyName] == null) { console.warn(`No description for property ${propertyName}`); }
  }

  for (propertyName in propertiesRaw) {
    if (sortedPropertyNames.indexOf(propertyName) < 0) { console.warn(`Ignoring ${propertyName}; not in sorted-property-names.json`); }
  }

  const tags = JSON.parse(fs.readFileSync(path.join(__dirname, 'html-tags.json')));
  const pseudoSelectors = JSON.parse(fs.readFileSync(path.join(__dirname, 'pseudo-selectors.json')));

  const completions = {tags, properties, pseudoSelectors};
  return fs.writeFileSync(path.join(__dirname, 'completions.json'), `${JSON.stringify(completions, null, '  ')}\n`);
});
