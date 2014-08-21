
var kNN = require('./lib/kNN');
var ID3 = require('./lib/ID3');
var bayes = require('./lib/naiveBayes');

module.exports = {
  kNN: kNN,
  ID3: ID3,
  bayes: bayes
};
