function RunCounterFn() {
  function isNumber (o) {
    return !isNaN(o - 0) &&
      (o != null) &&
      !o.length &&
      (o !== '');
  }

  function Range(start, end) {
    if (!(this instanceof Range)) { return new Range(start, end); }

    this.start = start;
    this.end   = end;
  }

  _.extend(Range.prototype, {
    clone: function() {
      return new Range(this.start, this.end);
    },
    has: function (prop) {
      return isNumber(this[prop]);
    },
    isValid: function() {
      return this.has('start') && this.has('end');
    },
    set: function(prop, val) {
      if (isNumber(val)) {
        this[prop] = val;
      }
      return this;
    }
  });

  function RunCounter() {
    if (!(this instanceof RunCounter)) { return new RunCounter(); }

    this.currentRange = null;
    this.lastValue = null;
    this.ranges    = [];
    this.index     = -1;
  }

  _.extend(RunCounter.prototype, {
    clone: function() {
      var c = new RunCounter();
      _.extend(c, {
        currentRange: this.currentRange && this.currentRange.clone(),
        lastValue: this.lastValue,
        ranges: _.clone(this.ranges),
        index: this.index
      });
      if (this.currentRange && (this.currentRange.has('start') || this.currentRange.has('end'))) {
        //debugger
      }

      return c;
    },
    increment: function(val) {
      var valChanged = (this.lastValue !== val);
      this.index += 1;

      if (valChanged) {
        if (this.currentRange && this.currentRange.isValid()) {
          this.ranges.push(this.currentRange);
          this.currentRange = new Range();
        }
      }

      this.lastValue = val;
      return valChanged;
    },
    run: function() {
      this.increment('run');

      if (!this.currentRange) {
        this.currentRange = new Range(this.index)
      } else if (!this.currentRange.has('start')) {
        this.currentRange.set('start', this.index);
      }
    },
    skip: function() {
      //debugger
      var valChanged = this.increment('skip');

      if (this.currentRange &&
          this.currentRange.has('start') &&
          !this.currentRange.has('end')) {
        this.currentRange.set('end', this.index);
      }
    },
    getRuns: function() {
      var i = this.index,
          lVal = this.lastValue,
          runs;

      this.skip();
      this.increment('getRuns');
      runs = _.map(this.ranges, function(range) {
        return {start: range.start, end: range.end};
      });

      this.index = i;
      this.lastValue = lVal;

      return runs;
    },
    lastWas: function(val) {
      return this.lastValue === val;
    }
  });

  return RunCounter;
}

var RunCounter = RunCounterFn();

