//Encapsulate the app in an object (basically namespace)
var MathWhiz = MathWhiz || {}

MathWhiz.MathUtils = {
	
	getRandomNumber: function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	
	//Since it's most probable that a completely random number will be the maximum
	//number of digits long, get a smaller range of numbers to make it more varied
	//ex. 2 => 10 - 99
	//	  3 => 100 - 999
	getRandomNumberInRange: function(size){
		var min = Math.pow(10, (size - 1));
		var max = Math.pow(10, size) - 1
		
		return this.getRandomNumber(min, max);
	},
	
	getNumberSize: function(num){
		return num.length;
	},
	
	numberToArray: function(num){
		//Force conversion from number to string
		return (""+num).split('');
	}
	
}