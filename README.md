## hi!

Thanks for checking out our code. The documentation below may be incomplete or incorrect. We welcome pull requests! But we're a very small team, so we can't guarantee timely responses.

[![Code Climate](https://codeclimate.com/github/Hylozoic/hylo-frontend/badges/gpa.svg)](https://codeclimate.com/github/Hylozoic/hylo-frontend)

## Setup

First, run good old `npm install`. Also run this after changing anything in `bower.json` or `package.json`.

Create a file named `.env` in the root of the repo, with contents like this:

```
AWS_S3_BUCKET=hylo-dev
AWS_S3_CONTENT_URL=http://hylo-dev.s3.amazonaws.com
FB_CLIENTID=foo
FILEPICKER_API_KEY=foo
ROLLBAR_CLIENT_TOKEN=foo
SEGMENT_IO_KEY=foo
NEW_RELIC_LICENSE_KEY=foo
```

### Development server

Start it with `npm run start`, then visit `localhost:3001`. It watches changes to the Javascript and CSS files under `src`, and creates/updates the "bundle" files named `bundle.js` and `bundle.css` in the `dist/` directory.

It serves files in `dist/` and proxies all other requests to the "upstream" server. (see `Proxy behavior`)

#### Live Reload

Install [Live Reload browser extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) and turn it on for the
localhost:3001 page by pressing the livereload button that was added to the toolbar next to the URL.

Once installed and turned on for the page, it will automatically reload your page after you make any changes
to the code.

### Proxy behavior

Requests that start with `/noo` are proxied to the Node API. Set its location with `--upstream`.

e.g.: `grunt dev --upstream localhost:1337`, aliased as `npm run dev`

### Deploying

Commit all your changes before deploying. The filenames of the deployed assets will include the first 8 characters of the most recent commit hash.

Make sure to have your [Heroku API token](https://heroku.com/account) to the `.env` file like so:

```
HEROKU_API_TOKEN=[your token here]
```

Run `grunt deploy --to=env`, where `app` is either `staging` or `production`. The task will upload assets to the app's S3 bucket and change the app's config variables to point to the newly-uploaded assets.

### (un)license

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to http://unlicense.org/
