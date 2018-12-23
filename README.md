# H1B salary viewer

## Some background into this project

In early 2017 [Roger Hau](https://www.linkedin.com/in/roger-hau-79251b34/) and I decided to do an experiment- how much effort would it take to make $100/month in passive income from running ads/affiliate links on simple internet webapp and/or content play.

I also wanted to learn react/es6 and other modern web dev technologies since at work I was stuck using Saltarelle (C# transpiled to Javascript).

So we decided to emulate some of these h1b salary databases (i.e. https://h1bdata.info), put some ads/affiliate links, and see what we could do!

After a few months, we had a built product, with arguably better UI than some of
the most popular H1B salary databases (we had autocomplete, single-page app,
responsive design). Unfortunately, we found out that the game of internet
traffic -> passive income is mostly an exercise in SEO and content marketing.
After a few months of trying that (example of marketing on quora
[here](https://www.quora.com/What-is-average-salary-of-tester-with-4-years-experience-with-h1b-in-USA),
we gave up and concluded that *trying to make $100/month passive income using
ads alone is pretty hard*.

Anyways, so here's the code we wrote. Architecture consists of:

- React/es6 front end - see `scripts`
- Simple Golang backend that issues requests to database - see `src/pi`
- Nginx web server (see `nginx`)
- MySQL database running in Google cloud (unfortunately configuration was not backed up in code, but it was basically a dump of excel files from US Department of Labor's website into MySQL)

Our domain was `h1bdata.us` which pointed to a Google cloud machine that is now
used by `Trifecta Wrangler` (see the redirection from `h1bdata.us`)

One of these days, I'll clean up the code/README so that deployment is even simpler,
officially open source it (maybe folks would find it useful for displaying any
sort of "giant spreadsheet as a webapp"), and deploy an instance of it.

-Steven

## quick start for development
1. Cd into this directory:
2. run the following command
```
source dev_init.sh
```

## Go server
All code is contained in `src/pi` directory

## Database

### Connecting to database

```
brew install mysql
mysql -u rhau -p -h 146.148.32.104 h1b
```

### starting the server
```
cd .
brew install go

cd src/pi
go get
go build
chmod +x pi
./pi
```

You should now be able to hit http://localhost:8000/ and see a bunch of data

## Javascript client

All code is contained in `scripts` directory, plus a bunch of extraneous stuff at root directory (TODO move that all into client director)

### Starting the client

Make sure you are running node v7.7.1, npm > 4

```
npm install
npm start
```

Open http://localhost:5000 to test
http://localhost:5000/webpack-dev-server/index.html to developer-mode

### Linting

ESLint with React linting options have been enabled.

```
npm run lint
```

### Pushing to production

Manual testing prod locally, feel free to skip
1. Run `npm run build` to build `prod/bundle.js` file
2. Open`index.html` to test locally in browser without the webpack dev server present

You must run this:
3. Follow these instructions for how to get access into prod machine and push changes https://docs.google.com/document/d/16Lu2ARPiW7Zrr2JQUu_CkHCMf-KtDiKCKGvYPRfY5PM/edit#


### based on https://github.com/stevenqzhang/react-es6-webpack-boilerplate

Boilerplate for kick starting a project with the following technologies:
* [React](https://github.com/facebook/react)
* [Babel 6](http://babeljs.io)
* [Webpack](http://webpack.github.io) for bundling
* [Webpack Dev Server](http://webpack.github.io/docs/webpack-dev-server.html)
* [React Transform](https://github.com/gaearon/react-transform-hmr) for hot reloading React components in real time.