function PrefixTrieNodeFn() {
  var slice  = Array.prototype.slice,
      concat = Array.prototype.concat,
      bind   = _.bind,
      PrefixTrieNode;

  function listToResult(list, matches) {
    return _.map(list, function(word) {
      return {
        word: word,
        matches: matches
      };
    });
  }

  PrefixTrieNode = function() {
    this.initialize.apply(this, slice.call(arguments));
  };

  _.extend(PrefixTrieNode.prototype, {
    initialize: function(value) {
      this.children = {};
      this.value    = (value || '').toLocaleLowerCase();
      this.words    = {};
    },
    addWord: function(word) {
      if (!!word) {
        this._addWord(word, word);
      }
      return this;
    },
    _addWord: function(word, wholeWord) {
      var firstLetter, child, restLetters, restWord;

      firstLetter = _.first(slice.call(word, 0, 1))
      restLetters = slice.call(word, 1)
      restWord    = restLetters.join('');

      if (!firstLetter) {
        if (arguments.length == 2) {
          // Recursive call result, add _wholeWord.
          var downcased = wholeWord.toLocaleLowerCase();
          this.words[downcased] = wholeWord;
        }
        return;
      } else {
        firstLetter = firstLetter.toLocaleLowerCase();
      }

      if (_.has(this.children, firstLetter)) {
        child = this.getChild(firstLetter);
      } else {
        child = this.children[firstLetter] = new PrefixTrieNode(firstLetter);
      }

      child._addWord(restWord, wholeWord);
    },
    addWords: function(wordList) {
      _.each(wordList, function(word) {
        this.addWord(word);
      }, this);
    },
    removeWord: function(word) {
      if (!!word) {
        this._removeWord(word, word);
      }
      return this;
    },
    _removeWord: function(word, wholeWord) {
      var firstLetter, restLetters, child, hasProperChild, childRetVal;

      firstLetter    = _.first(slice.call(word, 0, 1));
      restLetters    = slice.call(word, 1);
      hasProperChild = _.has(this.children, firstLetter);

      if (!firstLetter) {
        var downcased, hasProperWord;

        downcased     = wholeWord.toLocaleLowerCase();
        hasProperWord = _.has(this.words, downcased);

        delete this.words[downcased];
        return hasProperWord;
      } else if (!hasProperChild) {
        return false;
      }

      child = this.getChild(firstLetter);
      childRetVal = child._removeWord;

      if (childRetVal && (child.getOwnWordsCount() <= 0)) {
        child.markedForRemoval = true;
      }

      return childRetVal;
    },

    getChild: function(letter) {
      var l = letter || '';
      return this.children[l.toLocaleLowerCase()];
    },

    getChildCount: function() {
      return _.size(this.children);
    },

    getCasedWords: function() {
      return _.keys(this.words);
    },

    getWords: function() {
      return _.values(this.words);
    },

    getAllWordsMap: function() {
      var words = _.map(this.children, function(node, letter) {
        return node.getAllWordsMap();
      });

      return _.extend.apply(null, ([{}, this.words]).concat(words));
    },

    getAllWords: function() {
      return _.values(this.getAllWordsMap());
    },

    getOwnWordsCount: function() {
      return _.size(this.words);
    },

    getAllWordsCount: function() {
      return _.size(this.getAllWordsMap());
    },

    getValue: function() {
      return this.value;
    },

    getSimilar: function(q, maxDistance) {
      maxDistance || (maxDistance = 0);
      var similar = this.getSimilarWithin(q, q, maxDistance, 0, [], new RunCounter());

      var uniq = _.chain(similar).groupBy(function(r) {
        return r.word;
      }).map(function(words, word) {
        return _.max(words, function(r) {
          if (!r.matches) { return -Infinity; }
          r.matchScore = _.reduce(r.matches, function(memo, match) {
            return memo + (match.end - match.start);
          }, 0);
          return r.matchScore;
        });
      }).value();

      return uniq;
    },

    containsWord: function(w) {
      return !!this.words[w.toLocaleLowerCase()];
    },

    containsWithin: function(q2, maxDistance) {
      function _containsWithin(q1, currentDistance) {
      }
    },

    getSimilarInChildren: function(q, maxDistance, currentDistance) {
    },

    /*
     * q1 - Current query val
     * q2 - Absolute query val
     * maxDistance - maximum edit distance
     * currentDistance - current edit distance
     * results - current matches
     * matches - range of current matches
     */
    getSimilarWithin: function(q1, q2, maxDistance, currentDistance, results, runs) {
      if (this.containsWord(q2)) {
        return results.concat([{
          word: q2,
          matches: runs.getRuns()
        }]).concat(listToResult(this.getAllWords(), runs.getRuns()));
      } else if (currentDistance > maxDistance) {
        return _.clone(results);
      }

      var firstLetter   = _.first(q1),
          restLetters   = _.rest(q1),
          restWord      = restLetters.join(''),
          usePrefix     = true,
          lettersPassed = q2.length - q1.length,
          lettersEqual  = (firstLetter &&
            (this.getValue() === firstLetter.toLocaleLowerCase())),
          shouldFuzzForChildren = ((this.getChildCount() === 0) &&
            (currentDistance < maxDistance)),
          shouldFuzz = shouldFuzzForChildren;

      if (!firstLetter || shouldFuzz) {
        // Out of letters to match by or fuzzing.
        var words = usePrefix ? this.getAllWords() : this.getWords();
        if (lettersEqual) {
          runs.run();
        }

        return listToResult(words, runs.getRuns()).concat(results);
      //} else if (currentDistance === maxDistance) {
      } else {
        if (lettersEqual) {
          runs.run();
        } else {
          if (this.getValue() && this.getValue().length > 0) {
            //currentDistance += 1;
            runs.skip();
          }
        }

        var childResults = _.reduce(this.children, (function(runs) {
          return function(memo, childNode) {
            var similar2 = [],
                similar,
                args1, args2;

            args1 = [
              q1, q2, maxDistance, currentDistance, _.clone(results),
              runs.clone()
            ];

            if (runs.lastWas('skip')) {
              _.extend(args1, {
                '3': currentDistance + 1
              });
              args2 = _.extend([], args1, {
                '0': restWord,
                '5': runs.clone()
              });
            } else if (runs.lastWas('run')) {
              args1[0] = restWord;
            } else if (runs.lastWas(null)) {
            }

            similar = childNode.getSimilarWithin.apply(childNode, args1);
            if (!!args2) {
              similar2 = childNode.getSimilarWithin.apply(childNode, args2);
            }

            return memo.concat(similar, similar2);
          };
        })(runs.clone()), []);

        return childResults.concat(results);
      }

      //return concat.apply(results, _results);
    }
  });

  return PrefixTrieNode;
}

