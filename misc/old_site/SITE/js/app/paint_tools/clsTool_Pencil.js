/*
	
	This class makes a template tool

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsTool_Pencil = function( canvas ){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution
		var me = this;

		//the canvas (CLASS OBJECT) that we will draw to with this tool
		this.canvas = canvas;

		//let's save the drawing context on it's own since we'll use that alot
		this.CTX = this.canvas.mvarCTX;

		//current size of the brush
		this.brushSize = 10;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		


	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
}



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS

clsTool_Pencil.prototype.mouseDown = function(event){

	//make sure the UI doesn't mess up thanks to HTML selection
	event.preventDefault();

	//make sure left button is down
	if(event.which==1){

		//paint this area!
		this.doPaint(event);

	}//left button

}//mouseDown

clsTool_Pencil.prototype.mouseMove = function(event){

	//make sure left button is down
	if(event.which==1){

		//paint this area!
		this.doPaint(event);

	}//left button

}//mouseDown

clsTool_Pencil.prototype.mouseUp = function(event){

}//mouseDown


//PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING
//PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING

clsTool_Pencil.prototype.doPaint = function(event){

	//get position from event
	var parentOffset = $(this.canvas.mvarCanvasDOM).parent().offset();
    var x = (event.pageX - parentOffset.left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
    var y = (event.pageY - parentOffset.top);

	//for eaiser drawing code we'll create a local reference
	var ctx = this.canvas.mvarCTX;

	//begin drawing
	ctx.beginPath();

		//until later, just use black for nwo
		ctx.fillStyle = "black";
		ctx.arc(x, y, this.brushSize, 0, 2*Math.PI)
		ctx.fill();

	//all done drawing
	ctx.closePath();

}//doPaint(x, y)

//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS

	//set the size of the brush
	clsTool_Pencil.prototype.setSize = function(size){
		this.brushSize = size;
	}//setSize(size)



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS


//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsTool_Pencil.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsTool_Pencil.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsTool_Pencil.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)





function XYFromE(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY){
		posx = e.pageX;
		posy = e.pageY;

	}else if (e.clientX || e.clientY){

		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information

	return 	{
				x:posx,
				y:posy
			};
}