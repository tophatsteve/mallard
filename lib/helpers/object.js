
module.exports = function(){

	var isDictionary = function (obj) {
	  if(!obj) {
			return false;
		}

		if(Array.isArray(obj)) {
			return false;
		}

	  if(obj.constructor != Object) {
			return false;
		}

		return true;
	};

	return {
		isDictionary: isDictionary
	};

}();
