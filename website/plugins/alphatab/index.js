module.exports = function(context, options) {
  return {
    name: 'alphatab',

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              src: options.alphaTab || 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@alpha/dist/alphaTab.min.js'
            }
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'stylesheet',
              href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'
            }
          },

          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              src: 'https://code.jquery.com/jquery-3.4.1.slim.min.js'
            }
          },
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              src: 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js'
            }
          }, 
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              src: 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js'
            }
          },
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              src: 'https://kit.fontawesome.com/b43f0e512e.js'
            }
          }
        ],
      };
    },
  };
};
