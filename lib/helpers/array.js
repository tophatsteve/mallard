
module.exports = function() {

  var findFirstByField = function(collection, fieldName, value) {
    for(var x = 0; x < collection.length; x++) {
      if(collection[x][fieldName] === value) {
        return collection[x];
      }
    }
    return null;
  };

  var findFirstIndexByField = function(collection, fieldName, value) {
    for(var x = 0; x < collection.length; x++) {
      if(collection[x][fieldName] === value) {
        return x;
      }
    }
    return null;
  };

  var findByField = function(collection, fieldName, value) {
    var results = [];
    for(var x = 0; x < collection.length; x++) {
      if(collection[x][fieldName] === value) {
        results.push(collection[x]);
      }
    }
    return results;
  };

  var sortByField = function(collection, fieldName, desc) {
    // copy array so function is non-destructive
    var tmp = Array.apply(null, collection);
    tmp.sort(function(a,b) {
      if(desc) {
        return a[fieldName] < b[fieldName] ? 1 : a[fieldName] > b[fieldName] ? -1 : 0;
      }
      else {
        return a[fieldName] < b[fieldName] ? -1 : a[fieldName] > b[fieldName] ? 1 : 0;
      }
    });
    return tmp;
  };

  var mostFrequentElement = function(collection, fieldName) {
    var results = {};

    for(var x = 0; x < collection.length; x++) {
      if(results[collection[x][fieldName]]) {
        results[collection[x][fieldName]].count++;
      }
      else {
        results[collection[x][fieldName]] = {};
        results[collection[x][fieldName]].value = collection[x][fieldName];
        results[collection[x][fieldName]].count = 1;
      }
    }

    var maxElement = null;
    var maxCount = 0;

    for(y = 0; y < Object.keys(results).length; y++) {
      if(results[Object.keys(results)[y]].count > maxCount) {
        maxCount = results[Object.keys(results)[y]].count;
        maxElement = results[Object.keys(results)[y]].value;
      }
    }

    return maxElement;
  };

  return {
    findFirstByField : findFirstByField,
    findFirstIndexByField : findFirstIndexByField,
    findByField : findByField,
    sortByField : sortByField,
    mostFrequentElement : mostFrequentElement
  };

}();
