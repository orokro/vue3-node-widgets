/*
	
	This class defines a math-random integer node.

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_Math_RandomInt = function(props){

		//save our type name
		this.typeName = 'RandomInt';
		
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution
		var me = this;

		//reference to our controls primary DOM element
		this.mvarDOM = null;

		//properties may have been omitted
		props = (typeof props === "undefined") ? {} : props;
		props = (props === null) ? {} : props;

		//get the default value optional parameter
		this.val = (typeof props.defaultValue === "undefined") ? 0.0 : props.defaultValue;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
		
		//create a new node object as a blank slate
		this.NODE = new clsNode(props.newID, ((typeof props.x === "undefined") ? 100 : props.x), ((typeof props.y === "undefined") ? 100 : props.y), ((typeof props.w === "undefined") ? 140 : props.w), ((typeof props.h === "undefined") ? 100 : props.h));

		//tell the node about us
		this.NODE.super = me;
		
		//give our node the proper title
		this.NODE.setTitle('Rnd &#9658; Integer');

		this.NODE.addAttribute({'caption':'Lower Bound:',		'CTRLType':'INT_VALUE', 	'input':{'name':'low', 'type':'int'}, 	'output':{'name':'low', 	'type':'int'},		'CRTLProps':{'defaultValue':'0'}		}	);
		this.NODE.addAttribute({'caption':'Upper Bound:',		'CTRLType':'INT_VALUE', 	'input':{'name':'high', 'type':'int'}, 	'output':{'name':'high', 	'type':'int'},		'CRTLProps':{'defaultValue':'10'}		}	);
		this.NODE.addAttribute({'caption':'Output Value:', 		'CTRLType':'INT_VALUE', 											'output':{'name':'out', 	'type':'int'}, 		'CRTLProps':{'locked':true}				}	);

		//if ANY of the nodes change, we need to recalculate the output value... so..
		for(var i=0; i<2; i++)
			this.NODE.getCTRL(i).onChange(function(val){ me.update(); });

		//update it once on creation, so it's output values are gauranteed to be calculated by the model at least once
		this.update();



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
}



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS

	//return the current state-of-attrs
	clsNode_Math_RandomInt.prototype.getModelAttrs = function(){
		return {
					'low': 		this.NODE.getInputVal('low', 	this.NODE.getCTRL(0)),
					'high': 	this.NODE.getInputVal('high', 	this.NODE.getCTRL(1))
				};
	}//getModelAttrs()

	



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashion
	//so it can be used even if not with an instantiated instance
	clsNode_Math_RandomInt.prototype.model = function(inputs){

		//inputs is always a JSON object with variables that match the name of the inputs defined by the node

		//save the inputs to variables to pass to do the update function
		var low = 	inputs.low;
		var high =	inputs.high;

		//calculate a random number in the range
		var output = Math.floor(Math.random() * (high - low + 1)) + low;

		//build the list of outputs as defined for the node
		return 	{
					'low':low,
					'high':high,
					'out':output
				}

	}//model(inputs)

	//update teh value of this node when any of it's nodes change.
	clsNode_Math_RandomInt.prototype.update = function(){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = {
						'low': 		this.NODE.getInputVal('low', 	this.NODE.getCTRL(0)),
						'high': 	this.NODE.getInputVal('high', 	this.NODE.getCTRL(1))
					};

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//set the output value
		this.NODE.getCTRL(2).setValue(this.NODE.outputs.out);
			
		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
		
	}//update()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_Math_RandomInt.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_Math_RandomInt.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_Math_RandomInt.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Random Integer', ['Random'], clsNode_Math_RandomInt);