//Encapsulate the app in an object (basically namespace)
var MathWhiz = MathWhiz || {}

//A number used by the player to answer an equation
MathWhiz.DraggableNumber = (function(){
	
	function DraggableNumber(x, y, num, container){
		
		this.dragNumber = new createjs.Text();
		this.dragNumber.name = 'DraggableNumber';
		this.dragNumber.font = '80px sans-serif';
		this.dragNumber.color = '#567fda';
		this.dragNumber.text = num;
		this.dragNumber.x = x;
		this.dragNumber.y = y;
		this.dragNumber.cursor = 'pointer';
		
		this.originX = x;
		this.originY = y;
		
		this.dragNumber.originX = x;
		this.dragNumber.originY = y;
		
		//Make a hitbox for mouse events
		var hitbox = new createjs.Shape();
		hitbox.graphics.beginFill("#000").drawRect(
				0,
				0,
				this.dragNumber.getMeasuredWidth(),
				this.dragNumber.getMeasuredHeight());
		this.dragNumber.hitArea = hitbox;
		
		this.container = container;
		
		this.container.addChild(this.dragNumber);
		
		this.number = num;
		
		this.buildMouseListeners();
	};
	
	var p = DraggableNumber.prototype;
	
	//Adds the drag event to the number
	p.buildMouseListeners = function(){
		var self = this;
		this.dragNumber.on('pressmove', function(ev){
			ev.target.x = ev.stageX - ev.target.getMeasuredWidth() / 2;
			ev.target.y = ev.stageY - ev.target.getMeasuredHeight() / 2;
		});
	};
	
	//Remove the object from the scene
	p.removeNumber = function(){
		this.container.removeChild(this.dragNumber);
	}
	
	return DraggableNumber;
}());