/*
	
	This class makes a colorpicker node 

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_ValueMixer = function(props){

		//save our type name
		this.typeName = 'ValueMixer';

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution
		var me = this;

		//refernce to our NODE object
		this.NODE = null;

		//properties may have been omitted
		props = (typeof props === "undefined") ? {} : props;
		props = (props === null) ? {} : props;

		//get the default value optional parameter
		this.val = (typeof props.defaultValue === "undefined") ? '7A5BCF' : props.defaultValue;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//create a new node object as a blank slate
		this.NODE = new clsNode(props.newID, ((typeof props.x === "undefined") ? 100 : props.x), ((typeof props.y === "undefined") ? 100 : props.y), ((typeof props.w === "undefined") ? 120 : props.w), ((typeof props.h === "undefined") ? 100 : props.h));

		//tell the node about us
		this.NODE.super = me;
		
		//give our node the proper title
		this.NODE.setTitle('Math &#9658; Value Mixer');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'Value 1:', 		'CTRLType':'FLOAT_VALUE', 	'input':{'name':'val1', 'type':'float'}, 	'output':{'name':'val1', 	'type':'float'},	}	);
		this.NODE.addAttribute({'caption':'Value 2:', 		'CTRLType':'FLOAT_VALUE', 	'input':{'name':'val2', 'type':'float'}, 	'output':{'name':'val2', 	'type':'float'},	}	);
		this.NODE.addAttribute({'caption':'Mix:',			'CTRLType':'FLOAT_SLIDER', 	'input':{'name':'mix', 	'type':'float'}, 	'output':{'name':'mix', 	'type':'float'}		}	);
		this.NODE.addAttribute({'caption':'Mixed Value', 	'CTRLType':'FLOAT_VALUE', 												'output':{'name':'val3', 	'type':'float'},	'CRTLProps':{'locked':true}	});


		///if ANY of the nodes change, we need to recalculate the output value... so..
		for(var i=0; i<3; i++)
			this.NODE.getCTRL(i).onChange(function(val){ me.update(); });

		//update it once on creation, so it's output values are gauranteed to be calculated by the model at least once
		this.update(0);



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
}



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
	
	//return the current state-of-attrs
	clsNode_ValueMixer.prototype.getModelAttrs = function(){

		return {
					'val1': 			this.NODE.getInputVal('val1', 	this.NODE.getCTRL(0)),
					'val2': 			this.NODE.getInputVal('val2', 	this.NODE.getCTRL(1)),
					'mix': 				parseFloat(this.NODE.getInputVal('mix', 	this.NODE.getCTRL(2))),
					'val3': 			this.NODE.getCTRL(3).getValue(),
				};

	}//getModelAttrs()


//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashion
	//so it can be used even if not with an instantiated instance
	clsNode_ValueMixer.prototype.model = function(inputs){

		
		
		var mixedValue = inputs.val1 + ((inputs.val2 - inputs.val1)*inputs.mix);

		//build the list of outputs as defined for the node
		return 	{
					'val1': inputs.val1,
					'val2': inputs.val2,
					'mix': inputs.mix,
					'val3': mixedValue
				}

	}//model(inputs)

	//update the sliders when the picker changes
	clsNode_ValueMixer.prototype.update = function(mode){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = this.getModelAttrs();

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//update output color
		this.NODE.getCTRL(3).setValue( this.NODE.outputs.val3, true);

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
		
	}//update(mode)

	//update the sliders when the picker changes
	clsNode_ValueMixer.prototype.updateFromPicker = function(){
		this.update(0);
	}//updateFromPicker()

	//update the sliders when the picker changes
	clsNode_ValueMixer.prototype.updateFromRGB = function(){
		this.update(1);
	}//updateFromRGB()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_ValueMixer.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_ValueMixer.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_ValueMixer.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Value Mixer', ['Math'], clsNode_ValueMixer);