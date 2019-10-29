/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const readInstalled = require('read-installed');
const {size, extend} = require('underscore');
const {basename, extname, join} = require('path');
const {existsSync, readdirSync, readFileSync} = require('fs');

module.exports = function(options, cb) {
  const {path, overrides, omitPermissive} = options;
  return readInstalled(path, null, function(err, packageData) {
    if (err != null) { return cb(err); }
    try {
      const licenseSummary = overrides != null ? overrides : {};
      findLicenses(licenseSummary, packageData, path);
      if (omitPermissive) { omitPermissiveLicenses(licenseSummary); }
      return cb(null, licenseSummary);
    } catch (error) {
      err = error;
      return cb(err);
    }
  });
};

var findLicenses = function(licenseSummary, packageData, path) {
  // Unmet dependencies are left as strings
  if (typeof packageData === 'string') { return; }

  let {name, version, dependencies, engines} = packageData;
  const id = `${name}@${version}`;

  if (!existsSync(path)) { return; }

  if (licenseSummary[id] == null) {
    const entry = {repository: extractRepository(packageData)};
    extend(entry, extractLicense(packageData, path));
    licenseSummary[id] = entry;

    if (size(dependencies) > 0) {
      return (() => {
        const result = [];
        for (name in dependencies) {
          const data = dependencies[name];
          const dependencyPath = join(path, 'node_modules', name);
          result.push(findLicenses(licenseSummary, data, dependencyPath));
        }
        return result;
      })();
    }
  }
};

var extractRepository = function({repository}) {
  if (typeof repository === 'object') {
    repository = repository.url.replace('git://github.com', 'https://github.com').replace('.git', '');
  }
  return repository;
};

var extractLicense = function({license, licenses, readme}, path) {
  if ((licenses != null ? licenses.length : undefined) > 0) { if (license == null) { license = licenses[0]; } }
  if (license && (license.type != null)) {
    license = license.type;
  }
  if (Object.prototype.toString.call(license) === '[object Array]') {
    license = license[0];
  }
  const result_dir = extractLicenseFromDirectory(path, license);
  if (result_dir && result_dir['license']) {
    return result_dir;
  } else if (license != null) {
    license = mungeLicenseName(license);
    const result = {license, source: 'package.json'};
    if (result_dir && result_dir['sourceText']) {
      result['sourceText'] = result_dir['sourceText'];
    }
    return result;
  } else if (readme && (readme !== 'ERROR: No README data found!')) {
    let left;
    return (left = extractLicenseFromReadme(readme)) != null ? left : {license: 'UNKNOWN'};
  } else {
    let left1;
    return (left1 = extractLicenseFromReadmeFile(path)) != null ? left1 : {license: 'UNKNOWN'};
  }
};

