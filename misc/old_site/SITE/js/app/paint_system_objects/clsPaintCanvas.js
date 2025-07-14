/*
	What is the purpose of this file?

	This file defines an object which is responsbile for an canvas inside a paint application.

	It's more than just a canvas dom element, as it also defines the behavor of panning the canvas as well as resizing the canvas with mouse input

	In the future, this should also be responsible for "zooming" the canvas
*/

//a paint canvas
//NOTE: this object doesn't use prototyping because only one exists at a time.
//no need for the extra headache.
//The main purpose, therefore, is for name spacing
var clsPaintCanvas = function(DOMContainer){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//reference to our canvas dom as a jQuery object
		this.mvarCanvasDOM = null;

		//reference to our canvas as an HTML dom element
		this.mvarCanvas = null;

		//our drawing context for this canvas...
		this.mvarCTX = null;

		//the current panned position of the canvas:
		this.mvarCanvasX = 30;
		this.mvarCanvasY = 30;

		//the default height and width of a new canvas (in pixels)
		this.mvarCanvasW = 600;
		this.mvarCanvasH = 400;

		//save dom element that will be the container for our canvas
		this.mvarContainerDOM = DOMContainer;

		//reference to our own DOM elemetns
		this.mvarDOM = null;

		//to make painting single pixels easier and quicker we have to user an image-data container hack
		//http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
		//this variables will hold the data for this object
		this.pixelImageData 		= null;
		this.pixelImageData_data  	= null;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add the HTML for our canvas, complete with wrappers
		DOMContainer.append	(	
								'<!-- container so we can position the canvas -->' +
								'<div class="canvasContainer">' +
									'<!-- inner canvase wrapper for resize handles -->' +
									'<div class="canvasResizeWrapper">' +
										'<!-- the main canvas to paint upon -->' +
										'<canvas class="canvasPaintSurface" width="600" height="600"></canvas>' +
									'</div>' +
								'</div>'
							);

		//save reference to our DOM (the top most element we created)
		this.mvarDOM = DOMContainer.find('.canvasContainer');

		//save reference to our canvas
		this.mvarCanvasDOM = $(this.mvarDOM.find('canvas')[0]);

		//set up our canvas
		this.mvarCanvasDOM.attr({width:this.mvarCanvasW, height:this.mvarCanvasH});

		//add resize-handles to the canvas, complete with mouse events for resizing
		var resizeDOM = $(this.mvarDOM.find('.canvasResizeWrapper')[0]);
		resizeDOM.append('<div class="resizeHandle resizeHandleNW"></div>'	);
		resizeDOM.append('<div class="resizeHandle resizeHandleN"></div>'	);
		resizeDOM.append('<div class="resizeHandle resizeHandleNE"></div>'	);
		resizeDOM.append('<div class="resizeHandle resizeHandleE"></div>'	);
		resizeDOM.append('<div class="resizeHandle resizeHandleSE"></div>'	);
		resizeDOM.append('<div class="resizeHandle resizeHandleS"></div>'	);
		resizeDOM.append('<div class="resizeHandle resizeHandleSW"></div>'	);
		resizeDOM.append('<div class="resizeHandle resizeHandleW"></div>'	);
		
		resizeDOM.find('.resizeHandleNW'	).mousedown(	function(event){me.resizeStart(event, 'NW'	); 	});
		resizeDOM.find('.resizeHandleN'		).mousedown(	function(event){me.resizeStart(event, 'N'	); 	});
		resizeDOM.find('.resizeHandleNE'	).mousedown(	function(event){me.resizeStart(event, 'NE'	); 	});
		resizeDOM.find('.resizeHandleE'		).mousedown(	function(event){me.resizeStart(event, 'E'	); 	});
		resizeDOM.find('.resizeHandleSE'	).mousedown(	function(event){me.resizeStart(event, 'SE'	); 	});
		resizeDOM.find('.resizeHandleS'		).mousedown(	function(event){me.resizeStart(event, 'S'	); 	});
		resizeDOM.find('.resizeHandleSW'	).mousedown(	function(event){me.resizeStart(event, 'SW'	); 	});
		resizeDOM.find('.resizeHandleW'		).mousedown(	function(event){me.resizeStart(event, 'W'	); 	});

		//we need to bind some events so the canvas can be panned with the right mouse or middle mouse button
		this.mvarContainerDOM.mousedown(function(event){ me.panStart(event); } );
		
		//set up the canvas to be drawn on with html5 canvases etc
		this.mvarCanvas = this.mvarCanvasDOM[0];

		//get the drawing context of our canvas to output to...
		this.mvarCTX = me.mvarCanvas.getContext("2d");

		//to make painting single pixels easier and quicker we have to user an image-data container hack
		//http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
		//this variables will hold the data for this object
		this.pixelImageData 		= this.mvarCTX.createImageData(1,1); // only do this once per page
		this.pixelImageData_data  	= this.pixelImageData.data;       // only do this once per page

		//clear the background of the canvas
		var ctx = this.mvarCTX;
		//begin drawing
		ctx.beginPath();

			//erase (clear) background with all black
			ctx.fillStyle = "white";
			ctx.rect(0,0,this.mvarCanvas.width,this.mvarCanvas.height);
			ctx.fill();
		//all done drawing
		ctx.closePath();

		//add events for selecting a tool
		//divPSTool



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS


}//object clsPaintCanvas()




//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS

//DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING
//DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING


	//set the color of our pixel-painter image data object
	clsPaintCanvas.prototype.setPixelRGBA = function(r, g, b, a){
		this.pixelImageData_data[0]   = r;
		this.pixelImageData_data[1]   = g;
		this.pixelImageData_data[2]   = b;
		this.pixelImageData_data[3]   = a;
	}//setPixelRGBA(r, g, b, a)

	//paint a single pixel with our pixel-painter image data object
	clsPaintCanvas.prototype.setPixel = function(x, y){
		this.mvarCTX.putImageData( this.pixelImageData, x, y );  
	}//setPixel(x, y)



//RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING
//RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING

//handle all reszies
clsPaintCanvas.prototype.resizeStart = function(event, direction){

	//only resize with the left mouse button
	if(event.which==1){

		//make sure the UI doesn't mess up thanks to HTML selection
		event.preventDefault();

		//save the current x / y / w / g position of the canvas
		this.startX = this.mvarCanvasX;
		this.startY = this.mvarCanvasY;
		this.startW = this.mvarCanvasW;
		this.startH	= this.mvarCanvasH;

		//start a drag! (depending on direction)
		var me = this;
		switch(direction){

			case 'NW':
				dragHandler.dragStart( function(x, y){ me.resizeWest(x); me.resizeNorth(y); } );
				break;

			case 'N':
				dragHandler.dragStart( function(x, y){ me.resizeNorth(y); } );
				break;

			case 'NE':
				dragHandler.dragStart( function(x, y){ me.resizeEast(x); me.resizeNorth(y); } );
				break;

			case 'E':
				dragHandler.dragStart( function(x, y){ me.resizeEast(x); } );
				break;

			case 'SE':
				dragHandler.dragStart( function(x, y){ me.resizeEast(x); me.resizeSouth(y); } );
				break;

			case 'S':
				dragHandler.dragStart( function(x, y){ me.resizeSouth(y); } );
				break;

			case 'SW':
				dragHandler.dragStart( function(x, y){ me.resizeWest(x); me.resizeSouth(y); } );
				break;

			case 'W':
				dragHandler.dragStart( function(x, y){ me.resizeWest(x); } );
				break;

		}//swatch

	}//endif left mouse button

}//resizeStart(event, direction)

//handle resizing from the west (which also involes changing the x position of the canvas)
clsPaintCanvas.prototype.resizeWest = function(deltaX){

	//calculate new x position of the canvase
	var newX = this.startX - deltaX;

	//update the canvas to it's new position
	this.mvarCanvasX = newX;
	this.mvarDOM.css('left', this.mvarCanvasX+'px');

	//we can re-use the east code for handing the width
	this.resizeEast(-deltaX);

}//resizeWest(deltaX)

//handle resizing from the north (which also involves changing the y position of the canvas)
clsPaintCanvas.prototype.resizeNorth = function(deltaY){

	//calculate new y position of the canvase
	var newY = this.startY - deltaY;

	//update the canvas to it's new position
	this.mvarCanvasY = newY;
	this.mvarDOM.css('top', this.mvarCanvasY+'px');

	//we can re-use the south code for handing the width
	this.resizeSouth(-deltaY);

}//resizeNorth(deltaY)

//handle resizing from the east
clsPaintCanvas.prototype.resizeEast = function(deltaX){

	//calculate the new height for the canvas
	var newW = this.startW - deltaX

	//the width can't be less than 1
	if(newW<1) newW=1;

	//udpate the canvase
	this.mvarCanvasW = newW;
	this.mvarCanvasDOM.attr({width:this.mvarCanvasW});

}//resizeEast(deltaX)

//handle resizing from the south
clsPaintCanvas.prototype.resizeSouth = function(deltaY){

	//calculate the new height for the canvas
	var newH = this.startH - deltaY

	//the height can't be less than 1
	if(newH<1) newH=1;

	//udpate the canvase
	this.mvarCanvasH = newH;
	this.mvarCanvasDOM.attr({height:this.mvarCanvasH});

}//resizeSouth(deltaY)



//PANNING +++ PANNING +++ PANNING +++ PANNING +++ PANNING +++ PANNING +++ PANNING
//PANNING +++ PANNING +++ PANNING +++ PANNING +++ PANNING +++ PANNING +++ PANNING

//start dragging the canvas around
clsPaintCanvas.prototype.panStart = function(event){

	//only start dragging if it was the right mouse button
	if(event.which==2 || (event.which==3 && !window.ctxmenu)){

		//make sure the UI doesn't mess up thanks to HTML selection
		event.preventDefault();

		//save the current x / y position of the canvas
		this.startX = this.mvarCanvasX;
		this.startY = this.mvarCanvasY;

		//start a drag!
		var me = this;

		dragHandler.dragStart( function(x, y){ me.doPan(x, y); }, function(){ me.mvarContainerDOM.css('cursor', 'default'); } )

		//make sure the curror is correct
		this.mvarContainerDOM.css('cursor', "url('img/cursors/grabbing.gif'), auto");

	}//end if right mouse

}//panStart(event)

//actually handle the drag / PAN of the node grid
clsPaintCanvas.prototype.doPan = function(deltaX, deltaY){

	//calculate the new position for the canvas:
	var newX = this.startX - deltaX;
	var newY = this.startY - deltaY;

	//update the canvas to it's new position
	this.mvarCanvasX = newX;
	this.mvarCanvasY = newY;
	this.mvarDOM.css('left', this.mvarCanvasX+'px').css('top', this.mvarCanvasY+'px');

}//doPan(deltaX, deltaY)