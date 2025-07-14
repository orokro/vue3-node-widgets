/*
	
	This class makes a colorpicker node 

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_ColorPicker = function(props){

		//save our type name
		this.typeName = 'ColorPicker';

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
		this.NODE.setTitle('Color &#9658; Picker');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'Select a color:', 	'CTRLType':'COLOR', 		'input':{'name':'col', 	'type':'color'}, 	'output':{'name':'col', 	'type':'color'},	'CRTLProps':{'defaultValue':this.val}		}	);
		this.NODE.addAttribute({'caption':'Red:',				'CTRLType':'FLOAT_SLIDER', 	'input':{'name':'r', 	'type':'float'}, 	'output':{'name':'r', 		'type':'red'}		}	);
		this.NODE.addAttribute({'caption':'Green:', 			'CTRLType':'FLOAT_SLIDER', 	'input':{'name':'g', 	'type':'float'}, 	'output':{'name':'g', 		'type':'green'}		}	);
		this.NODE.addAttribute({'caption':'Blue:', 				'CTRLType':'FLOAT_SLIDER', 	'input':{'name':'b', 	'type':'float'}, 	'output':{'name':'b', 		'type':'blue'}		}	);

		//we should add some event hooks for for the color picker and so things will update nicely when one or the other changes
		//when the picker changes, update the RGB sliders
		this.NODE.getCTRL(0).onChange(function(val){ me.updateFromPicker(val); });
		
		//when any of the RGB sliders change, update the PICKER
		this.NODE.getCTRL(1).onChange(function(val){ me.updateFromRGB(val); });
		this.NODE.getCTRL(2).onChange(function(val){ me.updateFromRGB(val); });
		this.NODE.getCTRL(3).onChange(function(val){ me.updateFromRGB(val); });

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
	clsNode_ColorPicker.prototype.getModelAttrs = function(){
		var mode = 0;

		//if we have a wire attached to the 'col' input, make sure the mode is 0
		if(this.NODE.checkInputConnection('col'))
			mode = 0;

		//otherwies, if we have wires on r, g, or b then mode is 1
		else if(	this.NODE.checkInputConnection('r')
					||
					this.NODE.checkInputConnection('g')
					||
					this.NODE.checkInputConnection('b')
				)
			mode = 1;

		//otherwise default is 0
		else
			mode = 0;

		return {
					'col': 				this.NODE.getInputVal('col', 	this.NODE.getCTRL(0)),
					'r': 	parseFloat(	this.NODE.getInputVal('r', 		this.NODE.getCTRL(1))	),
					'g': 	parseFloat(	this.NODE.getInputVal('g', 		this.NODE.getCTRL(2))	),
					'b': 	parseFloat(	this.NODE.getInputVal('b', 		this.NODE.getCTRL(3))	),
					'mode': mode
				};

	}//getModelAttrs()


//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashion
	//so it can be used even if not with an instantiated instance
	clsNode_ColorPicker.prototype.model = function(inputs){

		//inputs is always a JSON object with variables that match the name of the inputs defined by the node

		//save the inputs to variables to pass to do the update function
		var col = 	inputs.col;
		var r =		parseFloat(inputs.r);
		var g = 	parseFloat(inputs.g);
		var b = 	parseFloat(inputs.b);
		var mode = 	inputs.mode;

		//default mode is HEX to RGB
		if(mode==0){

			//get RGB values from the hex
			var RGB = colorMath.hexToRGB(col);

			r = (RGB.r/255);
			g = (RGB.g/255);
			b = (RGB.b/255);

		//the other mode is from RGB to hex
		}else{

			//convert r, g and b to integers betwen 0 and 255
			var R = parseInt(r * 255);
			var G = parseInt(g * 255);
			var B = parseInt(b * 255);

			//use "magic" to get the hex string from the RGB values
			var HEX = ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);

			//save the new color
			col = HEX;

		}

		//build the list of outputs as defined for the node
		return 	{
					'col':col,
					'r':r,
					'g':g,
					'b':b
				}

	}//model(inputs)

	//update the sliders when the picker changes
	clsNode_ColorPicker.prototype.update = function(mode){

		//temporary fix - if mode is undefined, the default mode is 0
		if(typeof mode === 'undefined'){

			//if we have a wire attached to the 'col' input, make sure the mode is 0
			if(this.NODE.checkInputConnection('col'))
				mode = 0;

			//otherwies, if we have wires on r, g, or b then mode is 1
			else if(	this.NODE.checkInputConnection('r')
						||
						this.NODE.checkInputConnection('g')
						||
						this.NODE.checkInputConnection('b')
					)
				mode = 1;

			//otherwise default is 0
			else
				mode = 0;
		}

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = {
						'col': 	this.NODE.getInputVal('col', 	this.NODE.getCTRL(0)),
						'r': 	this.NODE.getInputVal('r', 		this.NODE.getCTRL(1)),
						'g': 	this.NODE.getInputVal('g', 		this.NODE.getCTRL(2)),
						'b': 	this.NODE.getInputVal('b', 		this.NODE.getCTRL(3)),
						'mode': mode
					};

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//update the color picker
		this.NODE.getCTRL(0).setValue( this.NODE.outputs.col, true);

		//update each slider
		this.NODE.getCTRL(1).setValue( this.NODE.outputs.r, true);
		this.NODE.getCTRL(2).setValue( this.NODE.outputs.g, true);
		this.NODE.getCTRL(3).setValue( this.NODE.outputs.b, true);

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
		
	}//update(mode)

	//update the sliders when the picker changes
	clsNode_ColorPicker.prototype.updateFromPicker = function(){
		this.update(0);
	}//updateFromPicker()

	//update the sliders when the picker changes
	clsNode_ColorPicker.prototype.updateFromRGB = function(){
		this.update(1);
	}//updateFromRGB()

	//this method allows a hex color code to be converted into RGB
	clsNode_ColorPicker.prototype.hexToRgb = function(hex) {

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;

	}//hexToRgb(hex)



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_ColorPicker.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_ColorPicker.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_ColorPicker.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Picker', ['Color'], clsNode_ColorPicker);