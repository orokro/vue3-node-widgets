/*
	
	This class makes a colorpicker node 

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_Math_Expression = function(props){

		//save our type name
		this.typeName = 'Math_Expression';
		
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
		this.val = (typeof props.defaultValue === "undefined") ? 0.0 : props.defaultValue;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//create a new node object as a blank slate
		this.NODE = new clsNode(props.newID, ((typeof props.x === "undefined") ? 100 : props.x), ((typeof props.y === "undefined") ? 100 : props.y), ((typeof props.w === "undefined") ? 160 : props.w), ((typeof props.h === "undefined") ? 100 : props.h));

		//tell the node about us
		this.NODE.super = me;
		
		//give our node the proper title
		this.NODE.setTitle('Math &#9658; Expression');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'F(x, y, z) = ', 		'CTRLType':'TEXT_BOX',    																						'CRTLProps':{'defaultValue':'x+y+z'} 	});
		this.NODE.addAttribute({'caption':'x:', 				'CTRLType':'FLOAT_VALUE', 	'input':{'name':'x', 'type':'float'}, 	'output':{'name':'x', 	'type':'float'},	'CRTLProps':{'defaultValue':'0'}		});
		this.NODE.addAttribute({'caption':'y:', 				'CTRLType':'FLOAT_VALUE', 	'input':{'name':'y', 'type':'float'}, 	'output':{'name':'y', 	'type':'float'},	'CRTLProps':{'defaultValue':'0'}		});
		this.NODE.addAttribute({'caption':'z:', 				'CTRLType':'FLOAT_VALUE', 	'input':{'name':'z', 'type':'float'}, 	'output':{'name':'z', 	'type':'float'},	'CRTLProps':{'defaultValue':'0'}		});
		this.NODE.addAttribute({'caption':'f:', 				'CTRLType':'FLOAT_VALUE', 											'output':{'name':'f', 	'type':'float'},	'CRTLProps':{'defaultValue':'0', 'locked':true}		});

		//if ANY of the nodes change, we need to recalculate the output value... so..
		for(var i=0; i<4; i++)
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
	clsNode_Math_Expression.prototype.getModelAttrs = function(){

		return {
					'expression': 	this.NODE.getCTRL(0).getValue(),
					'x': 			this.NODE.getInputVal('x', 	this.NODE.getCTRL(1)),
					'y': 			this.NODE.getInputVal('y', 	this.NODE.getCTRL(2)),
					'z': 			this.NODE.getInputVal('z', 	this.NODE.getCTRL(3))
				};
	}//getModelAttrs()

	



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashing
	//so it can be used even if not with an instantiated instance
	clsNode_Math_Expression.prototype.model = function(inputs){

		//build a string that represents the statement to be executed
		//we will just use javascript's eval to evaluate the expression
		//not safe. deal with it 8)
		var jsExpression = 'x=' + inputs.x + '; y=' + inputs.y + '; z=' + inputs.z + '; ' + inputs.expression + ';';

		var fValue;

		//evalaute the expression. if tehre's errors, just say it evaluated to 0
		try{ 
			fValue = eval(jsExpression); 
		}catch(e){ 
			fValue = 0;
		}
		
		//build the list of outputs as defined for the node
		return {
					'expression': 		inputs.expression,
					'x': 				inputs.x,
					'y': 				inputs.y,
					'z': 				inputs.z,
					'f': 				fValue
				};

	}//model(inputs)

	//update teh value of this node when any of it's nodes change.
	clsNode_Math_Expression.prototype.update = function(){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = this.getModelAttrs();

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//update the color three control
		this.NODE.getCTRL(4).setValue( this.NODE.outputs.f, true);

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
			
	}//update()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_Math_Expression.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_Math_Expression.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_Math_Expression.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('F Expression', ['Math'], clsNode_Math_Expression);