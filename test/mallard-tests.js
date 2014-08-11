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

});
