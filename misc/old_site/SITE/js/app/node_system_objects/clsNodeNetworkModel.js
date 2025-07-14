/*
	What is the purpose of this file?

	This file creates a model of a node-set up so the drawing tools can quickly evaluate a node network.

	It's important to understand that a node-network model works exactly backwards of the node-network we display on screen.

	Why?

	First let's talk about the on screen node network:

	When a node wired to another node, it's changes flow from LEFT-to-RIGHT.
	So if you take the output of Node A and wire it to the input of Node B,
	when you change the value of Node A, it will force the value of Node B to update.
	This is going from left to right.

	However, for our runtime evaluation to work, we could in theory determine all the leaf nodes and update them first.

	BUT, it's much easier to work RIGHT-to-LEFT.

	So in this case, we'll start with the output node (which there can only be one of).
	Before it can evalute itself, it will have to ask it's input(s) what their values are.
	Those inputs, will have to ask their inputs what their values are, and so on.

	Eventualy the node network will be exhausted and fully-updated.

	Once this recursion is complete, the nodes will start returning values and calculating their own values.
	Eventually it will get back to the output node, with the fully evaluated color.


	HOW IT ALL WORKS

	we will maintain a list of "nodes"
	however, unlike the node-manager these wont be references to actual nodes with DOM overhead and such.
	instead, these will be model nodes.
	they will consist of Five things:

	-Attributes
		an "attributes" object which will store the current value of all the nodes attributes when the model was built.
		NOTE: the attributes will store both inputs that are wired as well as inputs that aren't wired.
		why?
		simple... if an input IS wired, it will be ingored anyway
		if an input isn't wired, ... then we have a copy of what it was set to in the edit.
	
	-Input Wires
		secondly, this node model will only keep track of which inputs are wired to other nodes outputs.
		It will only care about which node and which output.

	-The model function.
		The model function is a static method in the actual node classes.
		This model node will juts copy that function (which is static, so it can be copied safely)
		This will use the same "model" to compute that the on-screen nodes do in the editor.
	
	-Output values
		The model by default returns the outputs the node specifies.
		We will store the results of the last compute.
		If the node isn't dirtied, these values wont need to be recomputed
		
	-Dirty "flag"
		To prevent nodes from calculating more than once per evaluation,
		Nodes will be marked dirty at the beginning and then once their evaluated, can be assumed to be trust-worthy for this evaluation.
		Howver, to optomize we wont actually make this a boolean flag.
		Instead, at the beginning of each evaluation, a random number will be chosen.
		When the node is considered clean, its dirty-flag will be set equal to this random number.
		If it's asked to evaluate again in the future, and it's number matches it will no be re-computed.
		Note, that, when the random number is chosen, it will be compared to the previous random number to make sure it's not the same.

	Let's begin!
*/

