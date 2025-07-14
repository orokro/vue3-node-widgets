/*
	
	This class defines a math-trig node, that will ahve functions like sin, cos, etc

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_MathTrig = function(props){

		//save our type name
		this.typeName = 'MathTrig';
		
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
		this.NODE.setTitle('Math &#9658; Trig');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'Trig Function:',	'CTRLType':'DROPBOX', 																												'CRTLProps':{'items':['Sine','Cosine','Tangent','Arc Sine', 'Arc Cosine', 'Arc Tangent']}	}	);
		this.NODE.addAttribute({ 							'CTRLType':'CHECKBOX', 																												'CRTLProps':{'caption':'Degrees'}		}	);
		this.NODE.addAttribute({'caption':'THETA:', 		'CTRLType':'FLOAT_VALUE', 	'input':{'name':'theta', 		'type':'float'}, 	'output':{'name':'theta', 		'type':'float'},	'CRTLProps':{'defaultValue':'0.0'}		}	);
		this.NODE.addAttribute({'caption':'Amplitude:',		'CTRLType':'FLOAT_VALUE', 	'input':{'name':'amplitude',	'type':'float'}, 	'output':{'name':'amplitude', 	'type':'float'},	'CRTLProps':{'defaultValue':'1.0'}		}	);
		this.NODE.addAttribute({'caption':'Wavelength:', 	'CTRLType':'FLOAT_VALUE', 	'input':{'name':'wavelength', 	'type':'float'}, 	'output':{'name':'wavelength', 	'type':'float'},	'CRTLProps':{'defaultValue':'1.0'}		}	);
		this.NODE.addAttribute({'caption':'Output Value:', 	'CTRLType':'FLOAT_VALUE', 														'output':{'name':'out', 		'type':'float'}, 	'CRTLProps':{'locked':true}				}	);

		//if ANY of the nodes change, we need to recalculate the output value... so..
		for(var i=0; i<5; i++)
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
	clsNode_MathTrig.prototype.getModelAttrs = function(){

		return {
					'trigFunction': this.NODE.getCTRL(0).getValue(),
					'degrees': 		this.NODE.getCTRL(1).getValue(),
					'theta': 		parseFloat(	this.NODE.getInputVal('theta', 		this.NODE.getCTRL(2)) ),
					'amplitude': 	parseFloat(	this.NODE.getInputVal('amplitude', 	this.NODE.getCTRL(3)) ),
					'wavelength': 	parseFloat(	this.NODE.getInputVal('wavelength', this.NODE.getCTRL(4)) )
				};

	}//getModelAttrs()

	



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashing
	//so it can be used even if not with an instantiated instance
	clsNode_MathTrig.prototype.model = function(inputs){

		//inputs is always a JSON object with variables that match the name of the inputs defined by the node

		//save the inputs to variables to pass to do the update function
		var trigFunction = 	inputs.trigFunction;
		var degrees = 		inputs.degrees;
		var theta = 		inputs.theta;
		var amplitude = 	inputs.amplitude;
		var wavelength = 	inputs.wavelength;

		//convert degrees into a multiplier if it's true
		degrees = (degrees) ? (3.14159265359 / 180) : 1;

		var output = null;

		//based on the function, calculate a new output value
		switch(parseInt(trigFunction)){
			case 0:
				output = Math.sin(theta * (1 / wavelength) * degrees) * amplitude;
				break;
			case 1:
				output = Math.cos(theta * (1 / wavelength) * degrees) * amplitude;
				break;
			case 2:
				output = Math.tan(theta * (1 / wavelength) * degrees) * amplitude;
				break;
			case 3:
				output = Math.asin(theta * (1 / wavelength) * degrees) * amplitude;
				break;
			case 4:
				output = Math.acos(theta * (1 / wavelength) * degrees) * amplitude;
				break;
			case 5:
				output = Math.atan(theta * (1 / wavelength) * degrees) * amplitude;
				break;
		}//swatch function

		//build the list of outputs as defined for the node
		return 	{
					'theta':theta,
					'amplitude':amplitude,
					'wavelength':wavelength,
					'out':output
				}

	}//model(inputs)

	//update teh value of this node when any of it's nodes change.
	clsNode_MathTrig.prototype.update = function(){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = {
						'trigFunction': this.NODE.getCTRL(0).getValue(),
						'degrees': 		this.NODE.getCTRL(1).getValue(),
						'theta': 		this.NODE.getInputVal('theta', 		this.NODE.getCTRL(2)),
						'amplitude': 	this.NODE.getInputVal('amplitude', 	this.NODE.getCTRL(3)),
						'wavelength': 	this.NODE.getInputVal('wavelength', this.NODE.getCTRL(4))
					};

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//set the output value
		this.NODE.getCTRL(5).setValue(this.NODE.outputs.out);

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
			
	}//update()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_MathTrig.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_MathTrig.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_MathTrig.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Trig', ['Math'], clsNode_MathTrig);