/*
	
	This class defines a math-logic node, that will have functions like >, <, ==, !=

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_MathRound = function(props){

		//save our type name
		this.typeName = 'MathRound';
		
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
		this.NODE.setTitle('Math &#9658; Round');

		this.NODE.addAttribute({'caption':'Input Value:',		'CTRLType':'FLOAT_VALUE', 	'input':{'name':'in', 'type':'float'}, 	'output':{'name':'in', 	'type':'float'},	'CRTLProps':{'defaultValue':'0.0'}						}	);
		this.NODE.addAttribute({'caption':'Operation:',			'CTRLType':'DROPBOX', 																							'CRTLProps':{'items':['Round', 'Ceiling', 'Floor']}		}	);
		this.NODE.addAttribute({'caption':'Places:', 			'CTRLType':'INT_VALUE', 											 											'CRTLProps':{'defaultValue':'1', 'domain':'+'}			}	);
		this.NODE.addAttribute({'caption':'Output Value:', 		'CTRLType':'FLOAT_VALUE', 											'output':{'name':'out', 'type':'float'}, 	'CRTLProps':{'locked':true}								}	);

		//if ANY of the nodes change, we need to recalculate the output value... so..
		for(var i=0; i<3; i++)
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
	clsNode_MathRound.prototype.getModelAttrs = function(){
		return {
					'in': 		parseFloat(	this.NODE.getInputVal('in', this.NODE.getCTRL(0)) ),
					'op': 		this.NODE.getCTRL(1).getValue(),
					'places': 	this.NODE.getCTRL(2).getValue()
				};
	}//getModelAttrs()

	



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashion
	//so it can be used even if not with an instantiated instance
	clsNode_MathRound.prototype.model = function(inputs){

		//inputs is always a JSON object with variables that match the name of the inputs defined by the node

		//save the inputs to variables to pass to do the update function
		var Input = 	inputs.in;
		var Op = 		inputs.op;
		var Places = 	inputs.places;

		var output = null;

		//if Places is 0, dont round anything
		if(Places == 0){
			output = Input;
		}else{

			//adjust the input
			if(Places == 1)
				InputAdjusted = Input;
			else
				var InputAdjusted = Input / (Math.pow(10, (Places-1)));


			//based on the function, calculate a new output value
			switch(parseInt(Op)){
				case 0: // regular round
					output = Math.round(InputAdjusted);
					break;
				case 1: // ceiling
					output = Math.ceil(InputAdjusted);
					break;
				case 2: // floor
					output = Math.floor(InputAdjusted);
					break;
			}//swatch function

			//adjust the output
			if(Places > 1)
				output = output * (Math.pow(10, (Places-1)));

		}//end if places


		//build the list of outputs as defined for the node
		return 	{
					'in':Input,
					'out':output
				}

	}//model(inputs)

	//update teh value of this node when any of it's nodes change.
	clsNode_MathRound.prototype.update = function(){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = {
						'in': 		this.NODE.getInputVal('in', this.NODE.getCTRL(0)),
						'op': 		this.NODE.getCTRL(1).getValue(),
						'places': 	this.NODE.getCTRL(2).getValue()
					};

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//set the output value
		this.NODE.getCTRL(3).setValue(this.NODE.outputs.out);
			
		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
		
	}//update()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_MathRound.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_MathRound.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_MathRound.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Round', ['Math'], clsNode_MathRound);