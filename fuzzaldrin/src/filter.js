/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const scorer = require('./scorer');

const pluckCandidates = a => a.candidate;

const sortCandidates = (a, b) => b.score - a.score;

module.exports = function(candidates, query, queryHasSlashes, param) {
  if (param == null) { param = {}; }
  const {key, maxResults} = param;
  if (query) {
    const scoredCandidates = [];
    for (let candidate of Array.from(candidates)) {
      const string = (key != null) ? candidate[key] : candidate;
      if (!string) { continue; }
      let score = scorer.score(string, query, queryHasSlashes);
      if (!queryHasSlashes) {
        score = scorer.basenameScore(string, query, score);
      }
      if (score > 0) { scoredCandidates.push({candidate, score}); }
    }

    // Sort scores in descending order
    scoredCandidates.sort(sortCandidates);

    candidates = scoredCandidates.map(pluckCandidates);
  }

  if (maxResults != null) { candidates = candidates.slice(0, maxResults); }
  return candidates;
};
