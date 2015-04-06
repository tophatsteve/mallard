var pocketwrench = require('pocketwrench');
module.exports = (function() {

  var calculateDistance = function(dp1, dp2) {
    var total = 0.0;

    for(var x = 0; x < dp1.length; x++) {
      total += Math.pow((dp1[x] - dp2[x]), 2);
    }
    return Math.sqrt(total);
  };

  var getMins = function(dataset) {
    var mins = [];

    for(var i = 0; i < dataset[0].datapoints.length; i++) {
      mins.push(999999);
    }

    for(var x = 0; x < dataset.length; x++) {
      for(var y = 0; y < dataset[x].datapoints.length; y++) {
        if(dataset[x].datapoints[y] < mins[y]) {
          mins[y] = dataset[x].datapoints[y];
        }
      }
    }

    return mins;
  };

  var getMaxs = function(dataset) {
    var maxs = [];

    for(var i = 0; i < dataset[0].datapoints.length; i++) {
      maxs.push(-999999);
    }

    for(var x = 0; x < dataset.length; x++) {
      for(var y = 0; y < dataset[x].datapoints.length; y++) {
        if(dataset[x].datapoints[y] > maxs[y]) {
          maxs[y] = dataset[x].datapoints[y];
        }
      }
    }

    return maxs;
  };

  var normaliseDatapoints = function(dps, mins, maxs) {
    var normalised = [];
    for(var y = 0; y < dps.length; y++) {
      var normalisedValue = (dps[y] - mins[y]) / (maxs[y] - mins[y]);
      normalised.push(normalisedValue);
    }

    return normalised;
  };

  var normaliseDataset = function(dataset) {
    var normalised = [];
    var mins = getMins(dataset);
    var maxs = getMaxs(dataset);

    for(var x = 0; x < dataset.length; x++) {
      var row = {
        category: dataset[x].category,
        datapoints : normaliseDatapoints(dataset[x].datapoints, mins, maxs)
      };
      normalised.push(row);
    }

    return normalised;
  };

  var normaliseInput = function(input, dataset) {
    var mins = getMins(dataset);
    var maxs = getMaxs(dataset);
    return normaliseDatapoints(input, mins, maxs);
  };

  var kNN = function(input, dataset, k) {
    var distances = [];

    var normalisedDataset = normaliseDataset(dataset);
    var normalisedInput = normaliseInput(input, dataset);

    for(var x = 0; x < normalisedDataset.length; x++) {
      var distance = calculateDistance(normalisedInput, normalisedDataset[x].datapoints);
      distances.push({category: normalisedDataset[x].category, distance: distance});
    }

    var sortedDistances = pocketwrench.array.sortByField(distances, 'distance');
    return sortedDistances.slice(0,k);
  };

  var classify = function(input, dataset, k) {
    var knn = kNN(input, dataset, k);
    return pocketwrench.array.mostFrequentElement(knn, 'category');
  };

  return {
    kNN: kNN,
    classify: classify
  };
}());
