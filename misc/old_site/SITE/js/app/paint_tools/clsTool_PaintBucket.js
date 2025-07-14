/*
	
	This class makes a template tool

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsTool_PaintBucket = function( canvas ){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution
		var me = this;

		//the canvas (CLASS OBJECT) that we will draw to with this tool
		this.canvas = canvas;

		//let's save the drawing context on it's own since we'll use that alot
		this.CTX = this.canvas.mvarCTX;

		//save the canvas width and height locally
		this.canvasWidth = this.canvas.mvarCanvasW;
		this.canvasHeight = this.canvas.mvarCanvasH;

		//image data for the canvas
		this.colorLayerData = this.CTX.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

		this.hasBeenPainted = [];


		
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		


	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
}



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS

clsTool_PaintBucket.prototype.mouseDown = function(event){

	//make sure the UI doesn't mess up thanks to HTML selection
	event.preventDefault();

	//make sure left button is down
	if(event.which==1){

		//paint this area!
		//this.doPaint(event);

	}//left button

}//mouseDown

clsTool_PaintBucket.prototype.mouseMove = function(event){

	//make sure left button is down
	if(event.which==1){

		//paint this area!
		//this.doPaint(event);

	}//left button

}//mouseDown

clsTool_PaintBucket.prototype.mouseUp = function(event){

	//make sure left button is down
	if(event.which==1){

		//paint this area!
		this.doPaint(event);

	}//left button

}//mouseDown


//PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING
//PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING +++ PAINTING




clsTool_PaintBucket.prototype.doPaint = function(event){

	//build a new node network model so we can calculate colors for pixels!
	var nodeModel = new nodeNetworkModel(nodeManager, nodeWireHandler);

	//make sure we have the latest width and height
	this.canvasWidth = this.canvas.mvarCanvasW;
	this.canvasHeight = this.canvas.mvarCanvasH;

	//begin drawing
	this.CTX.beginPath();

		//erase (clear) background with all black
		this.CTX.fillStyle = "white";
		this.CTX.rect(0, 0, this.canvas.mvarCanvasW,  this.canvas.mvarCanvasH);
		this.CTX.fill();
	//all done drawing
	this.CTX.closePath();

	//get the data of the canvas
	this.colorLayerData = this.CTX.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

	//get position from event
	var parentOffset = $(this.canvas.mvarCanvasDOM).parent().offset();
    var x = (event.pageX - parentOffset.left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
    var y = (event.pageY - parentOffset.top);

    //get the color of the pixel under the cursor
    var pixelPos = (y * (this.canvasWidth) + x) * 4,
		r = this.colorLayerData.data[pixelPos],
		g = this.colorLayerData.data[pixelPos + 1],
		b = this.colorLayerData.data[pixelPos + 2],
		a = this.colorLayerData.data[pixelPos + 3];

	//start the flood fill
	this.floodFill(nodeModel, x, y, r, g, b);

}//doPaint(event)



//Code modified and borrowed from http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
clsTool_PaintBucket.prototype.floodFill = function(nodeModel, startX, startY, startR, startG, startB) {

	//declare local context reference for ease of code writing
	var context = this.CTX;

	//declare canvasWidth and Height
	var canvasWidth = this.canvasWidth;
	var canvasHeight = this.canvasHeight;

	//declare required variables
	var newPos,
		x,
		y,
		pixelPos,
		reachLeft,
		reachRight,
		drawingBoundLeft = 0,
		drawingBoundTop = 0,
		drawingBoundRight = canvasWidth-1,
		drawingBoundBottom = canvasHeight-1,
		pixelStack = [[startX, startY]];

	var curColor = {
		r: 30,
		g: 170,
		b: 190
	}

	//prevent crash
	var mainCount = 0;

	var me=this;

	//reset the array keeping track of what has been painted this round
	this.hasBeenPainted = []; //new Array(canvasWidth*canvasHeight); //Array.apply(null, new Array(canvasWidth*canvasHeight)).map(Number.prototype.valueOf,0);
	for(var i=0; i<canvasWidth*canvasHeight; i++)
		this.hasBeenPainted.push(0);

	//counter for each pixel we've processed thus far
	var ticker = 0;

	//our pixel stack is a list of pixels that are considered valid 'edge points'
	//while (pixelStack.length > 0) {
	setTimeout(function doLine(){

		for(var p=0; (p<200 && pixelStack.length>0); p++){

			//our pixel stack is a list of "valid" end-point pixels, that we should start painting from.
			//lets get the next one on the stack...
			newPos = pixelStack.pop();
			x = newPos[0];
			y = newPos[1];

			// Get current pixel position in the data array (four bytes per pixel)
			pixelPos = (y * canvasWidth + x);

			// Go up as long as the color matches and are inside the canvas
			while (y >= drawingBoundTop && me.myMatchStartColor(pixelPos, startR, startG, startB)) {

				//decremnt the y value
				y -= 1;

				//move the current position up one, by subracting an entire widths worth of pixels
				pixelPos -= canvasWidth;
			}//wend

			//move down one again, because we hit an edge
			pixelPos += canvasWidth;
			y += 1;

			//
			reachLeft = false;
			reachRight = false;

			// Go down as long as the color matches and in inside the canvas
			while (y <= drawingBoundBottom && me.myMatchStartColor(pixelPos, startR, startG, startB)) {

				//move down one
				y += 1;

				//calcualte the current color with the node network
				var newColor = nodeModel.evaluate(startX, startY, x, y, canvasWidth, canvasHeight, ticker++);

				//convert color from hex to rgb
				var newColorRGB = colorMath.hexToRGB(newColor);
				
				if(newColorRGB==null){
					//console.log(newColor, newColor.length);
				}else{

					curColor = {
									r: newColorRGB.r,
									g: newColorRGB.g,
									b: newColorRGB.b
								}
				}

				//color the pixel at the current position
				me.colorPixel(pixelPos*4, curColor.r, curColor.g, curColor.b);

				//note that this pixel has been painted
				me.hasBeenPainted[pixelPos] = 1;

				//if x is still within bounds on the left
				if (x > drawingBoundLeft) {

					//check if the pixel to the left (four bytes over) matches our fill color
					if (me.myMatchStartColor(pixelPos - 1, startR, startG, startB)) {

						//not sure
						if (!reachLeft) {

							// Add pixel to stack because it's a valid pixel
							pixelStack.push([x - 1, y]);
							reachLeft = true;
						}
					} else if (reachLeft) {
						reachLeft = false;
					}//end if pixel one left matches fill color

				}//end if within x bounds

				//if x is still within bounds on the right
				if (x < drawingBoundRight) {

					//check if the pixel to the right (four bytes over) matches our fill color
					if (me.myMatchStartColor(pixelPos + 1, startR, startG, startB)) {

						//not sure
						if (!reachRight) {

							// Add pixel to stack because it's a valid pixel
							pixelStack.push([x + 1, y]);
							reachRight = true;
						}
					} else if (reachRight) {
						reachRight = false;
					}//end if one pixel right matches fill color

				}//end if within x bounds

				//move down one pixel, by added one widths worth of pixels to our positioned
				pixelPos += canvasWidth;

			}//wend moving down

		}//next p

		//timeout error
		if(ticker>canvasWidth*canvasHeight*2){
			pixelStack = [];
			console.log('timeout force quit.');
		}

		if(pixelStack.length==0)
			console.log('done!');
		else
			console.log('still working...');

		//context.putImageData(me.colorLayerData, 0, 0);
		context.putImageData(me.colorLayerData, 0, 0);

	//}//wend pixelStack still has elements

		if(pixelStack.length>0){
			//var that=this;
			setTimeout(doLine, 1);
		}

	}, 1);

	//paint the scene one last time
	context.putImageData(this.colorLayerData, 0, 0);

}//floodfill(startX, startY, startR, startG, startB)




//set the color of a pixel in our image data objects raw color data
clsTool_PaintBucket.prototype.colorPixel = function(pixelPos, r, g, b, a) {

	this.colorLayerData.data[pixelPos] = r;
	this.colorLayerData.data[pixelPos + 1] = g;
	this.colorLayerData.data[pixelPos + 2] = b;
	this.colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255;

}//colorPixel(pixelPos, r, g, b, a)

//check if a pixels color matches the color we started with
clsTool_PaintBucket.prototype.matchStartColor = function (curColor, pixelPos, startR, startG, startB) {

	r = this.colorLayerData.data[pixelPos];
	g = this.colorLayerData.data[pixelPos + 1];
	b = this.colorLayerData.data[pixelPos + 2];

	// If current pixel matches the new color
	if (r === curColor.r && g === curColor.g && b === curColor.b) {
		return false;
	}

	// If the current pixel matches the clicked color
	if (r === startR && g === startG && b === startB) {
		return true;
	}else
		return false;

	

	return false;
}//matchStartColor(curColor, pixelPos, startR, startG, startB)



//check if a pixels color matches the color we started with
clsTool_PaintBucket.prototype.myMatchStartColor = function(pixelPos, startR, startG, startB) {

	//if we've already painted this pixel
	if(this.hasBeenPainted[pixelPos]==1){
		return false;
	}

	pixelPos = pixelPos*4;

	//get the color componets from this pixel on the canvas
	r = this.colorLayerData.data[ pixelPos ];
	g = this.colorLayerData.data[ pixelPos + 1];
	b = this.colorLayerData.data[ pixelPos + 2];


	// If the current pixel matches the clicked color
	if (r === startR && g === startG && b === startB) {
		return true;
	}else
		return false;

	return false;
}//matchStartColor(curColor, pixelPos, startR, startG, startB)





clsTool_PaintBucket.prototype.myFloodFill = function(nodeModel, startX, startY, startR, startG, startB) {

	//declare local context reference for ease of code writing
	var context = this.CTX;

	//declare canvasWidth and Height
	var canvasWidth = this.canvasWidth;
	var canvasHeight = this.canvasHeight;

	//declare required variables
	var newPos,
		x,
		y,
		pixelPos,
		reachLeft,
		reachRight,
		drawingBoundLeft = 0,
		drawingBoundTop = 0,
		drawingBoundRight = canvasWidth-1,
		drawingBoundBottom = canvasHeight-1,
		pixelStack = [[startX, startY]];

	var curColor = {
		r: 30,
		g: 170,
		b: 190
	}

	var me=this;

	//reset the array keeping track of what has been painted this round
	this.hasBeenPainted = []; //new Array(canvasWidth*canvasHeight); //Array.apply(null, new Array(canvasWidth*canvasHeight)).map(Number.prototype.valueOf,0);
	for(var i=0; i<canvasWidth*canvasHeight; i++)
		this.hasBeenPainted.push(0);

	//console.log(this.hasBeenPainted.length);

	var ticker = 0;

	//our pixel stack is a list of pixels that are considered valid 'edge points'
	//while (pixelStack.length > 0) {
	setTimeout(function doFill(){

		

		//paint at least 100 pixels per update
		for(var i=0; (i<100000 && pixelStack.length>0); i++){

			

			//our pixel stack is a list of "valid" end-point pixels, that we should start painting from.
			//lets get the next one on the stack...
			newPos = pixelStack.pop();
			x = newPos[0];
			y = newPos[1];

			// Get current pixel position in the data array (four bytes per pixel)
			pixelPos = (y * canvasWidth + x);

			if(!me.myMatchStartColor(pixelPos, startR, startG, startB))
				continue;

			//calcualte the current color with the node network
			var newColor = nodeModel.evaluate(startX, startY, x, y, ticker++);

			

			//convert color from hex to rgb
			var newColorRGB = colorMath.hexToRGB(newColor);
			
			if(newColorRGB==null){
				//console.log(newColor, newColor.length);
			}else{

			curColor = {
							r: newColorRGB.r,
							g: newColorRGB.g,
							b: newColorRGB.b
						}
			}
			/*curColor = {
							r: Math.floor((Math.random() * 255) + 0),
							g: Math.floor((Math.random() * 255) + 0),
							b: Math.floor((Math.random() * 255) + 0)
						}*/
						
			//paint the current position since it's valid
			me.colorPixel(pixelPos*4, curColor.r, curColor.g, curColor.b);

			//note that this pixel has been painted
			me.hasBeenPainted[pixelPos] = 1;

			// !(x==fromX && y-1==fromY) && 
			if(y > drawingBoundTop && me.myMatchStartColor((pixelPos - (canvasWidth)), startR, startG, startB))
				pixelStack.push([x, y-1]);

			if(y < drawingBoundBottom && me.myMatchStartColor((pixelPos + (canvasWidth)), startR, startG, startB))
				pixelStack.push([x, y+1]);

			if(x > drawingBoundLeft && me.myMatchStartColor(pixelPos-1, startR, startG, startB))
				pixelStack.push([x-1, y]);

			if(x < drawingBoundRight && me.myMatchStartColor(pixelPos+1, startR, startG, startB))
				pixelStack.push([x+1, y]);

		}//next i

		//timeout error
		if(ticker>canvasWidth*canvasHeight*2){
			pixelStack = [];
			console.log('timeout force quit.');
		}

		if(pixelStack.length==0)
			console.log('done!');
		else
			console.log('still working...');

			//alert('done!');

		//update the canvas
		context.putImageData(me.colorLayerData, 0, 0);

		//if we still have more pixels to go, set another timeout
		if(pixelStack.length>0)
			setTimeout(doFill, 1);

	//end of timeout function
	}, 1);

	//paint the scene one last time
	context.putImageData(this.colorLayerData, 0, 0);

}//myFloodFill (startX, startY, startR, startG, startB)

































