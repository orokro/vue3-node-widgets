/*
	
	This is the main class for Nodes.

	All different types of nodes will "inherit" from this class.

	Actually, all nodes will just create a node inside their own class and wrap this generic node.

	This is responsible for construction of the HTML platofrm for the node.

	It's also responsible for handing input / output / evaluation of connections.

*/


//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//a general node class
clsNode = function(id, x, y, width, height){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution
		var me = this;

		//misc properties
		this.mvarDOM = null; //this will be null until we construct the dom element
		this.mvarTitle = "Untiled"; //default title
		this.mvarNodeID = id;

		//position variables
		this.mvarX = x - (x%10); //make sure the x value is a multiple of 10
		this.mvarY = y - (y%10); //make sure the y value is a multiple of 10

		//width and height variables
		this.mvarWidth = width - (width%10); //make sure the width is a multiple of 10
		this.mvarHeight = height - (height%10); //make sure the height is a multiple of 10
		this.mvarMinWidth = 120;
		this.mvarMinHeight = 80;
		this.mvarMaxWidth = 0; //0 = infnitite
		this.mvarMaxHeight = 0; //0 = infinite

		//this is a very important array of internal attributes
		this.mvarAttrs = [];

		//this counter makes sure each attribute is given a unique ID relative to this node
		this.mvarAttrIDCounter = 0;

		//we need two arrays to keep track of all this node's inputs and outputs.
		//keeping track of inputs and outputs is absolutely critical for supporting the "model" of the node, and wiring nodes together.
		this.mvarInputs = {};
		this.mvarOutputs = {};

		//object with previously calculated output values for this node!
		this.outputs = {};

		//save reference to the class that includes this clas
		this.super = null;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add new HTML to the collection of nodes
		$('#divNodeContainer').append(		'<div id="node_' + this.mvarNodeID + '" class="node" style="left:' + x + 'px; top:' + y + 'px; width: ' + (this.mvarWidth-1) + '">' +
												'<div class="nodeTitle">' +
													'<span>' + this.mvarTitle + '</span>' +
													'<div class="nodeCloseButton"></div>' +
												'</div>' +
												'<div class="nodeBody"></div>' +
												'<!-- required resize handle -->' + 
												'<div class="nodeResizeHandle">&nbsp;</div>' +
											'</div>'	);
		//'<div class="nodeBody" style="height: ' + (this.mvarHeight-1) + 'px"></div>' +

		//save a reference to the DOM element that represents this node
		this.mvarDOM = $('#node_'+this.mvarNodeID);

		//bind events for manipulation of this node

		//bind the dragging events set (using jQuery chaining)
		this.mvarDOM.find('.nodeTitle').mousedown(function(event){me.startDrag(event);});

		//bind the resizing events
		this.mvarDOM.find('.nodeResizeHandle').mousedown(function(event){me.startResize(event);});
		
		//bind the delete-node event
		this.mvarDOM.find('.nodeCloseButton').click(function(event){	nodeManager.deleteNode(me.mvarNodeID);		});



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
		
		


}//clsNode(x, y)



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS

//GENERAL DRAGGING +++ GENERAL DRAGGING +++ GENERAL DRAGGING +++ GENERAL DRAGGING
//GENERAL DRAGGING +++ GENERAL DRAGGING +++ GENERAL DRAGGING +++ GENERAL DRAGGING

	//when a node has a mousedown to begin dragging (for either resizing or movement)
	clsNode.prototype.startDrag = function(event){

		//prevent text selection on the title (the default browser behavior)
		event.preventDefault();
		
		//save the initial position of the node so we can calculate a delta later
		this.dragStartX = this.mvarX;
		this.dragStartY = this.mvarY;

		//call start a drag with our dragHandler object, and pass our callback function too it
		var me = this;
		dragHandler.dragStart( function(x, y){me.doDrag(x, y);} );

	}//startDrag()

	//actually perform the drag
	clsNode.prototype.doDrag = function(deltaX, deltaY){

		//calculate the new position for the node
		var newX = this.dragStartX - deltaX;
		var newY = this.dragStartY - deltaY;

		//make sure the position is snapped to a multiple of 10
		newX = newX - (newX%10);
		newY = newY - (newY%10);

		//update the new position of the node
		this.mvarX = newX;
		this.mvarY = newY;
		this.mvarDOM.css('left', this.mvarX+'px');
		this.mvarDOM.css('top',  this.mvarY+'px');

		//make sure to update the screen
		nodeWireHandler.renderWires();

	}//doDrag(deltaX, deltaY)



//RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING
//RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING +++ RESIZING
	
	//when a node has a mousedown to begin resizing (for either resizing or movement)
	clsNode.prototype.startResize = function(event){

		//prevent text selection on the title (the default browser behavior)
		event.preventDefault();
		
		//save the initial position of the node so we can calculate a delta later
		this.dragStartX = this.mvarWidth;
		this.dragStartY = this.mvarHeight;

		//call start a drag with our dragHandler object, and pass our callback function too it
		var me = this;
		dragHandler.dragStart( function(x, y){me.doResize(x, y);} );

	}//startDrag()

	//actually perform the resize
	clsNode.prototype.doResize = function(deltaX, deltaY){

		//calculate the new position for the node
		var newW = this.dragStartX - deltaX;
		var newH = this.dragStartY - deltaY;

		//make sure it fits within the min and max sizes
		if(newW < this.mvarMinWidth) newW = this.mvarMinWidth;
		if(newH < this.mvarMinHeight) newH = this.mvarMinHeight;
		if(this.mvarMaxWidth != 0 && newW > this.mvarMaxWidth) newW = this.mvarMaxWidth;
		if(this.mvarMaxHeight != 0 && newH > this.mvarMaxHeight) newH = this.mvarMaxHeight;

		//make sure the position is snapped to a multiple of 10
		newW = newW - (newW%10);
		newH = newH - (newH%10);

		//update the new position of the node
		this.mvarWidth = newW;
		this.mvarHeight = newH;
		this.mvarDOM.css('width', (this.mvarWidth-1) +'px');
		//this.mvarDOM.find('.nodeBody').css('height',  (this.mvarHeight-1) +'px');

		//make sure to update the screen
		nodeWireHandler.renderWires();

	}//doResize(deltaX, deltaY)



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
	clsNode.prototype.getTitle = function(){ return this.mvarTitle; }
	clsNode.prototype.getDOM = function(){ return this.mvarDOM; }
	clsNode.prototype.getID = function(){ return this.mvarNodeID; }
	clsNode.prototype.getCTRL = function(id){ return this.mvarAttrs[id].CRTL; }


