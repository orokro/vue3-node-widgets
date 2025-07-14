/*
	
	This class makes a paint bucket output node

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_OutputPaintBucket = function(props){

		//save our type name
		this.typeName = 'OutputPaintBucket';
		
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
		this.NODE = new clsNode(props.newID, ((typeof props.x === "undefined") ? 100 : props.x), ((typeof props.y === "undefined") ? 100 : props.y), ((typeof props.w === "undefined") ? 100 : props.w), ((typeof props.h === "undefined") ? 100 : props.h));

		//tell the node about us
		this.NODE.super = me;

		//give our node the proper title
		this.NODE.setTitle('Output Node');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'Output', 	'def':'Paint Bucket Colorization Rule', 'CRTLType':'HTML', 			'input':{'name':'col',			'type':'color'}, 	'CRTLProps':{'defaultValue':'Paint Bucket Colorization Rule'} });
		this.NODE.addAttribute({'caption':'Tolerance:',											'CTRLType':'FLOAT_SLIDER', 	'input':{'name':'tolerance', 	'type':'float'}, 	'CRTLProps':{'defaultValue':'0.01'}		}	);

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
	clsNode_OutputPaintBucket.prototype.getModelAttrs = function(){
		return {
				'col':this.NODE.getInputVal('col', null)
				};

	}//getModelAttrs()

	



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	clsNode_OutputPaintBucket.prototype.model = function(inputs){
		return {
					'col': inputs.col
				 }//this.NODE.getInputVal('col', null)
	}

	clsNode_OutputPaintBucket.prototype.update = function(){
		
		//show update toast in title bar of node!
		this.NODE.showUpdate();

	}


//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_OutputPaintBucket.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_OutputPaintBucket.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_OutputPaintBucket.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
		
	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Paint Bucket', ['Output'], clsNode_OutputPaintBucket);