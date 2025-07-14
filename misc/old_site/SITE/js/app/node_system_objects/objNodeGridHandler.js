/*
	What is the purpose of this file?

	This file defines an object which is responsbile for things like the ability to drag the node grid (panning the node grid)

*/

//the main node grid handler.
//NOTE: this object doesn't use prototyping because only one exists at a time.
//no need for the extra headache.
//The main purpose, therefore, is for name spacing
var nodeGridHandler = new function(){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//the current panned position of the grid:
		this.mvarX = 0;
		this.mvarY = 0;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//it's important that we don't try to build this until the document has loaded
		//wait for the document to be ready
		$(document).ready(function(){

			//set up an event handler so we always know the global mouseX and mouseY
			$('#divNodeEditor').mousedown(function(event){ me.panStart(event); } );
			//$('#divNodeEditor').mouseup(function(event){ return false; } );
		});//document is ready



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS

		//start dragging the nodes around
		this.panStart = function(event){

			//commented this out because it interferes with the color picker
			//make sure the UI doesn't mess up thanks to HTML
			//event.preventDefault();

			//only start dragging if it was the right mouse button
			if(event.which==2 || (event.which==3 && !window.ctxmenu)){

				//but it's okay if it's only for middle click or right-click
				//make sure the UI doesn't mess up thanks to HTML
				event.preventDefault();

				//save the current x / y position of the grid
				this.startX = this.mvarX;
				this.startY = this.mvarY;

				//start a drag!
				var me = this;
				dragHandler.dragStart( function(x, y){ me.doPan(x, y); }, function(){ $('#divNodeEditor').css('cursor', 'default'); } )

				//make sure the curror is correct
				$('#divNodeEditor').css('cursor', "url('img/cursors/grabbing.gif'), auto");

			}//end if right mouse

		}//panStart(event)

		//actually handle the drag / PAN of the node grid
		this.doPan = function(deltaX, deltaY){

			//calculate the new position for the grid:
			var newX = me.startX - deltaX;
			var newY = me.startY - deltaY;

			//update the grid to it's new position
			me.mvarX = newX;
			me.mvarY = newY;
			$('#divNodeContainer').css('left', me.mvarX+'px').css('top', me.mvarY+'px');

			//update the grid CSS
			//$('#divNodeEditor').css('background', "#191B25 url('img/node_grid_bg_loop.gif') repeat " + ((me.mvarX%10)) + " " + ((me.mvarY%10)));
			$('#divNodeEditor').css('background-position', ((me.mvarX%10)) + " " + ((me.mvarY%10)));
			//$('#divNodeEditor').css('background', "#FFF");

			//make sure to update the screen
			nodeWireHandler.renderWires();
		}//doPan()


}//object nodeGridHandler()