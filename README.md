mallard
========

Data Classification and Machine Learning algorithms.

[![NPM version](https://badge.fury.io/js/mallard.svg)](http://badge.fury.io/js/mallard)
[![Build Status](https://travis-ci.org/tophatsteve/mallard.svg?branch=master)](https://travis-ci.org/tophatsteve/mallard)
[![Coverage Status](https://img.shields.io/coveralls/tophatsteve/mallard.svg)](https://coveralls.io/r/tophatsteve/mallard?branch=master)

### Module Overview

Based on the book [Machine Learning in Action](http://www.manning.com/pharrington/) by Peter Harrington, *mallard* contains a
translation of the algorithms from the orignal Python into JavaScript. The algorithms implemented so far are:

- [kNN](http://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) -  The k nearest neighbours algorithm classifies an unknown
entity by working out the closest neighbours to it in a known dataset. The known data needs to be numerical so that distances
between neighbours can be calculated.
- [ID3](http://en.wikipedia.org/wiki/ID3_algorithm) - The ID3 decision tree algorithm uses known data to produce a decision tree
that can then be used to classify an unknown entity. The known data for this algorithm needs to be discrete values because
the generated decision tree checks for exactly matched values.
- [Naive Bayes](http://en.wikipedia.org/wiki/Naive_Bayes_classifier) - The Naive Bayes algorithm uses a training dataset to calculate
the probabilities of a datapoint occurring in each category. These probabilities are then mapped onto the datapoints in the
input, and a most probable category computed.

### Usage

To load *mallard*, just require it:

```javascript
var mallard = require('mallard');
```

In order to correctly classify an entity, the algorithms require a dataset of already known data. This is provided in the
format of an array of objects, each object having two properties. The first property is *category*, which gives the
classification of the object. The second property is *datapoints* which is an array of the values of the known features
of that object.

```javascript
var dataset = [
  { "category" : "A", "datapoints" : ["x", "y", "z"]},
  { "category" : "B", "datapoints" : ["s", "t", "u"]}
];
```

#### kNN

Suppose we have a mystery duck (just go with me on this), and we want to know whether it is a member of the Mallard family or the Muscovy family. Now,
we know the length, wingspan, weight and type of a bunch of ducks, so we load all the data into a dataset as follows:

*Note: This data is entirely fictional, so please do not use it in any live duck classification schenarios.*

```javascript
var continuousDataset = [
  { "category" : "Mallard", "datapoints" : [55, 87, 0.953952]},
  { "category" : "Mallard", "datapoints" : [51, 81, 0.917523]},
  { "category" : "Muscovy", "datapoints" : [72, 140, 1.126542]},
  { "category" : "Mallard", "datapoints" : [60, 90, 1.351631]},
  { "category" : "Mallard", "datapoints" : [67, 95, 1.512341]},
  { "category" : "Muscovy", "datapoints" : [66, 150, 2.354634]},
  { "category" : "Muscovy", "datapoints" : [81, 145, 4.344334]},
  { "category" : "Muscovy", "datapoints" : [84, 137, 3.123083]},
  { "category" : "Mallard", "datapoints" : [57, 89, 0.812545]},  
  { "category" : "Muscovy", "datapoints" : [65, 150, 2.124541]},
  { "category" : "Mallard", "datapoints" : [61, 90, 1.0065432]},
  { "category" : "Muscovy", "datapoints" : [70, 139, 1.7846383]}
];
```

Now we measure our mystery duck and find that it is 72cm long, has a wingspan of 105cm and weighs 2.123234kg, so we use the *kNN* function
to find the nearest k matching ducks to these measurements. In this case we set k to 3.

```javascript
mallard.kNN.kNN([72, 105, 2.123234], continuousDataset, 3)

==> [ { category: 'Mallard',
        distance: 0.2718076518009722 },
      { category: 'Mallard',
        distance: 0.47667718685043636 },
      { category: 'Muscovy',
        distance: 0.505638657863494 } ]
```

The *kNN* function returns the 3 nearest ducks, which are 2 Mallards and 1 Muscovy, so we can take the majority vote and say that our duck is
a Mallard. If we just want the classification and don't really want to see the neighbours, we can just use the *classify* function:

```javascript
mallard.kNN.classify([72, 105, 2.123234], continuousDataset, 3)

==> "Mallard"
```

#### ID3 Decision Tree

Suppose we can't catch our mystery duck in order to measure it, but we do at least know what it looks like. If we know what typical Mallard and Muscovy
ducks look like we can use an ID3 decision tree to work through the possibilities. We load the data for the decision tree the same way as we load
the data for the kNN algorithm:

```javascript
var discreteDataset = [
  {"category" : "Mallard", "datapoints" : ["green", "male", "adult"]},
  {"category" : "Mallard", "datapoints" : ["brown", "female", "adult"]},
  {"category" : "Mallard", "datapoints" : ["green", "male", "child"]},
  {"category" : "Mallard", "datapoints" : ["brown", "female", "child"]},
  {"category" : "Muscovy", "datapoints" : ["black", "male", "adult"]},
  {"category" : "Muscovy", "datapoints" : ["black", "female", "adult"]},
  {"category" : "Muscovy", "datapoints" : ["white", "male", "child"]},
  {"category" : "Muscovy", "datapoints" : ["white", "female", "child"]}
];
```

In addition we also specify what each column represents. This is used in building the tree, and can be used to visually verify the tree is
structured correctly.

```javascript
var featureNames = ["head colour", "sex", "age"];

```

Before we can classify our duck using ID3, we first need to build a decision tree from our sample data using the *createTree* function:

```javascript
var tree = mallard.ID3.createTree(discreteDataset, featureNames);
```

We can then use that generated tree to examine our mystery duck. If we know our mystery duck is a male child with a white head then we can
use the *classify* function as follows:

```javascript
mallard.ID3.classify(["white", "male", "child"], tree, featureNames)

==> "Muscovy"
```

#### Naive Bayes

Suppose we have a set of descriptions for our two different types of duck, and then a description of a mystery duck, and we want to
find out what our mystery duck is. Naive Bayes excels at classifying items based on the probability that certain tokens (words)
are associated with a category.

To use Naive Bayes, first we need to train the algorithm using our set of known descriptions. *tokenize* is a
convenience function which will convert a sentence into a set of tokens to be used as the datapoints in the algorithm.
*train* will take our training dataset and calculate the probabilities that each token appears in each category.

```javascript
var ducks = [
  {"category" : "Mallard", "datapoints" : mallard.bayes.tokenize('The male birds have a glossy green head and are grey on wings and belly, while the females have mainly brown-speckled plumage.')},
  {"category" : "Mallard", "datapoints" : mallard.bayes.tokenize('The male has a dark green head, a yellow bill, is mainly purple-brown on the breast and grey on the body.')},
  {"category" : "Mallard", "datapoints" : mallard.bayes.tokenize('The female is mainly brown with an orange bill')},
  {"category" : "Mallard", "datapoints" : mallard.bayes.tokenize('The males sport a glossy green head and white neck ring, and what the females lack in colour they make up for in noise.')},
  {"category" : "Mallard", "datapoints" : mallard.bayes.tokenize('The green head and yellow bill of the mallard duck is a familiar sight to many people living in the Northern hemisphere.')},
  {"category" : "Muscovy", "datapoints" : mallard.bayes.tokenize('The bird is predominantly black and white, with the back feathers being iridescent and glossy in males, while the females are more drab.')},
  {"category" : "Muscovy", "datapoints" : mallard.bayes.tokenize('Wild Muscovy ducks are all black with white patches on the upper and under wing.')},
  {"category" : "Muscovy", "datapoints" : mallard.bayes.tokenize('They may be black, blue, chocolate, lavender or white.')},
  {"category" : "Muscovy", "datapoints" : mallard.bayes.tokenize('The original, wild type, coloration is black and white, but domestication has produced many more colors, including white, black, chocolate, and blue')},
];

var trainedDataset = mallard.bayes.train(ducks);
```

After training the algorithm, we just need to call the *classify* function with our unknown sentence to get a prediction for
what it is.

```javascript
mallard.bayes.classify('A small duck with a green head', trainedDataset);

==> { category: 'Mallard', probability: -16.872226918131254 }
```

So using Naive Bayes, our mystery duck is predicted to be a mallard, which is correct.
