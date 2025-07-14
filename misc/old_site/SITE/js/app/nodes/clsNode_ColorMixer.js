/*
	
	This class makes a colorpicker node 

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_ColorMixer = function(props){

		//save our type name
		this.typeName = 'ColorMixer';

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
		this.NODE.setTitle('Color &#9658; Mixer');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'Color 1:', 		'CTRLType':'COLOR', 		'input':{'name':'col1', 'type':'color'}, 	'output':{'name':'col1', 	'type':'color'},	'CRTLProps':{'defaultValue':'000000'}		}	);
		this.NODE.addAttribute({'caption':'Color 2:', 		'CTRLType':'COLOR', 		'input':{'name':'col2', 'type':'color'}, 	'output':{'name':'col2', 	'type':'color'},	'CRTLProps':{'defaultValue':'000000'}		}	);
		this.NODE.addAttribute({'caption':'Mix:',			'CTRLType':'FLOAT_SLIDER', 	'input':{'name':'mix', 	'type':'float'}, 	'output':{'name':'mix', 	'type':'float'}		}	);
		this.NODE.addAttribute({'caption':'Output Color', 	'CTRLType':'COLOR', 													'output':{'name':'col3', 	'type':'color'},	'CRTLProps':{'defaultValue':'000000', 'locked':true}	});


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
	clsNode_ColorMixer.prototype.getModelAttrs = function(){

		return {
					'col1': 			this.NODE.getInputVal('col1', 	this.NODE.getCTRL(0)),
					'col2': 			this.NODE.getInputVal('col2', 	this.NODE.getCTRL(1)),
					'mix': 				parseFloat(this.NODE.getInputVal('mix', 	this.NODE.getCTRL(2))),
					'col3': 			this.NODE.getCTRL(3).getValue(),
				};

	}//getModelAttrs()


//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashion
	//so it can be used even if not with an instantiated instance
	clsNode_ColorMixer.prototype.model = function(inputs){

		var RGB1 = colorMath.hexToRGB(inputs.col1);
		var RGB2 = colorMath.hexToRGB(inputs.col2);

		var mix1 = 1.0 - inputs.mix;
		var mix2 = inputs.mix;

		var r = parseInt( (RGB1.r * mix1) + (RGB2.r * mix2) );
		var g = parseInt( (RGB1.g * mix1) + (RGB2.g * mix2) );
		var b = parseInt( (RGB1.b * mix1) + (RGB2.b * mix2) );

		if(r>255) r=255;
		if(r<0)	r=0;
		if(g>255) g=255;
		if(g<0)	g=0;
		if(b>255) b=255;
		if(b<0)	b=0;
		
		var mixedColor = colorMath.RGBToHex(r, g, b);

		//build the list of outputs as defined for the node
		return 	{
					'col1': inputs.col1,
					'col2': inputs.col2,
					'mix': inputs.mix,
					'col3': mixedColor
				}

	}//model(inputs)

	//update the sliders when the picker changes
	clsNode_ColorMixer.prototype.update = function(mode){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = this.getModelAttrs();

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//update output color
		this.NODE.getCTRL(3).setValue( this.NODE.outputs.col3, true);

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
		
	}//update(mode)

	//update the sliders when the picker changes
	clsNode_ColorMixer.prototype.updateFromPicker = function(){
		this.update(0);
	}//updateFromPicker()

	//update the sliders when the picker changes
	clsNode_ColorMixer.prototype.updateFromRGB = function(){
		this.update(1);
	}//updateFromRGB()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_ColorMixer.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_ColorMixer.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_ColorMixer.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Mixer', ['Color'], clsNode_ColorMixer);