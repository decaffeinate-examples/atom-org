/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');

const {inspect} = require('util');
const walkdir = require('walkdir');
const Donna = require('../src/donna');
const Parser  = require('../src/parser');
const Metadata = require('../src/metadata');

const _ = require('underscore');

const CoffeeScript = require('coffee-script');

require('jasmine-focused');
require('jasmine-json');

describe("Metadata", function() {
  let parser = null;

  const constructDelta = function(filename, hasReferences) {
    if (hasReferences == null) { hasReferences = false; }
    const generated = Donna.generateMetadata([filename])[0];
    delete generated.version;
    delete generated.repository;
    delete generated.main;

    const expected_filename = filename.replace(/\.coffee$/, '.json');
    const expected = JSON.parse(fs.readFileSync(expected_filename, 'utf8'));
    return expect(generated).toEqualJson(expected);
  };

  beforeEach(() => parser = new Parser({
    inputs: [],
    output: '',
    extras: [],
    readme: '',
    title: '',
    quiet: false,
    private: true,
    verbose: true,
    metadata: true,
    github: ''
  }));

  describe("Classes", function() {
    it('understands descriptions', () => constructDelta("spec/metadata_templates/classes/basic_class.coffee"));

    it('understands subclassing', () => constructDelta("spec/metadata_templates/classes/class_with_super_class.coffee"));

    it('understands class properties', () => constructDelta("spec/metadata_templates/classes/class_with_class_properties.coffee"));

    it('understands prototype properties', () => constructDelta("spec/metadata_templates/classes/class_with_prototype_properties.coffee"));

    it('understands documented prototype properties', function() {
      const str = `\
class TextBuffer
  # Public: some property
  prop2: "bar"\
`;
      const metadata = TestGenerator.generateMetadata(str)[0];
      return expect(metadata.files.fakefile.objects['2']['9']).toEqualJson({
        "name": "prop2",
        "type": "primitive",
        "doc": "Public: some property ",
        "range": [[2, 9], [2, 13]],
        "bindingType": "prototypeProperty"
      });
    });

    it('understands documented class properties', function() {
      const str = `\
class TextBuffer
  # Public: some class property
  @classProp2: "bar"\
`;
      const metadata = TestGenerator.generateMetadata(str)[0];
      return expect(metadata.files.fakefile.objects['2']['15']).toEqualJson({
        "name": "classProp2",
        "type": "primitive",
        "doc": "Public: some class property ",
        "range": [[2, 15], [2, 19]],
        "bindingType": "classProperty"
      });
    });

    it('outputs methods with reserved words', function() {
      const str = `\
class TextBuffer
  # Public: deletes things
  delete: ->\
`;
      const metadata = TestGenerator.generateMetadata(str)[0];
      return expect(metadata.files.fakefile.objects['2']['10']).toEqualJson({
        "name": "delete",
        "type": "function",
        "doc": "Public: deletes things ",
        "paramNames": [],
        "range": [[2, 10], [2, 11]],
        "bindingType": "prototypeProperty"
      });
    });

    it('understands comment sections properties', () => constructDelta("spec/metadata_templates/classes/class_with_comment_section.coffee"));

    it('selects the correct doc string for each function', () => constructDelta("spec/metadata_templates/classes/classes_with_similar_methods.coffee"));

    return it('preserves comment indentation', () => constructDelta("spec/metadata_templates/classes/class_with_comment_indentation.coffee"));
  });

  describe("Exports", function() {
    it('understands basic exports', () => constructDelta("spec/metadata_templates/exports/basic_exports.coffee"));

    return it('understands class exports', () => constructDelta("spec/metadata_templates/exports/class_exports.coffee"));
  });

  describe("Requires", function() {
    it('understands basic requires', () => constructDelta("spec/metadata_templates/requires/basic_requires.coffee"));

    it('understands requires of expressions', () => constructDelta("spec/metadata_templates/requires/requires_with_call_args.coffee"));

    it('does not error on requires with a call of the required module', () => constructDelta("spec/metadata_templates/requires/requires_with_call_of_required_module.coffee"));

    it('understands multiple requires on a single line', () => constructDelta("spec/metadata_templates/requires/multiple_requires_single_line.coffee"));

    it('understands requires with a colon', () => constructDelta("spec/metadata_templates/requires/requires_with_colon.coffee"));

    it('understands importing', () => constructDelta("spec/metadata_templates/requires/references/buffer-patch.coffee"));

    return it('does not throw when reading constructed paths', function() {
      const str = `\
Decoration = require path.join(atom.config.resourcePath, 'src', 'decoration')\
`;

      const generateMetadata = () => TestGenerator.generateMetadata(str);

      return expect(generateMetadata).not.toThrow();
    });
  });

  describe("Other expressions", function() {
    it("does not blow up on top-level try/catch blocks", () => constructDelta("spec/metadata_templates/top_level_try_catch.coffee"));

    return it("does not blow up on array subscript assignments", () => constructDelta("spec/metadata_templates/subscript_assignments.coffee"));
  });

  describe("when metadata is generated from multiple packages", () => it('each slug contains only those files in the respective packages', function() {
    const singleFile = "spec/metadata_templates/requires/multiple_requires_single_line.coffee";
    const realPackagePath = path.join("spec", "metadata_templates", "test_package");

    const metadata = Donna.generateMetadata([singleFile, realPackagePath]);

    expect(_.keys(metadata[0].files)).toEqual(['multiple_requires_single_line.coffee']);
    return expect(_.keys(metadata[1].files)).not.toContain('multiple_requires_single_line.coffee');
  }));

  return describe("A real package", () => it("renders the package correctly", function() {
    const test_path = path.join("spec", "metadata_templates", "test_package");
    const slug = Donna.generateMetadata([test_path])[0];

    const expected_filename = path.join(test_path, 'test_metadata.json');
    const expected = JSON.parse(fs.readFileSync(expected_filename, 'utf8'));

    expect(slug).toEqualJson(expected);
    expect(_.keys(slug.files)).not.toContain("./Gruntfile.coffee");
    return expect(_.keys(slug.files)).not.toContain("./spec/text-buffer-spec.coffee");
  }));
});

class TestGenerator {
  static generateMetadata(fileContents, options) {
    const parser = new TestGenerator;
    parser.addFile(fileContents, options);
    return parser.generateMetadata();
  }

  constructor() {
    this.slugs = {};
    this.parser = new Parser();
  }

  generateMetadata() {
    const slugs = [];
    for (let k in this.slugs) {
      const slug = this.slugs[k];
      slugs.push(slug);
    }
    return slugs;
  }

  addFile(fileContents, param) {
    let name;
    if (param == null) { param = {}; }
    let {filename, packageJson} = param;
    if (filename == null) { filename = 'fakefile'; }
    if (packageJson == null) { packageJson = {}; }

    const slug = this.slugs[name = packageJson.name != null ? packageJson.name : 'default'] != null ? this.slugs[name] : (this.slugs[name] =
      {files: {}});

    this.parser.parseContent(fileContents, filename);
    const metadata = new Donna.Metadata(packageJson, this.parser);
    metadata.generate(CoffeeScript.nodes(fileContents));
    return Donna.populateSlug(slug, filename, metadata);
  }
}
