
module.exports = function () {

  var logx = function(num, base) {
    return Math.log(num) / Math.log(base);
  };

  return {
    logx : logx
  };
}();
