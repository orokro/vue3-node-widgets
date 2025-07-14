/*
	
	This class makes a colorpicker node 

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_Texture_Checker = function(props){

		//save our type name
		this.typeName = 'Texture_Checker';
		
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
		this.NODE = new clsNode(props.newID, ((typeof props.x === "undefined") ? 100 : props.x), ((typeof props.y === "undefined") ? 100 : props.y), ((typeof props.w === "undefined") ? 140 : props.w), ((typeof props.h === "undefined") ? 100 : props.h));

		//tell the node about us
		this.NODE.super = me;
		
		//give our node the proper title
		this.NODE.setTitle('Texture &#9658; Checker');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'Checker Width:', 	'CTRLType':'FLOAT_VALUE', 	'input':{'name':'w', 		'type':'float'}, 	'output':{'name':'w', 		'type':'float'},	'CRTLProps':{'defaultValue':'10', 'domain':'+'}		});
		this.NODE.addAttribute({'caption':'Checker Height:', 	'CTRLType':'FLOAT_VALUE', 	'input':{'name':'h', 		'type':'float'}, 	'output':{'name':'h', 		'type':'float'},	'CRTLProps':{'defaultValue':'10', 'domain':'+'}		});
		this.NODE.addAttribute({'caption':'Color 1', 			'CTRLType':'COLOR', 		'input':{'name':'col1', 	'type':'color'}, 	'output':{'name':'col1', 	'type':'color'},	'CRTLProps':{'defaultValue':'000000'}				});
		this.NODE.addAttribute({'caption':'Color 2', 			'CTRLType':'COLOR', 		'input':{'name':'col2', 	'type':'color'}, 	'output':{'name':'col2', 	'type':'color'},	'CRTLProps':{'defaultValue':'FFFFFF'}				});
		this.NODE.addAttribute({'caption':'Sample X:', 			'CTRLType':'INT_VALUE', 	'input':{'name':'x', 		'type':'int'}, 		'output':{'name':'x', 		'type':'int'},		'CRTLProps':{'defaultValue':'0', 'domain':'+-'}		});
		this.NODE.addAttribute({'caption':'Sample Y:', 			'CTRLType':'INT_VALUE', 	'input':{'name':'y', 		'type':'int'}, 		'output':{'name':'y', 		'type':'int'},		'CRTLProps':{'defaultValue':'0', 'domain':'+-'}		});
		this.NODE.addAttribute({'caption':'Output Color', 		'CTRLType':'COLOR', 														'output':{'name':'col3', 	'type':'color'},	'CRTLProps':{'defaultValue':'000000', 'locked':true }	});

		//if ANY of the nodes change, we need to recalculate the output value... so..
		for(var i=0; i<6; i++)
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
	clsNode_Texture_Checker.prototype.getModelAttrs = function(){

		return {
					'w': 				this.NODE.getInputVal('w', 		this.NODE.getCTRL(0)),
					'h': 				this.NODE.getInputVal('h', 		this.NODE.getCTRL(1)),
					'col1': 			this.NODE.getInputVal('col1', 	this.NODE.getCTRL(2)),
					'col2': 			this.NODE.getInputVal('col2', 	this.NODE.getCTRL(3)),
					'x': 				this.NODE.getInputVal('x', 		this.NODE.getCTRL(4)),
					'y': 				this.NODE.getInputVal('y', 		this.NODE.getCTRL(5))
				};
	}//getModelAttrs()

	



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashing
	//so it can be used even if not with an instantiated instance
	clsNode_Texture_Checker.prototype.model = function(inputs){

		//get the width and height
		var w = inputs.w;
		var h = inputs.h;

		//get the x and y position
		var x = inputs.x - ((inputs.x<0) ? w : 0) ; 
		var y = inputs.y - ((inputs.y<0) ? h : 0) ;

		x = Math.abs(x);
		y = Math.abs(y);

		//calcuate if it should be black or white
		var white=true;
		
		/*if((parseInt(x/w) % 2) == 0 && (parseInt(y/h)%2==0) || (parseInt(x/w) % 2) == 1 && (parseInt(y/h)%2==1))
			white=false;*/

		var localX = x % (w*2);
		var localY = y % (h*2);

		if( (localX < w && localY < h) || (localX > w && localY > h) )
			white=false;

		//pick the color to output
		var color3 = white ? inputs.col1 : inputs.col2;

		//build the list of outputs as defined for the node
		return {
					'w': 				inputs.w,
					'h': 				inputs.h,
					'col1': 			inputs.col1,
					'col2': 			inputs.col2,
					'x': 				inputs.x,
					'y': 				inputs.y,
					'col3': 			color3
				};

	}//model(inputs)

	//update teh value of this node when any of it's nodes change.
	clsNode_Texture_Checker.prototype.update = function(){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = this.getModelAttrs();

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//update the color three control
		this.NODE.getCTRL(6).setValue( this.NODE.outputs.col3, true);

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
			
	}//update()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_Texture_Checker.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_Texture_Checker.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_Texture_Checker.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Checker', ['Texture'], clsNode_Texture_Checker);