//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS

	clsNode.prototype.setTitle = function(title){

		//save the new title
		this.mvarTitle = title;

		//update the HTML
		this.mvarDOM.find('.nodeTitle span').html(title);

	}//setTitle(title)



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//show an update toast notification in the title bar of the node when it's updated
	clsNode.prototype.showUpdate = function(){

		//show an update notification
		if(window.showUpdates==true)
			this.mvarDOM.find('.nodeTitle').append('<div class="nodeTitleUpdateToast">Update!</div>').find('.nodeTitleUpdateToast').last().fadeOut(1000, function(){$(this).remove();});

	}//showUpdate()

	//this method adds a new attirbute to a node.
	//an attribute consists of a node row, with a nodeControl, and optionally an input and output
	clsNode.prototype.addAttribute = function(props){

		//let's create a new entry which will eventually be pushed onto the array
		var attr = {};

		//we first need a unique ID
		attr.ID = this.mvarAttrIDCounter++;

		//the parameter 'props' should be a JSON object with various properties.
		//since ALL properties are optional, we shall check what was passed and set some defaults.

		//technically even props is optional, so we'llr eplace it with a empty object if it wasn't set.
		//this way, the rest of the checks wont get undefined errors
		props = (typeof props === "undefined") ? {} : props;

		//read each of the properties, which may or may not be present
		attr.Caption 	= (typeof props.caption  	=== "undefined") ? '' : props.caption;			//the title
		attr.Type 		= (typeof props.CTRLType 	=== "undefined") ? 'html' : props.CTRLType;		//the type of control
		attr.CRTLProps	= (typeof props.CRTLProps 	=== "undefined") ? null : props.CRTLProps;		//properties to pass onto the control
		attr.Input 		= (typeof props.input 		=== "undefined") ? null : props.input;			//details about the input of the control
		attr.Output 	= (typeof props.output 		=== "undefined") ? null : props.output;			//details about the input of the control
		attr.Default 	= (typeof props.def 		=== "undefined") ? '' : props.def;				//was a default value specified?
		attr.Min		= (typeof props.min 		=== "undefined") ? null : props.min;			//some controls require a minimum
		attr.Max		= (typeof props.max 		=== "undefined") ? null : props.max;			//some controls require a maximum

		//does this row have a caption? if so, add it BEFORE we add the row!
		if(attr.Caption != '')
			this.mvarDOM.find('.nodeBody').append('<small class="nodeRowCaption">' + attr.Caption + '</small>');

		//now that we've got all the possible required variables defined, let's build new row for the attribute
		this.mvarDOM.find('.nodeBody').append( '<div class="nodeRow"></div>' );

		//now we should grab a reference to the most recently added row
		attr.Row = this.mvarDOM.find('.nodeRow').last();

		//no connections yet
		attr.inputDetails = null;

		//does this row have an input? if so, add it!
		if(attr.Input!=null){
			
			//add a row of HTML for this input
			attr.Row.append('<div class="nodeIOHandle nodeInput nodeIOHandle_' + attr.Input.type + ' nodeIOHandleTop_' + attr.Type + '"></div>');

			//get reference to the last added nodeIOHandle
			attr.Input.DOM = attr.Row.find('.nodeInput').last();

			//no input connections yet
			attr.Input.inputDetails = null;

			//save a reference to this input object
			this.mvarInputs[attr.Input.name] = attr.Input;

			var myNodeID = this.mvarNodeID;
			
			//bind HTML events for this node with closure built in
			(function(){	

				var NodeID = myNodeID;
				var InputName = attr.Input.name;

				//when a mouse down is detected we should start this node-wire draging
				attr.Input.DOM.mousedown(function(event){ nodeWireHandler.startDrag(event, 'input', NodeID, InputName, attr.Input); });

				//when a mouse is moved over this node, we should tell the node wire manager that there was a mouse movement (for snapping / pluggin)
				attr.Input.DOM.mousemove(function(event){ nodeWireHandler.handleHello(event, 'input', NodeID, InputName, attr.Input); });

				//when a mouse is moved out from this node, we should tell the node wire manager that there was a mouse leave (for snapping / pluggin)
				attr.Input.DOM.mouseout(function(event){ nodeWireHandler.handleGoodbye(event, 'input', NodeID, InputName, attr.Input); });

			})();//closure
			
		}

		//does this row have an output? if so, add it!
		if(attr.Output!=null){

			//add a row of HTML for this output
			attr.Row.append('<div class="nodeIOHandle nodeOutput nodeIOHandle_' + attr.Output.type +  ' nodeIOHandleTop_' + attr.Type + '"></div>');

			//get reference to the last added nodeIOHandle
			attr.Output.DOM = attr.Row.find('.nodeOutput').last();

			//save a reference to this input object
			this.mvarOutputs[attr.Output.name] = attr.Output;

			//bind HTML events for this node with closure built in
			{	

				var NodeID = this.mvarNodeID;
				var OutputName = attr.Output.name;

				//when a mouse down is detected we should start this node-wire draging
				attr.Output.DOM.mousedown(function(event){ nodeWireHandler.startDrag(event, 'output', NodeID, OutputName, attr.Output); });

				//when a mouse is moved over this node, we should tell the node wire manager that there was a mouse movement (for snapping / pluggin)
				attr.Output.DOM.mousemove(function(event){ nodeWireHandler.handleHello(event, 'output', NodeID, OutputName, attr.Output); });

				//when a mouse is moved out from this node, we should tell the node wire manager that there was a mouse leave (for snapping / pluggin)
				attr.Output.DOM.mouseout(function(event){ nodeWireHandler.handleGoodbye(event, 'output', NodeID, OutputName, attr.Output); });

			}//closure
		}

		//now, based on the type of input we made, we need to add a primary control
		switch(attr.Type){

			case 'COLOR': //create a new color picker object!
				attr.CRTL = new clsNodeCRTL_ColorPicker(attr.Row, attr.CRTLProps);
				break;

			case 'FLOAT_SLIDER': //create a new float slider control
				attr.CRTL = new clsNodeCRTL_FloatSlider(attr.Row, attr.CRTLProps);
				break;

			case 'INT_SLIDER': //create a new integer slider control
				attr.CRTL = new clsNodeCRTL_IntSlider(attr.Row, attr.CRTLProps);
				break;

			case 'FLOAT_VALUE': //create a new float value control
				attr.CRTL = new clsNodeCRTL_FloatValue(attr.Row, attr.CRTLProps);
				break;

			case 'INT_VALUE': //create a new integer value control
				attr.CRTL = new clsNodeCRTL_IntValue(attr.Row, attr.CRTLProps);
				break;

			case 'DROPBOX': //create a new dropbox
				attr.CRTL = new clsNodeCRTL_DropBox(attr.Row, attr.CRTLProps);
				break;

			case 'CHECKBOX': //create a new dropbox
				attr.CRTL = new clsNodeCRTL_CheckBox(attr.Row, attr.CRTLProps);
				break;

			case 'TEXT_BOX': //create a new dropbox
				attr.CRTL = new clsNodeCRTL_TextBox(attr.Row, attr.CRTLProps);
				break;

			case 'HTML': //the default is html. Just add a div that can be customized
			default:
				attr.CRTL = new clsNodeCRTL_HTML(attr.Row, attr.CRTLProps);
				break;

		}//swatch type

		//FINALLY let's push this new attribute onto our internal list of attributes
		this.mvarAttrs.push(attr);

		//for debug, let's set up an onChange handler
		attr.CRTL.onChange( function(val){ /* console.log(attr.ID + ' says: ' + val); */ } );

	}//addAttribute(props)


	//this method adds tells an attribute that it's input has been wired to
	clsNode.prototype.connectInput = function(name, details){

		//get reference to the attribute that has an input with this name
		var attr = this.getAttrByNameAndType(name, 'input');

		//lock the control
		attr.CRTL.setLocked(true);

		//save the input details in two places
		attr.inputDetails = details;
		this.mvarInputs[name].inputDetails = details;

		//make sure the node updates with the new value
		this.super.update();

	}//connectInput


	//this method adds removes a connection details from an attributes input
	clsNode.prototype.disconnectInput = function(name){

		//get reference to the attribute that has an input with this name
		var attr = this.getAttrByNameAndType(name, 'input');

		//unlock the control
		attr.CRTL.setLocked(false);

		//remove the input details in two places
		attr.inputDetails = null;
		this.mvarInputs[name].inputDetails = null;
		
		//make sure the node updates with the new value
		this.super.update();

	}//disconnectInput
	

	//this method adds a new attirbute to a node.
	//an attribute consists of a node row, with a nodeControl, and optionally an input and output
	clsNode.prototype.getAttrByNameAndType = function(name, type){

		//loop thru our attributes and return the one that matches... or null if none
		for(var i=0; i<this.mvarAttrs.length; i++){

			//get reference to this attribute
			var attr = this.mvarAttrs[i];

			//if it's an input node..
			if(type=='input'){

				//check if the name and type match
				if(attr.Input!=null){
					if(attr.Input.name==name)
						return attr;
				}

			}else{

				//check if the name and type match
				if(attr.Output!=null){
					if(attr.Output.name==name)
						return attr;
				}
			}
		}//next i

		//nothing found? return null
		return null;

	}//getAttrByNameAndType(name, type)

	//check if we have a wire connect on an input
	clsNode.prototype.checkInputConnection = function(inputName){

		//if we have an input connection, ask that node for it's value
		var inputConnection = this.mvarInputs[inputName].inputDetails;

		return inputConnection!=null;

	}//checkInputConnection(inputName)

	//when this function is called it will check if we have an input connection for this input property
	//if we do, we'll use that value instead of the default value passed to it
	clsNode.prototype.getInputVal = function(inputName, CRTL){

		//if we have an input connection, ask that node for it's value
		var inputConnection = this.mvarInputs[inputName].inputDetails;

		//if it's not null, ask it's node for it's value
		if(inputConnection!=null){

			//get the distance node
			var distantNode = nodeManager.mvarNodes[inputConnection.NodeID].NODE;

			//get the value from the distant node
			var value = distantNode.outputs[inputConnection.IOName];

			//convert the value
			value = this.convertValue(inputConnection.IOInfo.type, this.mvarInputs[inputName].type, value);

			//make sure the CONTROL reflects this value
			if(CRTL!=null)
				CRTL.setValue(value, true);

			//return that value
			return value;

		//if there was no input connection, just return the value of the control
		}else
			return CRTL.getValue();

	}//getInputVal(inputName, defaultValue)

	//very important general purpose function for converting from one node type to another
	clsNode.prototype.convertValue = function(fromType, toType, value){

		//we need to cast the input value to make sure it's compatible with our input.
		//since this is a general function, it needs to be able to handle all types the nodes supports
		//whats more, if the controls have maximum / minimums, it should apply those too

		//how to convert it based on the far-side output type
		switch(fromType){

			//red, green, and blue have a special case when they're attached to a color input.
			//they shouldn't generate a gray-scale color
			case 'red':
				if(toType=='color'){
					var RGB = colorMath.floatToRGB(value);
					value = colorMath.RGBToHex(RGB.r, 0, 0);
					break;
				}

			case 'green':
				if(toType=='color'){
					var RGB = colorMath.floatToRGB(value);
					value = colorMath.RGBToHex(0, RGB.g, 0);
					break;
				}

			case 'blue':
				if(toType=='color'){
					var RGB = colorMath.floatToRGB(value);
					value = colorMath.RGBToHex(0, 0, RGB.b);
					break;
				}


			//if the distant output is type, r, g, b, float or int
			case 'red':
			case 'green':
			case 'blue':
			case 'float':

				//if based on our input type...
				switch(toType){

					//if our input type is r, g, b, or float we can just pass it through as-is
					case 'red':
					case 'green':
					case 'blue':
					case 'float':
						value = value;
						break;

					//if our input is an int, just force-round it
					case 'int':
						value = parseInt(value);
						break;

					//if our input type is color, convert it from a float to a color
					case 'color':
						//conver to the
						value = colorMath.floatToHex(value);
						break;
				}//swatch

				break;

			
			//if the distance type is integer...
			case 'int':

				//if based on our input type...
				switch(toType){

					//if our input type is int, just leave it alone
					case 'int':
						value = value;
						break;

					//if our intput type is r, g, b, or float we can just cast the int to a float
					case 'red':
					case 'green':
					case 'blue':
					case 'float':
						value = parseFloat(value);
						break;

					//if our input type is a color, we need to convert it from an integer to a color
					case 'color':
						value = colorMath.intToHex(value);
						break;

				}//swatch

				break;


			//if the distant output is a color
			case 'color':

				//if based on our input type...
				switch(toType){

					//if our input type is a color, just let it pass-through as-is
					case 'color':
						value = value;
						break;

					//if our input type is r, g, b, for float we need to convert the color to a light value between 0 and 1
					case 'red':
					case 'green':
					case 'blue':
					case 'float':
						console.log(value)
						value = colorMath.hexToFloat(value);
						console.log(value)
						break;

					//if our input type is int, we need to convert the color to a light value between 0 and 255
					case 'int':
						value = colorMath.hexToInt(value);
						break;
				}//swatch

				break;

		}//swatch

		//return the converted value
		return value;

	}//convertValue(fromType, toType, value)