var pocketwrench = require('pocketwrench');

module.exports = function() {

  var defaultArray = function(count, defaultValue) {
    var ds = [];

    for(var x = 0; x < count; x++) {
      ds.push(defaultValue);
    }

    return ds;
  };

  var sum = function(list) {
    return list.reduce(
      function(previous, current, index, array)
      {
        return previous + current;
      }, 0);
  };

  var multiplyArray = function(array1, array2) {
    if(array1.length != array2.length) {
      return [];
    }

    var result = [];

    for(var x = 0; x < array1.length; x++) {
      result.push(array1[x] * array2[x]);
    }

    return result;
  };

  var countOccurrences = function(dataset, fieldName, value) {
    var x = dataset.filter(function(elem, pos) {
      return elem[fieldName] == value;
    });

    return x.length;
  };

  var maxEntity = function(collection, fieldName) {
    var maxElement = null;

    for(var x = 0; x < collection.length; x++) {
        if(maxElement === null || collection[x][fieldName] > maxElement[fieldName]) {
          maxElement = collection[x];
        }
    }

    return maxElement;
  };

  var uniqueValues = function(input) {
    return input.filter(function(elem, pos) {
      return input.indexOf(elem) == pos;
    });
  };

  var uniqueCategories = function(dataset) {
    var categories = [];

    for(var x = 0; x < dataset.length; x++) {
      categories.push(dataset[x].category);
    }

    return uniqueValues(categories);
  };

  var buildVocabulary = function(dataset) {
    var vocab = [];

    for(var x = 0; x < dataset.length; x++) {
      vocab = vocab.concat(dataset[x].datapoints);
    }

    return uniqueValues(vocab);
  };

  var convertTokenList = function(tokenList, vocabulary) {
    var tokenVector = [];

    for(var y = 0; y < vocabulary.length; y++) {
      if(tokenList.indexOf(vocabulary[y]) == -1) {
        tokenVector.push(0);
      }
      else {
        tokenVector.push(1);
      }
    }

    return tokenVector;
  };

  var buildTrainingMatrix = function(dataset, vocabulary) {
    var trainingMatrix = [];

    for(var x = 0; x < dataset.length; x++) {
      trainingMatrix.push(
        {
          category : dataset[x].category,
          tokens : convertTokenList(dataset[x].datapoints, vocabulary)
        });
    }

    return trainingMatrix;
  };

  var train = function(dataset) {
    var trainedDataset = {
      vocabulary : buildVocabulary(dataset),
      probabilities : []
    };
    var uniqueCats = uniqueCategories(dataset);
    var trainingMatrix = buildTrainingMatrix(dataset, trainedDataset.vocabulary);

    for(var x = 0; x < uniqueCats.length; x++) {
      trainedDataset.probabilities.push({
        category : uniqueCats[x],
        probability : countOccurrences(dataset, 'category', uniqueCats[x]) / dataset.length,
        tokenProbNum : defaultArray(trainingMatrix[0].tokens.length, 1),
        tokenProbDenum : 2.0
      });
    }

    for(var y = 0; y < trainingMatrix.length; y++) {
      var cat = pocketwrench.array.findFirstByField(trainedDataset.probabilities, 'category', trainingMatrix[y].category);
      cat.tokenProbDenum += sum(trainingMatrix[y].tokens);
      for(var z = 0; z < trainingMatrix[0].tokens.length; z++)  {
        cat.tokenProbNum[z] += trainingMatrix[y].tokens[z];
      }
    }

    for(var i = 0; i < trainedDataset.probabilities.length; i++) {
      for(var j = 0; j < trainedDataset.probabilities[0].tokenProbNum.length; j++) {
        trainedDataset.probabilities[i].tokenProbNum[j] =
          Math.log(trainedDataset.probabilities[i].tokenProbNum[j] / trainedDataset.probabilities[i].tokenProbDenum);
      }
    }

    return trainedDataset;
  };

  var tokenize = function(text) {
    var wordsList = text.toLowerCase().match(/\b\w+\b/g);
    return uniqueValues(wordsList);
  };

  var classify = function(input, trainedDataset) {
    if(!Array.isArray(input)) {
      input = tokenize(input);
    }

    var inputTokens = convertTokenList(input, trainedDataset.vocabulary);

    var probs = [];

    for(var x = 0; x < trainedDataset.probabilities.length; x++) {
      probs.push(
        {
          category: trainedDataset.probabilities[x].category,
          probability : sum(multiplyArray(inputTokens, trainedDataset.probabilities[x].tokenProbNum)) + Math.log(trainedDataset.probabilities[x].probability)
        }
      );
    }

    return maxEntity(probs, 'probability');

  };

  return {
    tokenize : tokenize,
    train: train,
    classify : classify
  };
}();