var PrefixTrieNode = PrefixTrieNodeFn();

function FuzzyMatcher() {
  var slice  = Array.prototype.slice,
      concat = Array.prototype.concat,
      bind   = _.bind,
      matcher,
      methods,
      FuzzyMatcher;

  FuzzyMatcher = function() {
    this.initialize.apply(this, slice.call(arguments));
  };

  _.extend(FuzzyMatcher.prototype, {
    initialize: function(options) {
      var opts = _.defaults(options, {
        wordAttribute: 'name'
      });

      _.extend(this, {
        collection    : opts.collection,
        wordAttribute : opts.wordAttribute
      });

      this.buildTrie();
      this.observeCollection();
    },
    buildTrie: function() {
      this.rootNode = new PrefixTrieNode();
      this.collection.each(this.updateAddNode, this);
    },
    getChangeEvent: function() {
      return [
        'change',
        this.wordAttribute
      ].join(':');
    },
    observeCollection: function() {
      var changeEvent = this.getChangeEvent();

      this.collection.
        on('reset', this.buildTrie, this).
        on('add', this.updateAddNode, this).
        on('remove', this.updateRemoveNode, this).
        on(changeEvent, this.updateTrie, this);
    },
    updateTrie: function(model) {
      var oldWord, newWord;
      oldWord = model.previous(this.wordAttribute);
      newWord = model.get(this.wordAttribute);
      this.rootNode.
        addWord(newWord).
        removeWord(oldWord);
    },
    updateAddNode: function(model) {
      var newWord = model.get(this.wordAttribute);
      this.rootNode.addWord(newWord);
    },
    updateRemoveNode: function(model) {
      var oldWord = model.get(this.wordAttribute);
      this.rootNode.removeWord(oldWord);
    },
    off: function() {
      return this.unobserveCollection();
    },
    unobserveCollection: function() {
      var changeEvent = this.getChangeEvent();

      this.collection.
        off('reset', this.buildTrie, this).
        off('add', this.updateAddNode, this).
        off('remove', this.updateRemoveNode, this).
        off(changeEvent, this.updateTrie, this);
    },
    getMatches: function(q, maxDistance) {
      var maxDist = maxDistance || 1;
      return this.rootNode.getSimilar(q, maxDist);
    },
    getMatcher: function(maxDistance) {
      var _this = this;
      return function(q) {
        return _this.getMatches(q, maxDistance);
      };
    }
  });

  methods = {
    FuzzyMatcher: FuzzyMatcher,
    create: function(collection) {
      if (!matcher) {
        matcher = new FuzzyMatcher({
          collection: collection
        });
      }
    },
    getMatcher: function(maxEditDistance) {
      return matcher.getMatcher(maxEditDistance);
    },
    getFormattedMatcher: function(maxEditDistance, fuzzyMatcher) {
      var _matcher;

      if (!!fuzzyMatcher) {
        _matcher = fuzzyMatcher.getMatcher(maxEditDistance);
      } else {
        _matcher = methods.getMatcher(maxEditDistance);
      }

      return function(text) {
        var results = _matcher(text);
        return _.chain(results).map(function(result) {
          return {
            text: result.word,
            id:   result.word,
            matches: _.map(result.matches, function(match) {
              return [match.start, match.end];
            }),
            matchScore: -1 * result.matchScore
          }
        }).sortBy('matchScore').value();
      }
    },
    longestCommonSubranges: function(word, q, offset) {
      var text        = word.toLocaleLowerCase(),
          term        = q.toLocaleLowerCase(),
          termLetters = slice.call(term),
          startPos    = text.indexOf(term),
          popped      = [];

      offset || (offset = 0);

      while (startPos < 0 && !!termLetters.length) {
        popped.unshift(termLetters.pop());
        startPos = text.indexOf(termLetters.join(''))
      }

      if ((startPos >= 0) && (termLetters.length > 0)) {
        var endPos = startPos + termLetters.length,
            range  = [[startPos + offset, endPos + offset]];

        if (popped.length > 0) {
          var nextSubranges = methods.longestCommonSubranges(
            word.slice(endPos), popped.join(''), endPos);

          return range.concat(nextSubranges);
        } else {
          return range;
        }
      } else {
        return []
      }
    }
  };

  return methods;
};
