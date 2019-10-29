/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe("CoffeeScript (Literate) grammar", function() {
  let grammar = null;

  beforeEach(function() {
    waitsForPromise(() => atom.packages.activatePackage("language-coffee-script"));

    return runs(() => grammar = atom.grammars.grammarForScopeName("source.litcoffee"));
  });

  it("parses the grammar", function() {
    expect(grammar).toBeTruthy();
    return expect(grammar.scopeName).toBe("source.litcoffee");
  });

  it("recognizes a code block after a list", function() {
    const tokens = grammar.tokenizeLines(`\
1. Example
2. List

    1 + 2\
`
    );
    return expect(tokens[3][1]).toEqual({value: "1", scopes: ["source.litcoffee", "markup.raw.block.markdown", "constant.numeric.decimal.coffee"]});
});

  return describe("firstLineMatch", function() {
    it("recognises interpreter directives", function() {
      let line;
      const valid = `\
#!/usr/local/bin/coffee --no-header --literate -w
#!/usr/local/bin/coffee -l
#!/usr/local/bin/env coffee --literate -w\
`;
      for (line of Array.from(valid.split(/\n/))) {
        expect(grammar.firstLineRegex.scanner.findNextMatchSync(line)).not.toBeNull();
      }

      const invalid = `\
#!/usr/local/bin/coffee --no-head -literate -w
#!/usr/local/bin/coffee --wl
#!/usr/local/bin/env coffee --illiterate -w=l\
`;
      return (() => {
        const result = [];
        for (line of Array.from(invalid.split(/\n/))) {
          result.push(expect(grammar.firstLineRegex.scanner.findNextMatchSync(line)).toBeNull());
        }
        return result;
      })();
    });

    it("recognises Emacs modelines", function() {
      let line;
      const valid = `\
#-*- litcoffee -*-
#-*- mode: litcoffee -*-
/* -*-litcoffee-*- */
// -*- litcoffee -*-
/* -*- mode:LITCOFFEE -*- */
// -*- font:bar;mode:LitCoffee -*-
// -*- font:bar;mode:litcoffee;foo:bar; -*-
// -*-font:mode;mode:litcoffee-*-
// -*- foo:bar mode: litcoffee bar:baz -*-
" -*-foo:bar;mode:litcoffee;bar:foo-*- ";
" -*-font-mode:foo;mode:LITcofFEE;foo-bar:quux-*-"
"-*-font:x;foo:bar; mode : litCOFFEE; bar:foo;foooooo:baaaaar;fo:ba;-*-";
"-*- font:x;foo : bar ; mode : LiTcOFFEe ; bar : foo ; foooooo:baaaaar;fo:ba-*-";\
`;
      for (line of Array.from(valid.split(/\n/))) {
        expect(grammar.firstLineRegex.scanner.findNextMatchSync(line)).not.toBeNull();
      }

      const invalid = `\
/* --*litcoffee-*- */
/* -*-- litcoffee -*-
/* -*- -- litcoffee -*-
/* -*- LITCOFFEE -;- -*-
// -*- itsLitCoffeeFam -*-
// -*- litcoffee; -*-
// -*- litcoffee-stuff -*-
/* -*- model:litcoffee -*-
/* -*- indent-mode:litcoffee -*-
// -*- font:mode;litcoffee -*-
// -*- mode: -*- litcoffee
// -*- mode: burnt-because-litcoffee -*-
// -*-font:mode;mode:litcoffee--*-\
`;
      return (() => {
        const result = [];
        for (line of Array.from(invalid.split(/\n/))) {
          result.push(expect(grammar.firstLineRegex.scanner.findNextMatchSync(line)).toBeNull());
        }
        return result;
      })();
    });

    return it("recognises Vim modelines", function() {
      let line;
      const valid = `\
vim: se filetype=litcoffee:
# vim: se ft=litcoffee:
# vim: set ft=LITCOFFEE:
# vim: set filetype=litcoffee:
# vim: ft=LITCOFFEE
# vim: syntax=litcoffee
# vim: se syntax=litcoffee:
# ex: syntax=litcoffee
# vim:ft=LitCoffee
# vim600: ft=litcoffee
# vim>600: set ft=litcoffee:
# vi:noai:sw=3 ts=6 ft=litcoffee
# vi::::::::::noai:::::::::::: ft=litcoffee
# vim:ts=4:sts=4:sw=4:noexpandtab:ft=LITCOFFEE
# vi:: noai : : : : sw   =3 ts   =6 ft  =litCoffee
# vim: ts=4: pi sts=4: ft=litcoffee: noexpandtab: sw=4:
# vim: ts=4 sts=4: ft=litcoffee noexpandtab:
# vim:noexpandtab sts=4 ft=LitCOffEE ts=4
# vim:noexpandtab:ft=litcoffee
# vim:ts=4:sts=4 ft=litcoffee:noexpandtab:\x20
# vim:noexpandtab titlestring=hi\|there\\\\ ft=litcoffee ts=4\
`;
      for (line of Array.from(valid.split(/\n/))) {
        expect(grammar.firstLineRegex.scanner.findNextMatchSync(line)).not.toBeNull();
      }

      const invalid = `\
ex: se filetype=litcoffee:
_vi: se filetype=litcoffee:
 vi: se filetype=litcoffee
# vim set ft=illitcoffee
# vim: soft=litcoffee
# vim: clean-syntax=litcoffee:
# vim set ft=litcoffee:
# vim: setft=litcoffee:
# vim: se ft=litcoffee backupdir=tmp
# vim: set ft=LITCOFFEE set cmdheight=1
# vim:noexpandtab sts:4 ft:litcoffee ts:4
# vim:noexpandtab titlestring=hi\\|there\\ ft=litcoffee ts=4
# vim:noexpandtab titlestring=hi\\|there\\\\\\ ft=litcoffee ts=4\
`;
      return (() => {
        const result = [];
        for (line of Array.from(invalid.split(/\n/))) {
          result.push(expect(grammar.firstLineRegex.scanner.findNextMatchSync(line)).toBeNull());
        }
        return result;
      })();
    });
  });
});
