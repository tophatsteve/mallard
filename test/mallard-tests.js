var fs = require('fs');
var mallard = require('../index');
var expect = require('chai').expect;

describe('Mallard Unit Tests', function () {
  'use strict';

  var nominalDataset = [
    {"category" : "A", "datapoints" : ["red","large","no","old"]},
    {"category" : "B", "datapoints" : ["red","large","no","young"]},
    {"category" : "A", "datapoints" : ["red","large","yes","old"]},
    {"category" : "C", "datapoints" : ["red","large","yes","young"]},
    {"category" : "A", "datapoints" : ["red","small","no","old"]},
    {"category" : "B", "datapoints" : ["red","small","no","young"]},
    {"category" : "A", "datapoints" : ["red","small","yes","old"]},
    {"category" : "C", "datapoints" : ["red","small","yes","young"]},
    {"category" : "A", "datapoints" : ["green","large","no","old"]},
    {"category" : "B", "datapoints" : ["green","large","no","young"]},
    {"category" : "A", "datapoints" : ["green","large","yes","old"]},
    {"category" : "C", "datapoints" : ["green","large","yes","young"]},
    {"category" : "A", "datapoints" : ["green","small","no","old"]},
    {"category" : "B", "datapoints" : ["green","small","no","young"]},
    {"category" : "A", "datapoints" : ["green","small","yes","old"]},
    {"category" : "A", "datapoints" : ["green","small","yes","young"]},
    {"category" : "A", "datapoints" : ["blue","large","no","old"]},
    {"category" : "A", "datapoints" : ["blue","large","no","young"]},
    {"category" : "A", "datapoints" : ["blue","large","yes","old"]},
    {"category" : "C", "datapoints" : ["blue","large","yes","young"]},
    {"category" : "A", "datapoints" : ["blue","small","no","old"]},
    {"category" : "B", "datapoints" : ["blue","small","no","young"]},
    {"category" : "A", "datapoints" : ["blue","small","yes","old"]},
    {"category" : "A", "datapoints" : ["blue","small","yes","young"]}
  ];

  var nominalDatasetLabels = ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'];

  var continuousDataset;

  before(function() {
    var buffer = fs.readFileSync('test/largeContinuousDataset.json', 'utf8');
    continuousDataset = JSON.parse(buffer);
  });

  describe('kNN Tests', function() {
    this.timeout(15000);
    it('Should return k neighbours', function() {
      var input = [10311, 2.654, 0.7932];
      var kNN = mallard.kNN.kNN(input, continuousDataset, 3);
      expect(kNN.length).to.equal(3);
    });

    it('Should have at least a 90% accuracy rate', function() {
      var correctlyIdentified = 0;
      for(var x = 0; x < continuousDataset.length; x++) {
        var category = mallard.kNN.classify(continuousDataset[x].datapoints, continuousDataset, 3);
        if(category == continuousDataset[x].category) {
          correctlyIdentified++;
        }
      }
      var percentageCorrect = (correctlyIdentified / continuousDataset.length) * 100.0;
      expect(percentageCorrect).to.be.at.least(90);
    });
  });

  describe('ID3 Tests', function() {
    it('Should split the dataset on the most appropriate feature', function() {
      var tree = mallard.ID3.createTree(nominalDataset, nominalDatasetLabels);
      var topNodeSplit = Object.keys(tree)[0];
      expect(topNodeSplit).to.equal('Feature 4');
    });
    it('Should have at least a 90% accuracy rate', function() {
      var tree = mallard.ID3.createTree(nominalDataset, nominalDatasetLabels);
      var correctlyIdentified = 0;
      for(var x = 0; x < nominalDataset.length; x++) {
        var category = mallard.ID3.classify(nominalDataset[x].datapoints, tree, nominalDatasetLabels);
        if(category == nominalDataset[x].category) {
          correctlyIdentified++;
        }
      }
      var percentageCorrect = (correctlyIdentified / nominalDataset.length) * 100.0;
      expect(percentageCorrect).to.be.at.least(90);
    });

  });

  // The male birds have a glossy green head and are grey on wings and belly, while the females have mainly brown-speckled plumage.
  // The male has a dark green head, a yellow bill, is mainly purple-brown on the breast and grey on the body.
  // The female is mainly brown with an orange bill
  // The males sport a glossy green head and white neck ring, and what the females lack in colour they make up for in noise.
  // The green head and yellow bill of the mallard duck is a familiar sight to many people living in the Northern hemisphere

  // The bird is predominantly black and white, with the back feathers being iridescent and glossy in males, while the females are more drab.
  // Wild Muscovy ducks are all black with white patches on the upper and under wing.
  // They may be black, blue, chocolate, lavender or white
  // The original, wild type, coloration is black and white, but domestication has produced many more colors, including white, black, chocolate, and blue


  describe('Naive Bayes Tests', function() {
    it('Should remove duplicates when tokenizing', function() {
      var testString = 'This string has some duplicates, duplicates are in this string.';
      var tokens = mallard.bayes.tokenize(testString);
      expect(tokens.length).to.equal(7);
      expect(tokens[0]).to.equal('this');
      expect(tokens[1]).to.equal('string');
      expect(tokens[2]).to.equal('has');
      expect(tokens[3]).to.equal('some');
      expect(tokens[4]).to.equal('duplicates');
      expect(tokens[5]).to.equal('are');
      expect(tokens[6]).to.equal('in');
    });
    it('Should remove punctuation when tokenizing', function() {
      var testString = 'This string, has some, punctuation!';
      var tokens = mallard.bayes.tokenize(testString);
      var tokenizedString = tokens.join(' ');
      var indexOfComma = tokenizedString.indexOf(',');
      expect(indexOfComma).to.equal(-1);
    });
    it('Should use the training dataset to create a vocabulary with unique values', function() {
      var trainedDataset = mallard.bayes.train(nominalDataset);
      expect(trainedDataset.vocabulary.length).to.equal(9);
    });
    it('Should use the training dataset to create a probability row for each category', function() {
      var trainedDataset = mallard.bayes.train(nominalDataset);
      expect(trainedDataset.probabilities.length).to.equal(3);
    });
    it('Should have at least a 85% accuracy rate', function() {
      var trainedDataset = mallard.bayes.train(nominalDataset);
      var correctlyIdentified = 0;
      for(var x = 0; x < nominalDataset.length; x++) {
        var result = mallard.bayes.classify(nominalDataset[x].datapoints, trainedDataset);
        if(result.category == nominalDataset[x].category) {
          correctlyIdentified++;
        }
      }
      var percentageCorrect = (correctlyIdentified / nominalDataset.length) * 100.0;
      expect(percentageCorrect).to.be.at.least(85);
    });
  });
});
