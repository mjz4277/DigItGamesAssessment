//Encapsulate the app in an object (basically namespace)
var MathWhiz = MathWhiz || {}

MathWhiz.Game = (function(){
	
	//Constructor
	function Game(){
		
		//self so 'this' can be referenced within other enclosed scopes
		var self = this;
		
		this.TOTAL_PROBLEMS = 5;
		
		this.canvasWidth = $('#game-canvas').width();
		this.canvasHeight = $('#game-canvas').height();
		
		this.stage = new createjs.Stage('game-canvas');
		this.stageContainer = new createjs.Container();
		this.titleContainer = new createjs.Container();
		this.gameContainer = new createjs.Container();
		this.resultsContainer = new createjs.Container();
		this.stageContainer.addChild(this.titleContainer);
		this.stageContainer.addChild(this.gameContainer);
		this.stageContainer.addChild(this.resultsContainer);
		this.stage.addChild(this.stageContainer);
		
		createjs.Touch.enable(this.stage);
		this.stage.enableMouseOver(20);
		this.stage.mouseMoveOutside = true;

		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", function(ev){
			self.tick(ev);
		});
		
		this.init();
		
		var copyright = new createjs.Text();
		copyright.name = 'Copyright';
		copyright.font = '20px sans-serif';
		copyright.color = '#cccccc';
		copyright.text = 'Matt Zeosky (c) 2016';
		copyright.textAlign = 'center';
		copyright.x = this.canvasWidth / 2;
		copyright.y = this.canvasHeight - 25;
		this.stage.addChild(copyright);
	};
	
	var p = Game.prototype;
	
	//Set up all the starting game variables
	p.init = function(){
		
		this.problemNumber = 0;
		this.num1 = 0;
		this.num2 = 0;
		this.sum = 0;
		
		this.isHorizontal =  false;
		
		this.cardArray = [];
		this.sumArray = [];
		this.dragNumberArray = [];
		
		this.plus = null;
		this.underline = null;
		
		//Success + fail text
		this.completedText = new createjs.Text();
		this.completedText.name = 'Solution';
		this.completedText.font = '80px sans-serif';
		this.completedText.color = '#00ff00';
		this.completedText.text = 'Correct!';
		this.completedText.textAlign = 'center';
		this.completedText.alpha = 0;
		this.completedText.x = this.canvasWidth / 2;
		this.completedText.y = (this.canvasHeight / 100 * 50 + 50);
		this.gameContainer.addChild(this.completedText);
		
		this.cardArray = [];
		this.sumArray = [];
		this.historyArray = [];
		this.dragNumberArray = [];
		
		this.changeScreen('title');
	}
	
	//Resets the game
	p.reset = function(){
		this.problemNumber = 0;
		this.num1 = 0;
		this.num2 = 0;
		this.sum = 0;
		
		this.isHorizontal =  false;
		
		this.clearMathProblem();
		
		this.cardArray = [];
		this.sumArray = [];
		this.dragNumberArray = [];
		
		this.createMathProblem();
	}
	
	//Handles screen changes
	p.changeScreen = function(screen){
		
		this.titleContainer.alpha = 0;
		this.gameContainer.alpha = 0;
		this.resultsContainer.alpha = 0;
		
		var currentContainer;
		switch(screen){
			case 'title':
				currentContainer = this.titleContainer;
				this.clearResults();
				this.displayTitlePage();
				break;
			case 'game':
				currentContainer = this.gameContainer;
				this.clearResults();
				this.clearTitle();
				this.reset();
				break;
			case 'results':
				currentContainer = this.resultsContainer;
				this.displayResults();
				break;
		}
		
		//Fade in the new screen
		$(currentContainer).animate({
				alpha : 1
				}, 800, 'swing');
	};
	
	//Clear the objects used for the current math problem
	p.clearMathProblem = function(){
		for(var i = 0; i < this.cardArray.length; i++){
			this.cardArray[i].removeCard();
		}
		
		this.cardArray = [];
		
		for(var i = 0; i < this.dragNumberArray.length; i++){
			this.dragNumberArray[i].removeNumber();
		}
		
		this.dragNumberArray = [];
		
		if(this.plus != null) this.gameContainer.removeChild(this.plus);
		if(this.underline != null) this.gameContainer.removeChild(this.underline);
	};
	
	//Create the new math problem to solve
	p.createMathProblem = function(){
		
		this.gameContainer.alpha = 0;
		//Fade in the new screen
		$(this.gameContainer).animate({
				alpha : 1
				}, 800, 'swing');
		
		this.gameContainer.removeChild(this.questionCounter);
		this.questionCounter = new createjs.Text();
		this.questionCounter.name = 'QuestionCounter';
		this.questionCounter.font = '20px sans-serif';
		this.questionCounter.color = '#202020';
		this.questionCounter.text = 'Question ' + (this.problemNumber + 1) + ' of ' + this.TOTAL_PROBLEMS;
		this.questionCounter.x = 10;
		this.questionCounter.y = this.canvasHeight - 50;
		
		this.gameContainer.addChild(this.questionCounter);
		
		this.clearMathProblem();
		
		this.generateMathProblem();
		
		//Alternate between horizontal and vertical puzzles
		if(this.isHorizontal){
			this.createHorizontalProblem();
		}
		else{
			this.createVerticalProblem();
		}
		
		//The place to drop numbers
		this.sumArray = [];
		numArray = MathWhiz.MathUtils.numberToArray(this.sum);
		for (i = 0; i < 6; i++) {
			
			//Right align the numbers when displaying the cards
			if(i < 6 - numArray.length) continue;
			var index = i - (6 - numArray.length);
			
			var x = this.canvasWidth / 9 * i + (this.canvasWidth / 6) - 20;
			var y = (this.canvasHeight / 100 * 50) - 50;
			
			var numberCard = new MathWhiz.NumberCard(x, y, '', this.gameContainer, '#ceeaff', '#567fda');
			
			this.sumArray[index] = numberCard;
			this.cardArray.push(numberCard);
		}
		
		//self so 'this' can be referenced within other enclosed scopes
		var self = this;
		
		//The draggable numbers
		for (i = 0; i < 10; i++) {
			var x = this.canvasWidth / 11 * i + (this.canvasWidth / 11);
			var y = (this.canvasHeight / 100 * 70);
			var dragNumber = new MathWhiz.DraggableNumber(x, y, i, this.gameContainer);
			dragNumber.dragNumber.on('pressup', function(ev){
				self.handleDrop(ev);
			});
			this.dragNumberArray[i] = dragNumber;
		}
	}
	
	//Create a horizonal equation (x + y)
	p.createHorizontalProblem = function(){
		var numberCount = 0;
		var numArray1 = MathWhiz.MathUtils.numberToArray(this.num1);
		numArray2 = MathWhiz.MathUtils.numberToArray(this.num2);
		numberCount = numArray1.length + numArray2.length;
		
		//Get how many squares are needed and center by that
		var linePos = 0;
		for (i = 0; i < 6; i++) {
			
			//Right align the numbers when displaying the cards
			if(i < 6 - numArray1.length) 
			{
				linePos++;
				continue;
			}
			var index = i - (6 - numArray1.length);
			
			var x = this.canvasWidth / 11 * linePos + (this.canvasWidth / numberCount) - 200;
			var y = (this.canvasHeight / 100 * 50) - 350;
			
			var numberCard = new MathWhiz.NumberCard(x, y, numArray1[index], this.gameContainer, '#eeeeee', '#202020');
			this.cardArray.push(numberCard);
			linePos++;
		}
		
		//Plus sign
		this.plus = new createjs.Text();
		this.plus.name = 'NumberCard';
		this.plus.font = '80px arial';
		this.plus.color = '#202020';
		this.plus.text = '+'
		this.plus.x = this.canvasWidth / 11 * linePos + (this.canvasWidth / numberCount) - 200;
		this.plus.y = (this.canvasHeight / 100 * 50) - 350;
		this.gameContainer.addChild(this.plus);
		
		linePos++;

		for (i = 0; i < numArray2.length; i++) {
			//Left align the numbers when displaying the cards
			var index = i - (6 - numArray2.length);
			
			var x = this.canvasWidth / 11 * linePos + (this.canvasWidth / numberCount) - 230;
			var y = (this.canvasHeight / 100 * 50) - 350;
			
			var numberCard = new MathWhiz.NumberCard(x, y, numArray2[i], this.gameContainer, '#eeeeee', '#202020');
			this.cardArray.push(numberCard);
			linePos++;
		}
	}
	
	p.createVerticalProblem = function(){
		var numArray = MathWhiz.MathUtils.numberToArray(this.num1);
		for (i = 0; i < 6; i++) {
			
			//Right align the numbers when displaying the cards
			if(i < 6 - numArray.length) continue;
			var index = i - (6 - numArray.length);
			
			var x = this.canvasWidth / 9 * i + (this.canvasWidth / 6) - 20;
			var y = (this.canvasHeight / 100 * 50) - 350;
			
			var numberCard = new MathWhiz.NumberCard(x, y, numArray[index], this.gameContainer, '#eeeeee', '#202020');
			this.cardArray.push(numberCard);
		}
		
		numArray = MathWhiz.MathUtils.numberToArray(this.num2);
		for (i = 0; i < 6; i++) {
			
			//Right align the numbers when displaying the cards
			if(i < 6 - numArray.length) continue;
			var index = i - (6 - numArray.length);
			
			var x = this.canvasWidth / 9 * i + (this.canvasWidth / 6) - 20;
			var y = (this.canvasHeight / 100 * 50) - 200;
			
			var numberCard = new MathWhiz.NumberCard(x, y, numArray[index], this.gameContainer, '#eeeeee', '#202020');
			this.cardArray.push(numberCard);
		}
		
		//Plus sign
		this.plus = new createjs.Text();
		this.plus.name = 'NumberCard';
		this.plus.font = '80px arial';
		this.plus.color = '#202020';
		this.plus.text = '+'
		this.plus.x = this.canvasWidth / 9 + (this.canvasWidth / 6) - 90;
		this.plus.y = (this.canvasHeight / 100 * 50) - 200;
		this.gameContainer.addChild(this.plus);
		
		//Underline
		this.underline = new createjs.Shape();
		this.underline.graphics.beginFill('#202020').drawRect(this.canvasWidth / 9 + (this.canvasWidth / 6) - 90,
			(this.canvasHeight / 100 * 50) - 80,
			this.canvasWidth / 9 + (this.canvasWidth / 6) * 3,
			5);
		this.gameContainer.addChild(this.underline);
	}
	
	//Update loop
	p.tick = function(ev){
		this.stage.update(ev);
	};
	
	//Generates a new math problem to solve
	p.generateMathProblem = function(){
		var numSize1 = MathWhiz.MathUtils.getRandomNumber(2, 5);
		var numSize2 = MathWhiz.MathUtils.getRandomNumber(2, 5);
		this.num1 = MathWhiz.MathUtils.getRandomNumberInRange(numSize1);
		this.num2 = MathWhiz.MathUtils.getRandomNumberInRange(numSize2);
		this.sum = this.num1 + this.num2;
	};
	
	//Check to see if number is released in a square
	p.handleDrop = function(ev){
		var objs = this.gameContainer.getObjectsUnderPoint(this.stage.mouseX, this.stage.mouseY);
		var hit = false;
		
		//Check all objects under point to see if on a square
		for(var i = 0; i < objs.length; i++){
			for(var j = 0; j < this.sumArray.length; j++){
				if(this.sumArray[j].cardBack  == objs[i]){
					this.sumArray[j].changeNumber(ev.target.text);
					hit = true;
					break;
				}
			}
			if(hit) break;
		}
		
		if(hit){
			
			//Fade the number back into its starting position
			ev.target.alpha = 0;
			$(ev.target).animate({
				alpha : 1
				}, 400, 'swing');
			ev.target.x = ev.target.originX;
			ev.target.y = ev.target.originY;
			
			//Check if the number is complete
			if(this.isSumComplete()){
				this.problemNumber++;
				this.isHorizontal = !this.isHorizontal;
				
				var isCorrect = this.checkSum();
				
				//Save the result of this equation
				var problemHistory = new MathWhiz.ProblemHistory(
					this.num1,
					this.num2,
					this.sum,
					this.getAnswer(),
					isCorrect,
					this.resultsContainer);
				
				
				this.historyArray.push(problemHistory);
				this.displayCompleteSolution(isCorrect);
			}
		}
		else{
			//Move the number back to its starting position
			$(ev.target).animate({
					x : ev.target.originX,
					y : ev.target.originY
				}, 400, 'swing');
		}
	}
	
	//Checks to see if all boxes are filled in
	p.isSumComplete = function(){
		for(var i = 0; i < this.sumArray.length; i++){
			if(this.sumArray[i].number === '')
				return false;
		}
		
		return true;
	}
	
	//Get the answer from the concatenation of the sum squares
	p.getAnswer = function(){
		var enteredSum = '';
		for(var i = 0; i < this.sumArray.length; i++){
			//Force the number to concatenate like a string
			enteredSum += (''+this.sumArray[i].number);
		}
		
		return enteredSum;
	}
	
	//Compares the given answer to the actual sum
	p.checkSum = function(){
		return this.getAnswer() == this.sum;
	}
	
	//Displayes whether the answer given by the player was right or wrong
	p.displayCompleteSolution = function(isCorrect){
		
		//Change the color and text based on if right or wrong
		if(isCorrect){
			this.completedText.text = 'Correct!';
			this.completedText.color = '#00ff00';
		}
		else{
			this.completedText.text = 'Incorrect';
			this.completedText.color = '#ff0000';
		}
		
		//self so 'this' can be referenced within other enclosed scopes
		var self = this;
		
		
		//Fade correct / incorrect in and out, then change to the next puzzle
		$(this.completedText).animate({
				alpha : 1
		}, 400, 'swing')
		.delay(600)
		.animate({
				alpha : 0
		}, 400, 'swing', function(){
			if(self.problemNumber <= self.TOTAL_PROBLEMS){
				self.createMathProblem();
			}
			else{
				self.changeScreen('results');
			}
		});
	};
	
	//Set up everything on the title page
	p.displayTitlePage = function(){
		
		titleBack = new createjs.Shape();
		titleBack.graphics.beginFill('#eeeeee').drawRect(0, 0, this.canvasWidth, 150);
		this.titleContainer.addChild(titleBack);
		
		var title = new createjs.Text();
		title.name = 'Title';
		title.font = '100px sans-serif';
		title.color = '#567fda';
		title.text = 'Math Whiz';
		title.textAlign = 'center';
		title.x = this.canvasWidth / 2;
		title.y = 20;
		
		this.titleContainer.addChild(title);
		
		//self so 'this' can be referenced within other enclosed scopes
		var self = this;
		
		//Buttons
		var startButton = new createjs.Text();
		startButton.name = 'MainMenuButton';
		startButton.font = '40px sans-serif';
		startButton.color = '#202020';
		startButton.text = 'Start';
		startButton.textAlign = 'center';
		startButton.x = this.canvasWidth / 2;
		startButton.y = 350;
		startButton.cursor = 'pointer';
		
		//Make a hitbox for mouse events
		var hitboxStart = new createjs.Shape();
		hitboxStart.graphics.beginFill("#000").drawRect(
				-startButton.getMeasuredWidth() / 2,
				0,
				startButton.getMeasuredWidth(),
				startButton.getMeasuredHeight());
		startButton.hitArea = hitboxStart;
		
		startButton.on('click', function(){
			self.changeScreen('game');
		});
		
		this.titleContainer.addChild(startButton);
	};
	
	//Clear the data from the title page
	p.clearTitle = function(){
		this.titleContainer.removeAllChildren();
	}
	
	//Displays the final results for the problems
	p.displayResults = function(){
		var resultsTitle = new createjs.Text();
		resultsTitle.name = 'ResultsTitle';
		resultsTitle.font = '40px sans-serif';
		resultsTitle.color = '#202020';
		resultsTitle.text = 'Results:';
		resultsTitle.x = 10;
		resultsTitle.y = 0;
		
		this.resultsContainer.addChild(resultsTitle);
		
		var x = 10;
		var y = 50;
		var dy = 50;
		for(var i = 0; i < this.historyArray.length; i++){
			this.historyArray[i].displayHistory(x, y);
			y += dy;
		}
		
		//self so 'this' can be referenced within other enclosed scopes
		var self = this;
		
		//Buttons
		var restartButton = new createjs.Text();
		restartButton.name = 'MainMenuButton';
		restartButton.font = '40px sans-serif';
		restartButton.color = '#202020';
		restartButton.text = 'Restart';
		restartButton.textAlign = 'center';
		restartButton.x = this.canvasWidth / 2;
		restartButton.y = 400;
		restartButton.cursor = 'pointer';
		
		//Make a hitbox for mouse events
		var hitboxRestart = new createjs.Shape();
		hitboxRestart.graphics.beginFill("#000").drawRect(
				-restartButton.getMeasuredWidth() / 2,
				0,
				restartButton.getMeasuredWidth(),
				restartButton.getMeasuredHeight());
		restartButton.hitArea = hitboxRestart;
		
		restartButton.on('click', function(){
			self.changeScreen('game');
		});
		
		this.resultsContainer.addChild(restartButton);
		
		var mainMenuButton = new createjs.Text();
		mainMenuButton.name = 'MainMenuButton';
		mainMenuButton.font = '40px sans-serif';
		mainMenuButton.color = '#202020';
		mainMenuButton.text = 'Main Menu';
		mainMenuButton.textAlign = 'center';
		mainMenuButton.x = this.canvasWidth / 2;
		mainMenuButton.y = 450;
		mainMenuButton.cursor = 'pointer';
		
		//Make a hitbox for mouse events
		var hitboxTitle = new createjs.Shape();
		hitboxTitle.graphics.beginFill("#000").drawRect(
				-mainMenuButton.getMeasuredWidth() / 2,
				0,
				mainMenuButton.getMeasuredWidth(),
				mainMenuButton.getMeasuredHeight());
		mainMenuButton.hitArea = hitboxTitle;
		
		mainMenuButton.on('click', function(){
			self.changeScreen('title');
		});
		
		this.resultsContainer.addChild(mainMenuButton);
		
	};
	
	//Clear the data from the results page
	p.clearResults = function(){
		this.resultsContainer.removeAllChildren();
		this.historyArray = [];
	}
	
	return Game;
}());