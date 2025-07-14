/*
	What is the purpose of this file?
	
	Perhaps there is a better way to do what I'm trying to do, but this is the best way I've solved it.

	Basically, the node editor has many elements that require dragging, such as:
		- Moving nodes around
		- Resizng nodes
		- Dragging value sliders left and right
		- Draging node connections to connect nodes

	Now, originally I wrote the code so that each node element had a mouseDown, mouseMove, and mouseUp event.
	This way, each element was responsible for it's dragging, resizing, etc.

	But there was a problem. For this example, we'll assume that the user is trying to drag / reposition a node.
	When you attach a mouseMove event to something such as a title-bar of a node, the event is only fired when
	the mouse is actually OVER the titlebar DIV.

	The problem with this, is that when you're draging it's often possible to move the mouse quicker than the
	node can update, then the node will stop getting mouseMove events. This means the node that you're dragging
	to drag a node, but now it's frozen somewhere, and you have to carefully move the mouse back over the node
	and then continue moving it.

	The original solution I found for this was to attach mouseMove events to the main container for nodes.
	This way, the node would continue to move even when the mouse accidentally moves outside the titlebar region.

	This worked, but has an unintended consequence: everytime a new node created, a new event hook is added to the
	mouseMove events of the main container. Thus, the more notes there are, the more code is piggy-backed on mousemove.

	This will eventually slow down the entire program.

	So to fix this, the only way I could imagine to fix it would be to make one global mouseDown / mouseMove / mouseUP
	event, and replace it's handlers with the one in question at any given time.

	This way, each node doesn't add code to the mouse move events, and there's always only one event handler for those events.

	This file sets up all the event handlers.
*/


//This is the main drag-handler function.
//NOTE: this object doesn't use prototyping because only one of it is loaded into memory.
//So in this case we're building a single Object, that is not meant to be used as a class!
var dragHandler = new function(){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
		
		//for scope resolution and such
		var me = this;

		//these will save the global mouse position so we can easily reference it
		this.mvarMouseX = 0;
		this.mvarMouseY = 0;

		//the start X and Y position when a drag is started.
		//these are saved so we can calculate the deltaX and deltaY later for mouse movements
		this.startX = 0;
		this.startY = 0;

		//no callback define in the beginning
		this.callBackMove = null;
		this.callBackEnd = null;
		
		//this boolean saves whether or not a drag is currently in progress
		this.isDragging = false;


	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//it's important that we don't try to build this until the document has loaded
		//wait for the document to be ready
		$(document).ready(function(){

			//set up an event handler so we always know the global mouseX and mouseY
			$('body').mousemove(function(event){dragHandler.mvarMouseX = event.pageX; dragHandler.mvarMouseY = event.pageY; });

			//set up an event handler for mousemove to our custom dragMove function
			$('body').mousemove(function(event){dragHandler.dragMove(event); });

			//set up an event handler for mouseup to our custom dragMove function
			$('body').mouseup(function(event){dragHandler.dragEnd(event); });

		});//document is ready



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
		
		//this function starts a general purpose "drag" sequence.
		//what this means is that, anything that requires dragging can attach itself to the call backfunction of this event
		//so node moving (translation), resizing, node connection, and anything else that requires dragging can reuse this code.
		//this makes it much simpler since this program will require lots of things that involve dragging.
		this.dragStart = function(callBackFunctionMove, callBackFunctionEnd){

			//if we're already dragging, don't start another drag (which wouldnt make sense anyway, a user shouldn't be able to
			//drag multiple things at once)
			if(me.isDragging) return false;

			//save the initial position of the mouse when this is run
			me.startX = me.mvarMouseX;
			me.startY = me.mvarMouseY;

			//save the callback function
			me.callBackMove = (typeof callBackFunctionMove === "undefined") ? null : callBackFunctionMove;
			me.callBackEnd = (typeof callBackFunctionEnd === "undefined") ? null : callBackFunctionEnd;

			//we are now dragging
			me.isDragging = true;

			//return true since we were able to start dragging
			return true;

		}//dragStart(callbackFunction)


		//this function handles the mousemovement when a drag is inprogress
		this.dragMove = function(event){

			//if we're not dragging, nothing to do here!
			if(!me.isDragging) return false;

			//make sure the UI doesn't mess up thanks to HTML
			event.preventDefault();

			//calculate the delta X and Y
			var deltaX = me.startX - me.mvarMouseX;
			var deltaY = me.startY - me.mvarMouseY;

			//call the callback function with the delta data
			if(me.callBackMove!=null)
				me.callBackMove.call(null, deltaX, deltaY);

		}//dragMove()


		//this function handles the end of a drag
		this.dragEnd = function(event){

			//make sure the UI doesn't mess up thanks to HTML
			event.preventDefault();

			//call the callback function with the delta data
			if(me.callBackEnd!=null)
				me.callBackEnd.call(null);

			//disable dragging
			me.isDragging = false;

			//clear the call back functions too, just in case
			me.callBackMove = null;
			me.callBackEnd = null;

		}//dragEnd(event)


}//the main drag handler function.