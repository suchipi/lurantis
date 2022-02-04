# `lurantis`

An HTTP server that bundles and serves packages from NPM; "bundler as a service."

## Usage

Run the server:

```sh
npx lurantis --port 8080
```

Then, send GET requests to it:

```sh
curl http://localhost:8080/npm/lodash@4.17.21
```

It'll fetch the package and all its dependencies from npm, bundle it up into a UMD module, and respond with the script:

```http
HTTP/1.1 200 OK
Content-Type: text/javascript;charset=UTF-8
X-Global-Name: _LUR_lodash_4_17_21

(function (global) {
// ...the rest of the response is omitted from this README...
```

Note the `X-Global-Name` header. This indicates the global that the package's exports will be written to when the bundle is loaded as a script in a browser.

## License

MIT