var mungeLicenseName = function(license) {
  if (!license) { return; }
  if (license.match(/[\s(]*BSD-.*/)) {
    return 'BSD';
  } else if (license.match(/[\s(]*Apache.*/)) {
    return 'Apache';
  } else if (license.match(/[\s(]*ISC.*/)) {
    return 'ISC';
  } else if (license.match(/[\s(]*MIT.*/)) {
    return 'MIT';
  } else if (license === 'WTFPL') {
    return 'WTF';
  } else if (license.match(/[\s(]*unlicen[sc]e/i)) {
    return 'Unlicense';
  } else if (license.match(/[\s(]*CC-BY(-\d(\.\d)*)?/i)) {
    return 'CC-BY';
  } else if (license.match(/[\s(]*Public Domain/i)) {
    return 'Public Domain';
  } else if (license.match(/[\s(]*LGPL(-.+)*/)) {
    return 'LGPL';
  } else if (license.match(/[\s(]*[^L]GPL(-.+)*/)) {
    return 'GPL';
  } else {
    return license;
  }
};

var extractLicenseFromReadme = function(readme) {
  if (readme == null) { return; }

  const license =
    (() => {
    if (readme.indexOf('MIT') > -1) {
      return 'MIT';
    } else if (readme.indexOf('BSD') > -1) {
      return 'BSD';
    } else if (readme.indexOf('Apache License') > -1) {
      return 'Apache';
    } else if (readme.indexOf('DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE') > -1) {
      return 'WTF';
    } else if ((readme.indexOf('Unlicense') > -1) || (readme.indexOf('UNLICENSE') > -1)) {
      return 'Unlicense';
    } else if (readme.toLocaleLowerCase().indexOf('public domain') > -1) {
      return 'Public Domain';
    }
  })();

  if (license != null) {
    return {license, source: 'README', sourceText: readme};
  }
};

var extractLicenseFromReadmeFile = function(path) {
  let readmeFiles;
  try {
    readmeFiles = readdirSync(path).filter(function(child) {
      const name = basename(child, extname(child));
      return name.toLowerCase() === 'readme';
    });
  } catch (error) {
    return;
  }

  for (let readmeFilename of Array.from(readmeFiles)) {
    var license;
    if (license = extractLicenseFromReadme(readIfExists(join(path, readmeFilename)))) {
      return license;
    }
  }
};

var extractLicenseFromDirectory = function(path, expected) {
  let license, licenseFileName, licenseText, potentialLicense, potentialLicenseFileName, potentialLicenseText;
  let noticesText = '';
  for (let f of Array.from(readdirSync(path))) {
    if (f.match(/(licen[s|c]e|copying)/i) && !f.match(/\.(docs|json|html)$/i)) {
      potentialLicenseText = readIfExists(join(path, f));
      potentialLicenseFileName = f;
      potentialLicense = licenseFromText(potentialLicenseText);
      if (expected && potentialLicense && (expected.toLowerCase().indexOf(potentialLicense.toLowerCase()) !== -1)) {
        licenseFileName = f;
        licenseText = potentialLicenseText;
        license = potentialLicense;
      }
    }
    if (f.match(/notice/i)) {
      noticesText = noticesText + readIfExists(join(path, f)) + '\n\n';
    }
  }

  if (licenseFileName == null) { licenseFileName = potentialLicenseFileName; }
  if (licenseText == null) { licenseText = potentialLicenseText; }
  if (noticesText) {
    licenseText = noticesText + licenseText;
  }
  if (license == null) { license = potentialLicense || expected; }
  license = mungeLicenseName(license);
  if (licenseText == null) { return; }
  return {license, source: licenseFileName, sourceText: licenseText};
};

var licenseFromText = function(licenseText) {
  if (licenseText.indexOf('Apache License') > -1) {
    return 'Apache';
  } else if (isMITLicense(licenseText)) {
    return 'MIT';
  } else if (isBSDLicense(licenseText)) {
    return 'BSD';
  } else if (isUnlicense(licenseText)) {
    return 'Unlicense';
  } else if (licenseText.indexOf('The ISC License') > -1) {
    return 'ISC';
  } else if (licenseText.indexOf('GNU LESSER GENERAL PUBLIC LICENSE') > -1) {
    return 'LGPL';
  } else if (licenseText.indexOf('GNU GENERAL PUBLIC LICENSE') > -1) {
    return 'GPL';
  } else if (licenseText.toLocaleLowerCase().indexOf('public domain')  > -1) {
    return 'Public Domain';
  }
};

var readIfExists = function(path) {
  if (existsSync(path)) { return readFileSync(path, 'utf8'); }
};

const normalizeLicenseText = licenseText => licenseText.replace(/\s+/gm, ' ').replace(/\s+$/m, '').replace(/\.$/, '').trim();

const MITLicenseText = `\
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE\
`.replace(/\s+/gm, ' ');

var isMITLicense = function(licenseText) {
  if (licenseText.indexOf('MIT License') > -1) {
    return true;
  } else {
    const startIndex = licenseText.indexOf('Permission is hereby granted');
    if (startIndex > -1) {
      const normalizedLicenseText = normalizeLicenseText(licenseText.slice(startIndex));
      return normalizedLicenseText === MITLicenseText;
    } else {
      return false;
    }
  }
};

const BSD3LicenseText = `\
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE\
`.replace(/\s+/gm, ' ');

var isBSDLicense = function(licenseText) {
  if (licenseText.indexOf('BSD License') > -1) {
    return true;
  } else {
    const startIndex = licenseText.indexOf('Redistribution and use');
    if (startIndex > -1) {
      const normalizedLicenseText = normalizeLicenseText(licenseText.slice(startIndex));
      return normalizedLicenseText === BSD3LicenseText;
    } else {
      return false;
    }
  }
};

const UnlicenseText = `\
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>\
`.replace(/\s+/gm, ' ');

var isUnlicense = function(licenseText) {
  if (licenseText.indexOf('Unlicense') > -1) {
    return true;
  } else {
    const startIndex = licenseText.indexOf('This is free and unencumbered software');
    if (startIndex > -1) {
      const normalizedLicenseText = normalizeLicenseText(licenseText.slice(startIndex));
      return normalizedLicenseText === UnlicenseText;
    } else {
      return false;
    }
  }
};

const PermissiveLicenses = ['MIT', 'BSD', 'Apache', 'WTF', 'LGPL', 'LGPL-2.0', 'LGPL-3.0', 'ISC', 'Artistic-2.0', 'Unlicense', 'CC-BY', 'Public Domain'];

var omitPermissiveLicenses = licenseSummary => (() => {
  const result = [];
  for (let name in licenseSummary) {
    const {license} = licenseSummary[name];
    if (Array.from(PermissiveLicenses).includes(license)) { result.push(delete licenseSummary[name]); } else {
      result.push(undefined);
    }
  }
  return result;
})();
