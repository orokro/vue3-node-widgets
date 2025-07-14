/*
	
	This class defines a checkbox control

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNodeCRTL_CheckBox = function(parent, props){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution
		var me = this;
		
		//save the parent element node
		this.parentNode = parent;

		//reference to our controls primary DOM element
		this.mvarDOM = null;

		//is this control locked for editing?
		this.mvarEditLock = false;

		//properties may have been omitted
		props = (typeof props === "undefined") ? {} : props;
		props = (props === null) ? {} : props;

		//is this control locked for editing?
		this.mvarEditLock = (typeof props.locked === "undefined") ? false : props.locked;

		//get the default value optional parameter
		this.mvarVal = (typeof props.defaultValue === "undefined") ? false : props.defaultValue;

		//see if a caption was passed
		this.mvarChkCaption = (typeof props.caption === "undefined") ? '' : props.caption;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add the html for a value slider
		$(parent).append('<label class="NC_CheckBox"><input type="checkbox"><span></span></label>');

		//save reference to the this controls primary DOM element
		this.mvarDOM = $(parent).find('.NC_CheckBox');

		//properly set the value
		this.setValue(this.mvarVal, true);

		//properly set the caption
		this.setCaption(this.mvarChkCaption);

		//if this control is locked, properly lock it now
		if(this.mvarEditLock) this.setLocked(true);

		//find and event for when the select box changes
		this.mvarDOM.find('input').change(function(){ me.mvarVal = ($(this).attr('checked') == 'checked') ? true : false; me.raiseEvent.change(me); });



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
}



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS

	//get the current value
	clsNodeCRTL_CheckBox.prototype.getValue = function(){ return this.mvarVal; };
	clsNodeCRTL_CheckBox.prototype.getCaption = function(){ return this.mvarChkCaption; };



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
	
	//set the value of this control
	clsNodeCRTL_CheckBox.prototype.setValue = function(val, nofire){

		//set the value
		this.mvarVal = val;
		this.mvarDOM.find('input').attr('checked', val);

		//call the change function
		nofire = (typeof nofire === 'undefined') ? false : nofire;
		if(!nofire)
			me.raiseEvent.change(me);

	}//setValue(val)

	//set the caption of the control
	clsNodeCRTL_CheckBox.prototype.setCaption = function(cap){

		//set the value
		this.mvarChkCaption = cap;
		this.mvarDOM.find('span').html(this.mvarChkCaption);

	}//setCaption(cap)

	//set the control locked or unlocked
	clsNodeCRTL_CheckBox.prototype.setLocked = function(bool){

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
	clsNodeCRTL_CheckBox.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNodeCRTL_CheckBox.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNodeCRTL_CheckBox.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)