//a model of a node network for evaluating at run-time
var nodeNetworkModel = function(nodeMgr, wireMgr){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//our list of model nodes
		this.modelNodes = [];

		//there must be one and only one output node
		//if for some reason the user added more than one, which ever one was added most recently will be the one evaluated (until its deleted)
		//if there are no output nodes, when it comes time to evaluate, the network will always just return 0 (black)
		//however, when we build this mode we must save reference to an output node, because thats where evaluations start
		this.outputNode = null;

		//our random number
		this.cleanNumber = 1;

		//save refernce to the nodeMgr and the wireMgr that was passed to this class
		//this is so we could someday (when I code it) have multiple node networks (and therefore, models) simultaneously
		this.nodeMgr = nodeMgr;
		this.wireMgr = wireMgr;

		//this object will store all the global input information about the current pixel being painted...
		//such as radius, color, x / y positions, etc
		this.globalInputs = {};


	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//we need to make a conversion array so we can convert "IDs" to "Indicies" for when we
		//start setting up the connections in this model...
		var IDtoIndex = [];

		//so... first we have to loop over all the nodes in the nodeMgr and build a model for each
		for(var n=0; n<nodeMgr.mvarNodes.length; n++){

			//get local reference to the node
			var node = nodeMgr.mvarNodes[n];

			//only proceed if it's not null (deleted nodes are set to null...)
			if(node != null){

				//unlike the other node manager, in this system nodes will have their own ID based on
				//their index position in the array.
				//in this case, the index will always be the current length of the array
				var nodeIndex = this.modelNodes.length;

				//build a model node!
				var modelNode = new clsModelNode(this, nodeIndex, node);

				//add it to our list of model nodes!
				this.modelNodes.push(modelNode);

				//add it's id to our conversion array
				IDtoIndex[modelNode.NodeID] = nodeIndex;

				//if this is the output node, save it's index for evaluation time
				if(modelNode.type=='OutputPaintBucket')
					this.outputNode = nodeIndex;

			}//end if not null

		}//next n

		console.log(this.outputNode)

		//now that we've loaded in all the nodes, we need to loop thru connections and tell each node about a connection
		for(var c=0; c<wireMgr.connections.length; c++){

			//get local reference to connection
			var connection = wireMgr.connections[c];

			// in this case, we only care about the endWire, which is where a wire connects to an INPUT
			// we care about the endWire, because we need to tell nodeModel that it has an input
			// so lets tell the node this connection connects to that it has an input

			//first lets convert it to an index
			var modelIndex = IDtoIndex[connection.endWire.NodeID];

			//next lets convert startWire to an index so we can tell the node about it
			var startIndex = IDtoIndex[connection.startWire.NodeID];

			//finally, let's tell the node about this connection!
			this.modelNodes[modelIndex].addInput(startIndex, connection);

		}//next c

	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS

}//object nodeNetworkModel()


//calculate the current pixel color using this node network!
//NOTE: centerX/Y is considered to be where the mouse was clicked.
//not the center of the screen!
nodeNetworkModel.prototype.evaluate = function(centerX, centerY, currentX, currentY, canvasWidth, canvasHeight, tick){

	//if for some reason an output node was never created, just return hex for black
	if(this.outputNode==null)
		return '000000';

	//before we calcualte anything, we need to calculate our global inputs so the input-nodes can reference them
	this.globalInputs = {
							'canvas_X': currentX,
							'canvas_y': currentY,
							'cursor_x': (currentX - centerX),
							'cursor_y': (currentY - centerY),
							'canvasWidth': canvasWidth,
							'canvasHeight': canvasHeight,
							'radius': Math.sqrt( Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2) ),
							'theta': (360+360+Math.atan2((currentX - centerX), (currentY - centerY)) * (180 / Math.PI))%360,
							'tick':tick
						}

	//come up with a new "clean" number
	var newCleanNumber = Math.floor((Math.random() * 255) + 0);
	while(newCleanNumber == this.cleanNumber)
		newCleanNumber = Math.floor((Math.random() * 255) + 0);

	this.cleanNumber = newCleanNumber;

	//ask the output node for it's output,
	//which will recursively evaluate the entire node network
	var output = this.modelNodes[this.outputNode].getOutput();

	//return the output of the output node... that simple!
	return output.col;

}//evaluate(centerX, centerY, currentX, currentY)











//build a model node object from a proper node object
var clsModelNode = function(networkModel, index, node){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//save reference to the model that created this modelNode,
		//because it will have required data for evaluating input nodes and such
		this.networkModel = networkModel;

		//save our index
		this.index = index;

		//save the node id of the proper node
		this.NodeID = node.NODE.mvarNodeID;

		//save the type of node this represents
		this.type = node.typeName;

		//save the attributes as they currently are on the node
		this.attrModel = node.getModelAttrs();

		//save the model function to compute
		this.modelFunction = node.model;

		//empty array to store input connections later on
		this.inputs = [];

		//empty object that will evetually store our computed outputs
		this.outputs = {};

		//we're not dirty yet!
		this.dirty = 0;

}//clsModelNode(index, node)

