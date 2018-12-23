# H1b webapp


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
