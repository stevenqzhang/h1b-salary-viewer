//170511 szhang: I think this file is just used to do the sourcemapping?

var testsContext = require.context('./scripts', true, /-test\.jsx?$/);
testsContext.keys().forEach(testsContext);

var srcContext = require.context('./scripts', true, /^((?!tests).)*.jsx?$/);
srcContext.keys().forEach(srcContext);
