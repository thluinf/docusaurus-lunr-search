(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory)
  } else if (typeof exports === 'object') {
    /**
     * Node. Does not work with strict CommonJS, but
     * only CommonJS-like environments that support module.exports,
     * like Node.
     */
    module.exports = factory(require('nodejieba'));
  } else {
    // Browser globals (root is window)
    factory()(root.lunr);
  }
}(this, function(nodejieba) {
  return function(lunr) {
    /* throw error if lunr is not yet included */
    if ('undefined' === typeof lunr) {
      throw new Error('Lunr is not present. Please include / require Lunr before this script.');
    }

    /* throw error if lunr stemmer support is not yet included */
    if ('undefined' === typeof lunr.stemmerSupport) {
      throw new Error('Lunr stemmer support is not present. Please include / require Lunr stemmer support before this script.');
    }

    var isLunr2 = lunr.version[0] == "2";

    /* register specific locale function */
    lunr.zh = function() {
      this.pipeline.reset();
      this.pipeline.add(
        lunr.zh.trimmer,
        lunr.zh.stopWordFilter,
        lunr.zh.stemmer
      );
      //console.log('init lunr.zh');

      // change the tokenizer for japanese one
      if (isLunr2) { // for lunr version 2.0.0
        this.tokenizer = lunr.zh.tokenizer;
      } else {
        if (lunr.tokenizer) { // for lunr version 0.6.0
          lunr.tokenizer = lunr.zh.tokenizer;
        }
        if (this.tokenizerFn) { // for lunr version 0.7.0 -> 1.0.0
          this.tokenizerFn = lunr.zh.tokenizer;
        }
      }
    };

    lunr.zh.tokenizer = function(obj) {
      if (!arguments.length || obj == null || obj == undefined)
        return [];

      if (Array.isArray(obj)) {
        return obj.map(
          function (t) {
            return isLunr2 ? new lunr.Token(t.toLowerCase()) : t.toLowerCase();
          }
        );
      }

      var str = obj.toString().trim().toLowerCase();
      var tokens = [];

      nodejieba.cutForSearch(str, true).forEach(function (seg) {
        tokens = tokens.concat(seg.split(' '));
      });
      tokens = tokens.filter(function (token) {
        return !!token;
      });

      if (!isLunr2) {
        return tokens;
      }

      return tokens.map(function (token, index) {
        var start = str.indexOf(token);
        var tokenMetadata = {};
        tokenMetadata["position"] = [start, token.length];
        tokenMetadata["index"] = index;

        return new lunr.Token(token, tokenMetadata);
      });
    };

    lunr.zh.stemmer = (function() {
      return function (word) {
        return word;
      }
    })();
    lunr.Pipeline.registerFunction(lunr.zh.stemmer, 'stemmer-zh');

    lunr.zh.wordCharacters = "\\w\u4e00-\u9fa5";
    lunr.zh.trimmer = lunr.trimmerSupport.generateTrimmer(lunr.zh.wordCharacters);
    lunr.Pipeline.registerFunction(lunr.zh.trimmer, 'trimmer-zh');

    lunr.zh.stopWordFilter = lunr.generateStopWordFilter(
      '的 一 不 在 人 有 是 為 以 于 上 他 而 后 之 來 及 了 因 下 可 到 由 這 與 也 此 但 開 關 其 已 無 小 我 們 起 最 再 今 去 好 只 又 或 很 亦 某 把 那 你 乃 它 吧 被 比 别 趁 當 從 到 得 打 凡 而 該 各 給 跟 和 何 這 即 幾 既 看 据 距 靠 啦 了 另 麼 每 嘛 拿 哪 那 您 且 却 讓 仍 啥 如 若 使 誰 雖 随 同 所 她 哇 嗡 往 哪 些 向 沿 用 于 咱 則 怎 曾 至 致 着 諸 自'.split(' '));
    lunr.Pipeline.registerFunction(lunr.zh.stopWordFilter, 'stopWordFilter-zh');
  };
}))

