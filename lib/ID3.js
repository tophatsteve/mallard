var array = require('./helpers/array');
var math = require('./helpers/math');
var object = require('./helpers/object');

module.exports = function() {

  var uniqueValues = function(dataset, column) {
    var unique = {};

    for(var x = 0; x < dataset.length; x++) {
      var value = dataset[x].datapoints[column];
      if(!unique[value]) {
        unique[value] = value;
      }
    }

    var uniqueVals = [];

    for(var y = 0; y < Object.keys(unique).length; y++) {
      uniqueVals.push(unique[Object.keys(unique)[y]]);
    }

    return uniqueVals;
  };

  var uniqueCategories = function(dataset) {
    var unique = {};

    for(var x = 0; x < dataset.length; x++){
      var category = dataset[x].category;
      if(!unique[category]) {
        unique[category] = category;
      }
    }

    var uniqueVals = [];

    for(var y = 0; y < Object.keys(unique).length; y++) {
      uniqueVals.push(unique[Object.keys(unique)[y]]);
    }

    return uniqueVals;
  };

  var getShannonEntropy = function(dataset) {
    var categoryCounts = {};

    for(var x = 0; x < dataset.length; x++) {
      if(categoryCounts[dataset[x].category]) {
        categoryCounts[dataset[x].category] += 1;
      }
      else {
        categoryCounts[dataset[x].category] = 1;
      }
    }

    var ent = 0.0;

    for(var y = 0; y < Object.keys(categoryCounts).length; y++) {
      var probability = categoryCounts[Object.keys(categoryCounts)[y]] / dataset.length;
      ent -= probability * math.logx(probability, 2);
    }

    return ent;

  };

  var splitDataset = function(dataset, column, value) {
    var splitSet = [];

    for(var x = 0; x < dataset.length; x++) {
      if(dataset[x].datapoints[column] == value) {
        var entry = {
          category : dataset[x].category,
          datapoints : dataset[x].datapoints.slice()
        };
        entry.datapoints.splice(column, 1);
        splitSet.push(entry);
      }
    }

    return splitSet;
  };

  var getBestSplit = function(dataset) {
    var baseEntropy = getShannonEntropy(dataset);
    var numberOfFeatures = dataset[0].datapoints.length;
    var bestInfoGain = 0.0;
    var bestColumn = -1;

    for(var col = 0; col < numberOfFeatures; col++) {
      var uniqueVals = uniqueValues(dataset, col);
      var newEntropy = 0.0;
      for(var y = 0; y < uniqueVals.length; y++) {
        var subset = splitDataset(dataset, col, uniqueVals[y]);
        var prob = subset.length / dataset.length;
        newEntropy += prob * getShannonEntropy(subset);
      }
      var infogain = baseEntropy - newEntropy;
      if(infogain > bestInfoGain) {
        bestInfoGain = infogain;
        bestColumn = col;
      }
    }
    return bestColumn;
  };

  var createTree = function(dataset, columnLabels) {
    var uniqueCats = uniqueCategories(dataset);

    if(uniqueCats.length == 1) {
      return uniqueCats[0];
    }

    if(dataset.length == 1) {
      return dataset[0].category;
    }

    var bestSplit = getBestSplit(dataset);
    var tree = {};
    tree[columnLabels[bestSplit]] = {};

    var subLabels = columnLabels.slice();
    subLabels.splice(bestSplit, 1);
    var uniqueVals = uniqueValues(dataset, bestSplit);

    for(var x = 0; x < uniqueVals.length; x++) {
      tree[columnLabels[bestSplit]][uniqueVals[x]] = createTree(splitDataset(dataset, bestSplit, uniqueVals[x]), subLabels);
    }

    return tree;
  };

  var classify = function(input, tree, labels) {
    var rootLabel = Object.keys(tree)[0];
    var rootFeatureIndex = labels.indexOf(rootLabel);
    var subtree = tree[rootLabel];

    for(var x = 0; x < Object.keys(subtree).length; x++) {
      if(input[rootFeatureIndex] == Object.keys(subtree)[x]) {
        if(object.isDictionary(subtree[Object.keys(subtree)[x]])) {
          return classify(input, subtree[Object.keys(subtree)[x]], labels);
        }
        else {
          return subtree[Object.keys(subtree)[x]];
        }
      }
    }
  };

  return {
    createTree : createTree,
    classify: classify
  };

}();
