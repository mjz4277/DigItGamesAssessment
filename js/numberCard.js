//Encapsulate the app in an object (basically namespace)
var MathWhiz = MathWhiz || {}

MathWhiz.NumberCard = (function(){
	
	function NumberCard(x, y, num, container, background, forground){
		this.cardBack = new createjs.Shape();
		this.cardBack.graphics.beginFill(background).drawRoundRect(x, y, 80, 100, 5);
		
		this.cardNumber = new createjs.Text();
		this.cardNumber.name = 'NumberCard';
		this.cardNumber.font = '80px sans-serif';
		this.cardNumber.color = forground;
		this.cardNumber.text = num;
		this.cardNumber.x = x + 18;
		this.cardNumber.y = y;
		
		this.container = container;
		this.container.addChild(this.cardBack);
		this.container.addChild(this.cardNumber);
		
		this.number = num;
	};
	
	var p = NumberCard.prototype;
	
	p.changeNumber = function(newNumber){
		this.cardNumber.text = newNumber;
		this.number = newNumber;
	}
	
	p.removeCard = function(){
		this.container.removeChild(this.cardNumber);
		this.container.removeChild(this.cardBack);
	}
	
	return NumberCard;
}());