//Encapsulate the app in an object (basically namespace)
var MathWhiz = MathWhiz || {}

//The results of an eqution
MathWhiz.ProblemHistory = (function(){

	function ProblemHistory(num1, num2, sum, answer, correct, container){
		this.num1 = num1;
		this.num2 = num2;
		this.sum = sum;
		this.answer = answer;
		this.correct = correct;
		
		this.container = container;
	};
	
	var p = ProblemHistory.prototype;
	
	//Writes out the stored equation
	p.displayHistory = function(x, y){
		this.problem = new createjs.Text();
		this.problem.name = 'Problem';
		this.problem.font = '40px sans-serif';
		this.problem.color = this.correct ? '#00dd00' : '#dd0000';
		
		var problemText = this.num1 + ' + ' + this.num2 + ' = ' + this.answer
		if(!this.correct) problemText += ' (Correct: ' + this.sum + ')';
		
		this.problem.text = problemText;
		this.problem.x = x;
		this.problem.y = y;
		
		this.container.addChild(this.problem);
	};
	
	//Removes the object from the scene
	p.clearHistory = function(){
		this.container.removeChild(this.problem);
	}

	return ProblemHistory;
}());