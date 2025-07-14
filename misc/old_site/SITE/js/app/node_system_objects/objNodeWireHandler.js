/*
	What is the purpose of this file?

	This file defines an object which is responsbile for things like the ability to connect and disconnect node-wires.

	This file ALSO is responsible for drawing the node wires on the canvase.

*/

//the main node wire handler.
//NOTE: this object doesn't use prototyping because only one exists at a time.
//no need for the extra headache.
//The main purpose, therefore, is for name spacing
var nodeWireHandler = new function(){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//note: the concept of a "live-wire" is a wire that is currently being "dragged"
		//all wires that are fully conencted are not live wires.
		//live wires are only wires currently attached to the mouse in the process of being moved
		//when a new wire is being connect, it will typically have a start-point and an end-point
		//although it's important to know whether the start or end is a input or output,
		//for drawing a wire we really just care about the X/Y positions
		//these variables will store the start and end positions as well as the coneciton details
		this.startWire = { 'x':0, 'y':0, 'IOInfo': null };
		this.endWire = { 'x':0, 'y':0, 'IOInfo': null };

		//this flag will determine if a live-wire needs to be drawn
		this.liveWire = false;

		//when wiring nodes, we will save a possible connection when a valid one is identified.
		//this will be used for snapping, and eventually making the connection
		this.potentialConnection = null;

		//the wire handler will keep track of all the wires in the scene,
		//and consequently the connections as well.
		//although we'll build a general model before we do any computation on the node network
		//this class will store the connections to build that model from
		this.connections = [];

		//the following variables are for the DRAWING routines
		this.mvarCanvas = '';
		this.mvarCanvasJquery = null;
		this.mvarCTX = '';



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//it's important that we don't try to build this until the document has loaded
		//wait for the document to be ready
		$(document).ready(function(){

			//get a reference to our canvas object
			me.mvarCanvas = document.getElementById("canvasNodeLines");

			//get a jquery reference to our canvas
			me.mvarCanvasJquery = $('#canvasNodeLines');

			//this function requires closure or it forgets what the variables are
			//make sure the canvas is always the correct 1:1 size as the window resizes
			$(window).resize(function() {

				//update the canvas
				me.mvarCanvasJquery.attr({width:screen.width, height:screen.height});

				//make sure the screen re-draws on windows resize
				me.renderWires();
				//console.log(screen.width, screen.height);
			});

			//give it a default size
			//console.log(screen.width, screen.height);
			//me.mvarCanvasJquery.attr({width:screen.width, height:screen.height});
			//$('#mvarCanvasJquery').attr('width', 5000).css('width', '5000px');

			//force a resize because the above code isn't working for some strange reason
			$(window).resize();

			//get the drawing context of our canvas to output to...
			me.mvarCTX = me.mvarCanvas.getContext("2d");

			//set up the drawing function using googles requestAnimFrame funciton for performance
			requestAnimFrame(me.drawWires);

		});//document is ready



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS


	//NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING
	//NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING +++ NODE DRAGGING

		//start dragging the nodes around
		this.startDrag = function(event, IOType, NodeID, IOName, InputData){

			//prevent dragging artifacts from the browser trying to select text
			event.preventDefault();

			//make a compact reference for this input
			var thisEnd = {'IOInfo': InputData, 'IOType': IOType, 'NodeID': NodeID, 'IOName':IOName};

			//before we start a new live wire, we should check if this is an input we're dragging
			//and if that input already has a wire.
			//Remember, each input can only have one wire.
			//if this input already has a wire, we should delete the connection
			//and make the existing wire the "live wire"
			//this will be the mechanism for removing connections as well as rewiring existing connections
			if(IOType=='input' && me.checkInput(thisEnd)==true){

				//since there's already a connection, we need to find the other end of the connect
				var connectionIndex = me.getConnectionByInput(thisEnd);

				//get reference to the start end.
				var startEnd = me.connections[connectionIndex].startWire;

				//build the existing connection  as the start-wire
				me.startWire.x = startEnd.IOInfo.DOM.offset().left;
				me.startWire.y = startEnd.IOInfo.DOM.offset().top;
				me.startWire.IOInfo = startEnd.IOInfo;
				me.startWire.IOType = startEnd.IOType;
				me.startWire.NodeID = startEnd.NodeID;
				me.startWire.IOName = startEnd.IOName;

				//remove the existing connection
				this.removeConnectionByInput(thisEnd);

			//otherwise, this is either an empty input handle or it's an output handle
			}else{

				//save the information for the start wire
				me.startWire.x = InputData.DOM.offset().left;
				me.startWire.y = InputData.DOM.offset().top;
				me.startWire.IOInfo = InputData;
				me.startWire.IOType = IOType;
				me.startWire.NodeID = NodeID;
				me.startWire.IOName = IOName;

			}//end if node input already has input

			//we now have a live-wire!
			me.liveWire = true;

			//start a drag
			dragHandler.dragStart( me.dragWire, me.dragWireEnd );

		}//startDrag(event, IOType, NodeID, Name)


		//a node IO handle says "hello," for snapping on mouse-over
		this.handleHello = function(event, IOType, NodeID, IOName, InputData){

			//when this function is called, we only really care about it if we're in connection / liveWire mode
			if(!me.liveWire)
				return false;

			//we need to check to see if the current IO handle is a valid match for our current liveWire

			//if the type, nodeid and name are all the same we should quietly exit -
			//since the user cant connect IOs to themselves!
			if(me.startWire.IOType==IOType && me.startWire.NodeID==NodeID && me.startWire.IOName==IOName){
				me.potentialConnection = null;
				return false;
			}

			//if the type is the same type, show an error
			if(me.startWire.IOType == IOType){
				me.showWarningToolTip('error', "<b>ERROR</b>: You cannot connect an " + IOType + " to another " + IOType);
				me.potentialConnection = null;
				return false;
			}

			//you cannot connect an input and an output on the same node
			if(me.startWire.NodeID == NodeID){
				me.showWarningToolTip('error', "<b>ERROR</b>: You cannot connect a node to itself!");
				me.potentialConnection = null;
				return false;
			}

			//make a reference to this end (wether its an input or output)
			var thisEnd = {'IOInfo': InputData, 'IOType': IOType, 'NodeID': NodeID, 'IOName':IOName};

			//if this end is an input, we should make sure it's not trying to connect to an input that's already occupied
			//since each input can only have one wire
			if(thisEnd.IOType=='input' && me.checkInput(thisEnd)==true){
				me.showWarningToolTip('error', "<b>ERROR</b>: This input handle already has a connection.<br>Please remove it first.");
				me.potentialConnection = null;
				return false;
			}

			//to make the next section easier, let's organize the inputs and outputs.
			//the reason is, the user can drag from an output TO an input
			//OR from an input TO an output.
			//this means the "direction" of the wire will be important.
			//so lets check which side of the wire is which, and make some easier to use variables
			if(me.startWire.IOType=='output'){
				var wireOut = me.startWire;
				var wireIn = thisEnd;
			}else{
				var wireOut = thisEnd;
				var wireIn = me.startWire;
			}

			//if the type of output is a color and the input is anything else
			if(wireOut.IOInfo.type=='color' && wireIn.IOInfo.type!='color')
				me.showWarningToolTip('warning', '<b>WARNING</b>:<br>This will convert a <b>COLOR</b> to a <b>FLOAT</b> of the average light value.');

			//if the type of output is a red color and the input is anything else
			if(wireOut.IOInfo.type=='red' && wireIn.IOInfo.type!='color' && wireIn.IOInfo.type!='red')
				me.showWarningToolTip('warning', '<b>WARNING</b>:<br>This will convert a <b>RED COLOR COMPONENT</b> to a <b>FLOAT</b> of the average light value.');

			//if the type of output is a green color and the input is anything else
			if(wireOut.IOInfo.type=='green' && wireIn.IOInfo.type!='color' && wireIn.IOInfo.type!='green')
				me.showWarningToolTip('warning', '<b>WARNING</b>:<br>This will convert a <b>GREEN COLOR COMPONENT</b> to a <b>FLOAT</b> of the average light value.');

			//if the type of output is a blue color and the input is anything else
			if(wireOut.IOInfo.type=='blue' && wireIn.IOInfo.type!='color' && wireIn.IOInfo.type!='blue')
				me.showWarningToolTip('warning', '<b>WARNING</b>:<br>This will convert a <b>BLUE COLOR COMPONENT</b> to a <b>FLOAT</b> of the average light value.');

			//if the type of output is a float and the input is an int
			if(wireOut.IOInfo.type=='float' && wireIn.IOInfo.type=='int')
				me.showWarningToolTip('warning', '<b>WARNING</b>:<br>This will round a <b>FLOAT</b> to an <b>INTEGER</b>.<br>For more precision in rounding, consider a <i>Math Round</i? node.');

			//if the type of output is a float and the input is a color
			if(wireOut.IOInfo.type=='float' && wireIn.IOInfo.type=='color')
				me.showWarningToolTip('warning', '<b>WARNING</b>:<br>This will round a <b>FLOAT</b> to a <b>GRAYSCALE COLOR</b>.');

			//if the type of output is a float and the input is a color
			if(wireOut.IOInfo.type=='float' && wireIn.IOInfo.type=='color')
				me.showWarningToolTip('warning', '<b>WARNING</b>:<br>This will round a <b>FLOAT</b> to a <b>GRAYSCALE COLOR</b>.');


			//if we've gotten this far without exiting due to error, we can save this as a potentian connection
			me.potentialConnection = thisEnd;


		}//handleHello(event, IOType, NodeID, Name)

		//a node IO handle says "goodbye," for snapping on mouse-over
		this.handleGoodbye = function(event, IOType, NodeID, Name, InputData){

			//hide the tool tip
			$('#divToopTipText').hide();

			//no need to have a potential connection when the mouse leaves an IO handle
			me.potentialConnection = null;

		}//handleGoodbye(event, IOType, NodeID, Name)

		//show a tool-tip warning
		this.showWarningToolTip = function(style, warningText){

			//set the warning text
			$('#divToopTipText').html(warningText);

			//set up the style classes correctly
			$('#divToopTipText').removeClass('toolTip_warning').removeClass('toolTip_error').addClass('toolTip_'+style);

			//get the current cursor position (we need to subract the top of the node editor or else it will be off)
			var cursorX = dragHandler.mvarMouseX;
			var cursorY = dragHandler.mvarMouseY - $('#divNodeEditor').offset().top + 15;

			//position the warning label
			$('#divToopTipText').css('top', cursorY+'px').css('left', cursorX+'px');

			//show the tool tip
			$('#divToopTipText').show();

		}//showWarningToolTip(warningText)

		//handle a drag
		this.dragWire = function(deltaX, deltaY){
			me.renderWires();
		}//dragWire()

		//handle a drag finish
		this.dragWireEnd = function(deltaX, deltaY){

			//no longer dragging...
			me.liveWire = false;

			//if we had a potential connection we stopped dragging,
			//let's make that connection an actual connection
			if(me.potentialConnection != null){

				//add a connection
				me.addConnection(me.startWire, me.potentialConnection);

			}//a potentential connect exists

			//no more potential connections
			me.potentialConnection = null;

			//update the scene with the new wire connection
			me.renderWires();

		}//dragWireEnd()



	//MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS
	//MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS +++ MANAGE CONNECTIONS
		
		//add a connection
		this.addConnection = function(startWire, connection){

			//make new objects, other wise the refernces to start wire will carry over and skrew stuff up later on
			var SW = {'IOInfo': startWire.IOInfo, 	'IOType': startWire.IOType, 	'NodeID': startWire.NodeID,		'IOName':startWire.IOName	};
			var EW = {'IOInfo': connection.IOInfo, 	'IOType': connection.IOType, 	'NodeID': connection.NodeID, 	'IOName':connection.IOName	};

			//to make the next section easier, let's organize the inputs and outputs.
			//the reason is, the user can drag from an output TO an input
			//OR from an input TO an output.
			//this means the "direction" of the wire will be important.
			//so lets check which side of the wire is which, and make some easier to use variables
			if(startWire.IOType=='output'){
				var wireOut = SW;
				var wireIn = EW;
			}else{
				var wireOut = EW;
				var wireIn = SW;
			}

			//add a connection to our list of connections
			me.connections.push(	{
										'startWire':wireOut,
										'endWire':wireIn
									});

			//tell node about it's new incomming connection
			nodeManager.mvarNodes[wireIn.NodeID].NODE.connectInput(wireIn.IOName, wireOut);

		}//addConnection(startWire, connection)


		//add a connection
		this.addConnectionByNodeID = function(OutputNodeID, OutputName, InputNodeID, InputName){
			//console.log(nodeManager.mvarNodes[OutputNodeID])

			//build the start wire and end wire
			var SW = {'IOInfo': nodeManager.mvarNodes[OutputNodeID].NODE.mvarOutputs[OutputName], 	'IOType': 'output', 	'NodeID': OutputNodeID,	'IOName':OutputName	};
			var EW = {'IOInfo': nodeManager.mvarNodes[InputNodeID].NODE.mvarInputs[InputName], 		'IOType': 'input', 		'NodeID': InputNodeID, 	'IOName':InputName	};

			//use the regular add connectin function
			me.addConnection(SW, EW);

		}//addConnection(startWire, connection)


		//get the index of our connection by reference to it's input-side
		this.getConnectionByInput = function(inputHandle){

			//loop thru our connections and see if one of them connects to an input handle
			for(var i=0; i<me.connections.length; i++){

				//get reference to the connect
				var connection = me.connections[i];

				//check if this connection's end point is the same as the one passed to this function.
				//BY THE WAY, in our connections list, the end points will always be inputs
				//the connections list is always sorted in the same "direction"
				if(
					connection.endWire.IOType == inputHandle.IOType
					&&
					connection.endWire.NodeID == inputHandle.NodeID
					&&
					connection.endWire.IOName == inputHandle.IOName)
						return i;

			}//next i

			//no matches found? return false
			return null;

		}//getConnectionByInput(inputHandle)

		//remove a connection based on it's input-side
		this.removeConnectionByInput = function(inputHandle){

			//get the index of the connection
			var connectionIndex = me.getConnectionByInput(inputHandle);

			//remove the array element at this index
			var oldConnection = me.connections.splice(connectionIndex, 1);
			
			//tell the node that it's input has been disconnect
			//tell node about it's new incomming connection
			nodeManager.mvarNodes[oldConnection[0].endWire.NodeID].NODE.disconnectInput(oldConnection[0].endWire.IOName);

			//update the scene with the new wire connection
			me.renderWires();

		}//removeConnectionbyInput(inputHandle)

		//check if a particular IO INPUT handle already has a connection
		this.checkInput = function(inputHandle){

			//attempt to get the node, and if the result is non-null we can assume it has an input
			return (me.getConnectionByInput(inputHandle) === null) ? false : true;
			
		}//checkInput(inputHandle)

		//delete all the connections with this node id on either end
		this.deleteConnectionsByNodeID = function(NodeID){

			//loop through all our connections and remove any that have this node id
			for(var i = (me.connections.length-1); i>=0; i--){

				//get reference to the connect
				var connection = me.connections[i];

				//check if either end of the connection is connected to this node
				if(connection.startWire.NodeID==NodeID || connection.endWire.NodeID==NodeID){

					//remove the connection from the array
					var oldConnection = me.connections.splice(i, 1);

					//if this was the start wire (the output), tell the input of the other node that there was a disconnect
					//note that we don't have to go the other way.
					if(oldConnection[0].startWire.NodeID==NodeID)
						nodeManager.mvarNodes[oldConnection[0].endWire.NodeID].NODE.disconnectInput(oldConnection[0].endWire.IOName);

				}//connectiong includes this node

			}//next i

			//update the scene with wires deleted
			me.renderWires();

		}//deleteConnectionsByNodeID(NodeID)


	//PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION
	//PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION +++ PROPAGATION
		
		//when a node changes, it will notify this method.
		//if there are any connections to the outputs of this node, the nodes they're linked to need to be updated
		this.nodeUpdate = function(NodeID){

			//loop thru our list of connections, looking for outputs with this NodeID
			for(var i=0; i<me.connections.length; i++){

				//get local reference to this connection
				var conn = me.connections[i];

				//if it matches the output of a connection, we need to refresh the input end of that connection
				if(conn.startWire.NodeID == NodeID)
					nodeManager.mvarNodes[conn.endWire.NodeID].update();
			}//next i

		}//nodeUpdate(NodeID)



	//DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING
	//DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING +++ DRAWING
	//the following methods deal with rendering the node-wires in our current set up

		//renders the current wires scene
		this.renderWires = function(){
			requestAnimFrame(me.drawWires);
		}//renderWires()

		//draw all the wires in the current node step-up (incuding wires that are being dragged!)
		this.drawWires = function(){

			//for easier syntax, let's make some local reference variables
			var ctx = me.mvarCTX;
			var canvas = me.mvarCanvas;

			//begin drawing
	    	ctx.beginPath();

	    	//erase the background with transparency (using clearRect istead of painting a background rectangle)
	    	ctx.clearRect(0, 0, canvas.width, canvas.height);

			//all done drawing
			ctx.closePath();

			//loop thru the connections and draw each one
			for(var i=0; i<me.connections.length; i++){

				//draw the line for this connection
				me.drawConnection(me.connections[i]);

			}//next i

			//draw the current live wire
			if(me.liveWire)
				me.drawLiveWire();

		}//drawWires()	

		//draw a connection wire
		this.drawConnection = function(connection){

			var X1 = connection.startWire.IOInfo.DOM.offset().left - $('#divNodeEditor').offset().left;
			var Y1 = connection.startWire.IOInfo.DOM.offset().top - $('#divNodeEditor').offset().top + 4;
			var X2 = connection.endWire.IOInfo.DOM.offset().left - $('#divNodeEditor').offset().left;
			var Y2 = connection.endWire.IOInfo.DOM.offset().top - $('#divNodeEditor').offset().top + 4;

			this.drawCurvedWire(X1, Y1, X2, Y2);

		}//drawConnection(connection)

		//draw the current live-wire
		this.drawLiveWire = function(){

			
			//console.log(dragHandler.mvarMouseX, nodeGridHandler.mvarX)

			//if we don't have a potential connect to snap to, we'll just use the cursors coordiantes
			if(me.potentialConnection==null){

				//get the current cursor position (we need to subract the top of the node editor or else it will be off)
				var endX = dragHandler.mvarMouseX - $('#divNodeEditor').offset().left;
				var endY = dragHandler.mvarMouseY - $('#divNodeEditor').offset().top;

			//otherwies we'll use the potential hookup as coordiantes
			}else{
				var endX = me.potentialConnection.IOInfo.DOM.offset().left - $('#divNodeEditor').offset().left;
				var endY = me.potentialConnection.IOInfo.DOM.offset().top - $('#divNodeEditor').offset().top + 4;
			}

			/*
			ctx.moveTo(me.startWire.IOInfo.DOM.offset().left - 14, me.startWire.IOInfo.DOM.offset().top - $('#divNodeEditor').offset().top + 4);
			ctx.lineTo(cursorX, cursorY);
			ctx.stroke();
			*/

			var X1 = me.startWire.IOInfo.DOM.offset().left - $('#divNodeEditor').offset().left;
			var Y1 = me.startWire.IOInfo.DOM.offset().top - $('#divNodeEditor').offset().top + 4;
			var X2 = endX;
			var Y2 = endY;

			this.drawCurvedWire(X1, Y1, X2, Y2, (me.startWire.IOType=='output' ? false : true ) );

		}//drawLifeWire()

		//draw a fancy curved wire (flipped means that the first tanget is on the right pointing left)
		this.drawCurvedWire = function(x1, y1, x2, y2, flipped){

			//flipped is an optional variable...
			flipped = (typeof flipped === "undefined") ? false : flipped;

			//for easier syntax, let's make some local reference variables
			var ctx = me.mvarCTX;
			var canvas = me.mvarCanvas;

			//first get the difference between the points
			var deltaX = x2 - x1;
			var deltaY = y2 - y1;

			//and get the literally hieight and width of the curve
			var width = Math.abs(deltaX);
			var height = Math.abs(deltaY);

			//the out tangets will always be horizontal,
			//but their strength / value will change depending on how great the distance is
			var tangentVelocity = width*0.1;

			//now lets loop to draw N lines between the two points, with a neat curve
			var totalSegments = 50;
			var sx = x1;
			var sy = y1;

			for(var i=0; i<=totalSegments; i++){

				//calculate the percentage we're along the curve (between 0.0 and 1.0)
				var perc = (i / totalSegments);

				//CALCULATE THE NEW X POSITION

					var ex = x1 + perc * deltaX;

					//if it's negative, we should add a bit of a sin curve to the x values so they "stick out" a bit
					if(deltaX<0){
						
						if(flipped)
							var ex = x1 + perc * deltaX;
						else
							var ex = x1 + (perc * deltaX) - (Math.sin(perc * Math.PI * 2) * deltaX * 0.4);

					}else{
						if(flipped)
							var ex = x1 + (perc * deltaX) - (Math.sin(perc * Math.PI * 2) * deltaX * 0.4);
						else
							var ex = x1 + perc * deltaX;
					}


				//CALCULATE THE NEW Y POSITION
					//calculate the distance from the center of the curve
					var distanceFromCenter = Math.abs(perc - 0.5);

					//adjust the distance from center, such that the center is 1 and the edges are 0
					distanceFromCenter = 1.0 - (distanceFromCenter / 0.5);

					//this curve should
					var yCurve = Math.pow(distanceFromCenter, 2);

					//if flip the coordinates (the parabola) if it's over half way
					if(perc<0.5){
						var ey = y1 + deltaY * yCurve * 0.5; 
					}else{
						var ey = (y1 + deltaY) - deltaY * yCurve * 0.5; 
					}


				//chose a color
				/*if((i%2) == 0)
					ctx.strokeStyle = "rgb(255, 255, 255);";
				else
					ctx.strokeStyle = "rgb(247, 143, 55);";
				*/

				//node lines are orange...
				ctx.strokeStyle = "rgb(247, 143, 55);";
				//ctx.strokeStyle = "rgb(255, 255, 255);";

				//begin drawing
	    		ctx.beginPath();
					ctx.moveTo(sx, sy);
					ctx.lineTo(ex, ey);
					ctx.stroke();
				ctx.closePath();

				//update the start x/y for the next loop
				sx = ex;
				sy = ey;

			}//next i

		}//drawCurvedWire(x1, y1, x2, y2)


}//object nodeWireHandler()