module.exports = function() {
  return {
    name: 'alphatab',

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              src: 'https://docs.alphatab.net/develop/assets/js/alphaTab/alphaTab.min.js'
            }
          },
        ],
      };
    },
  };
};
