# hermione-oauth

Some Remote WebDriver Servers requires OAuth authorization for each request. This plugin is useful for setting of authorization header with OAuth token.

## Install

```bash
npm install hermione-oauth --save-dev
```

## Usage

```js
// .hermione.conf.js
module.exports = {
    // ...
    plugins: {
        "hermione-oauth": {
            enabled: true, // plugin is enabled by default
            token: "<token>", // option also accepts absolute filepath with a token
            help: "https://...", // information on where to get a token
        },
    },
};
```

Each plugin option can be redefined by
- environment variable which starts with prefix `hermione_oauth_`, for example, `hermione_oauth_token=123-456-789`
- CLI option which starts with prefix `--oauth-`, for example, `--oauth-token=123-456-789`
