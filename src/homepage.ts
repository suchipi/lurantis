import { Request, Response } from "express";

const content = (domain: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Lurantis</title>
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          color: #555;
          margin: 0 auto;
          max-width: 50em;
          font-family: "Helvetica", "Arial", sans-serif;
          line-height: 1.5;
          padding: 2em 1em;
          --accent-color: #e07178;
          --secondary-color-dark: #79c7a7;
          --secondary-color-light: #edfff8;
        }

        h1, h2, h3, h4, h5, h6 {
          border-bottom: 2px solid var(--secondary-color-dark);
          margin-bottom: 0.25em;
        }

        h1 {
          font-size: 2.5em
        }

        #lurantis {
          color: var(--accent-color);
        }

        h2 {
          font-size: 2em;
        }

        h3 {
          font-size: 1.5em
        }

        h2, h3 {
          margin-top: 1.5em;
        }

        h1, h2, strong {
          color: #333;
        }

        code, pre {
          background: var(--secondary-color-light);
        }

        code {
          padding: 2px 4px;
          vertical-align: text-bottom;
        }

        pre {
          border-left: 2px solid var(--accent-color);
          padding: 1em;
        }

        a {
          color: var(--accent-color);
        }
      </style>
    </head>
    <body>
      <h1>Welcome to <span id="lurantis">Lurantis</span>!</h1>
      <p>
        Lurantis is an on-demand caching bundler that serves npm packages in a
        format that makes them suitable for use in script tags in the browser.
      </p>
      <p>
        It makes it easy to use npm packages on websites without needing a build
        step for your app.
      </p>
      <h2>Usage</h2>
      <p>
        To get an npm package from Lurantis, make a request to
        <code>${domain}/npm/&lt;package&gt;@&lt;version&gt;</code>.
      </p>
      <p>
        For instance, to get lodash v4.17.21, make a web request to this URL:
      </p>
      <pre><code>${domain}/npm/lodash@4.17.21</code></pre>
      <p>
        That will give you a JavaScript file that exposes lodash as a global
        variable with this name:
      </p>
      <pre><code>_LUR_lodash_4_17_21</code></pre>
      <p>
        You can use it in a script tag like so:
      </p>
      <pre><code>&lt;script src="${domain}/npm/lodash@4.17.21"&gt;&lt;/script&gt;</pre></code>
      <p>
        You can also add <code>?minify=true</code> to the end of the URL to minify
        the code.
      </p>
      <h2>About the global variable</h2>
      <p>
        The format of the global variable will always be like this, and will
        be the same each time the same package is requested:
      </p>
      <pre><code>_LUR_packageNameInCamelCase_VERSION_WITH_UNDERSCORES_FOR_DOTS</code></pre>
      <p>
        The name of the global variable will also be present as a response
        header for the request for the script, as <code>X-Global-Name</code>.
        It won't ever change, but you can use this the first time you request
        the script to make sure you know what to use in your code. The easiest
        way to see this response header is by adding the script tag to your
        page, then checking the "Network" tab in your browser's Developer Tools.
      </p>
      <h2>Caching</h2>
      <p>
        The first time Lurantis receives a request for a given version of an
        npm package, it will build it. After that, it will serve the cached
        result.
      </p>
      <p>
        Lurantis requires that you specify an exact version of a package, not
        a range or tag. This way, it can guarantee that each URL will always
        return the same result, which makes it safe to cache.
      </p>
      <h2>Credits</h2>
      <p>
        Lurantis is made with love by <a href="https://suchipi.com" target="_blank">Lily Scott</a>. And, yes, it's named after the Pokémon.
      </p>
    </body>
  </html>
`;

export function homepage(req: Request, res: Response) {
  const domain = `http://${req.headers.host}`;
  const html = content(domain);
  res.status(200);
  res.send(html);
}