clsTool_PaintBucket.prototype.doPaint_old = function(event){

	//get position from event
	var parentOffset = $(this.canvas.mvarCanvasDOM).parent().offset();
    var x = (event.pageX - parentOffset.left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
    var y = (event.pageY - parentOffset.top);

	//for eaiser drawing code we'll create a local reference
	var ctx = this.canvas.mvarCTX;

	//this.canvas.setPixelRGBA(30, 170, 190, 0.5);
	

	//array buffer to keep track of paintined pixels
	var setPixels = {x:[], y:[]}

	//use the recursive funciton to loop and paint
	this.recursivePaint(x, y, 0, 0, this.canvasWidth, this.canvasHeight, setPixels);

	//begin drawing
	/*ctx.beginPath();

		//until later, just use black for nwo
		ctx.fillStyle = "black";
		ctx.arc(x, y, 10, 0, 2*Math.PI)
		ctx.fill();

	//all done drawing
	ctx.closePath();*/

}//doPaint(x, y)

clsTool_PaintBucket.prototype.recursivePaint_old = function(x, y, minX, minY, maxX, maxY, setPixelsBuff){

	//paint the pixel at the given x / y
	this.canvas.setPixelRGBA(30, 170, 190, 255);
	this.canvas.setPixel(x, y);

	//update our buffer to tell it that this has already been paintiend
	setPixelsBuff.x[x] = true;
	setPixelsBuff.y[y] = true;

	var me = this;

	//recursively paint in all directions
	//if one up is still within bounds
	if(y-1 >= minY)
		//if we haven't already paintined one-pixel up direction, then paint there:
		if(!(setPixelsBuff[x]==true && setPixelsBuff[y-1]==true))
			setTimeout(function(){
				me.recursivePaint(x, y-1, minX, minY, maxX, maxY, setPixelsBuff);
			}, 1);

	//if one down is still within bounds
	if(y+1 <= maxY)
		//if we haven't already paintined one-pixel down direction, then paint there:
		if(!(setPixelsBuff[x]==true && setPixelsBuff[y+1]==true))
			setTimeout(function(){
				me.recursivePaint(x, y+1, minX, minY, maxX, maxY, setPixelsBuff);
			}, 1);

	//if one left is still within bounds
	if(x-1 >= minX)
		//if we haven't already paintined one-pixel left direction, then paint there:
		if(!(setPixelsBuff[x-1]==true && setPixelsBuff[y]==true))
			setTimeout(function(){
				me.recursivePaint(x-1, y, minX, minY, maxX, maxY, setPixelsBuff);
			}, 1);

	//if one right is still within bounds
	if(x+1 <= maxX)
		//if we haven't already paintined one-pixel left direction, then paint there:
		if(!(setPixelsBuff[x+1]==true && setPixelsBuff[y]==true))
			setTimeout(function(){
				me.recursivePaint(x+1, y, minX, minY, maxX, maxY, setPixelsBuff);
			}, 1);
}



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS


//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsTool_PaintBucket.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsTool_PaintBucket.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsTool_PaintBucket.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)