//add a connection to this node
clsModelNode.prototype.addInput = function(farIndex, connection){

	//so what we care about is... what type of data this is incomming
	//so we can covert to it properly later
	//
	//we care about the "name" of this input (on our side)
	//so we know which attributes to replace later
	//
	//we care about the index (not ID) of the distant node,
	//so we know which MODEL to ask for output
	//
	//we care about the type of data we're receving from the output
	//so we can properly conver later
	//
	//and we care about the output name of the distant node,
	//so we can ask for the correct output
	//
	//soo....
	//lets save all that stuff
	this.inputs.push(	{
							'inputName':connection.endWire.IOInfo.name,
							'inputType':connection.endWire.IOInfo.type,
							'farNodeIndex':farIndex,
							'farNodeOutputName':connection.startWire.IOInfo.name,
							'farNodeOutputType':connection.startWire.IOInfo.type
						});

}//addInput(farIndex, connection)

//return the output of this node.
//note: we will only calculate it if we're "dirty"
//otherwise, if we're clean we'll return the pre-computed output
clsModelNode.prototype.getOutput = function(){

	//there's a few special-case nodes that don't use a model to calcualte.
	//these nodes are the input nodes, where the values are determined by the current
	//pixel being painted on the canvase
	//if this node is one of those, just return the correct output inside
	switch(this.type){
		case 'Input_Polar':
			return {
						'theta': this.networkModel.globalInputs.theta,
						'radius': this.networkModel.globalInputs.radius
					}

		case 'Input_Cartesian':
			if(this.attrModel['coordSystem']==0)
				return {
							'x': this.networkModel.globalInputs.cursor_x,
							'y': this.networkModel.globalInputs.cursor_y
						}
			else
				return {
							'x': this.networkModel.globalInputs.canvas_X,
							'y': this.networkModel.globalInputs.canvas_y
						}

		case 'Input_PixelNumber':
			return {
						'number': this.networkModel.globalInputs.tick
					}

		case 'Input_CanvasInfo':
			return {
						'width': this.networkModel.globalInputs.canvasWidth,
						'height': this.networkModel.globalInputs.canvasHeight
					}
	}//swatch

	//if we're not dirty, just retunr our output
	if(this.dirty == this.networkModel.cleanNumber)
		return this.outputs;

	//other wise, the first thing we need to do is build a list of inputs for our model function
	//to do this, we can just loop over our list of inputs and update our attributes model
	//the attributes model is already in the correct format and order for our model function
	//so all we need to do us update any attributes that we have inputs for.
	//any attributes that aren't connected to an input will stay the same as when the model was built
	for(var i=0; i<this.inputs.length; i++){

		//this function will take an input relation ship,
		//ask the distant node for its current output (which will force it to update if it's dirty)
		//then convert it to our input format
		//and finally update the attributes value
		this.updateInput(this.inputs[i]);

	}//next i

	//at this point, our attributes model should be up-to-date and ready to pass to our model
	var output = this.modelFunction(this.attrModel);

	//and our outputs have been calculated for this round!
	//lets save them!
	this.outputs = output;

	//lets also update the dirty number on this node,
	//so any further requests this round re-use the same outputs
	this.dirty = this.networkModel.cleanNumber;

	//finally, we can return our hard work
	return this.outputs;

}//getOutput()


//ask a distant node for its outputs, so we can satisfy an input
clsModelNode.prototype.updateInput = function(inputData){

	//first, let's get the outputs from the distant node
	var distantOutputs = this.networkModel.modelNodes[inputData.farNodeIndex].getOutput();

	//now lets get just the value we care about
	var distantValue = distantOutputs[inputData.farNodeOutputName];

	//now we convert it from the distant output type to our input type
	var value = clsNode.prototype.convertValue(inputData.farNodeOutputType, inputData.inputType, distantValue);

	//now we just need to update our attribute with the new value
	this.attrModel[inputData.inputName] = value;

}//updateInput(inputData)