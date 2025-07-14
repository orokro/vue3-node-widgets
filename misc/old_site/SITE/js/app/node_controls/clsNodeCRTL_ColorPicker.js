/*
	
	This class defines the logic for a color picker node control
 
*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNodeCRTL_ColorPicker = function(parent, props){

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
		this.mvarVal = (typeof props.defaultValue === "undefined") ? 'FFFFFF' : props.defaultValue;
		
		//is this control locked for editing?
		this.mvarEditLock = (typeof props.locked === "undefined") ? false : props.locked;

		//save the parent element node
		this.parentNode = parent;

		//the color picker object for this color picker
		this.mvarPicker = null;

		

	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//build the HTML elements needed for this color picker:
		$(parent).append('<input class="NC_colorPicker">');

		//save reference to the this controls primary DOM element
		this.mvarDOM = $(parent).find('.NC_colorPicker');

		//set up the jscolor color picker object. Thanks jscolor!
		this.mvarPicker = new jscolor.color($(parent).find('.NC_colorPicker').get()[0], {pickerMode:'HVS', pickerFaceColor:'#464A5A', pickerBorderColor:'black', pickerInsetColor:'black'});
		this.mvarPicker.fromString(this.mvarVal);

		//add a method to check when the color picker's value has changed. Use it to update our own value, and raise the event
		$(parent).find('.NC_colorPicker').change(function(){ me.mvarVal = $(this).val(); me.raiseEvent.change(me); });

		//add some code to prevent color picking when the control is locked
		this.mvarDOM.mousedown(function(event){ if(me.mvarEditLock) event.preventDefault();} );

		//if this control is locked, properly lock it now
		if(this.mvarEditLock) this.setLocked(true);

	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS



}//clsNodeCRTL_ColorPicker



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
	
	//get the current value
	clsNodeCRTL_ColorPicker.prototype.getValue = function(){ return this.mvarVal; };



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
	
	//allow the value to be set
	clsNodeCRTL_ColorPicker.prototype.setValue = function(val, nofire){
		
		//save the new value
		this.mvarVal = val;

		//update the picker
		this.mvarPicker.fromString(this.mvarVal);

		//call the change function
		nofire = (typeof nofire === 'undefined') ? false : nofire;
		if(!nofire)
			me.raiseEvent.change(me);

	}//setValue(val)

	//set the control locked or unlocked
	clsNodeCRTL_ColorPicker.prototype.setLocked = function(bool){

		//update our member variable
		this.mvarEditLock = bool;

		//if we're locked, we need to add some locked CSS
		if(this.mvarEditLock)
			this.mvarDOM.addClass('locked');
		else
			this.mvarDOM.removeClass('locked');

	}//setLocked(bool)



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNodeCRTL_ColorPicker.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNodeCRTL_ColorPicker.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNodeCRTL_ColorPicker.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;
	}//onChange(callBackFunction)