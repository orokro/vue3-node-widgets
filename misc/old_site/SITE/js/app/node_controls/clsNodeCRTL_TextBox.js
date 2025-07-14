/*
	
	This class defines the logic for a text input.
	
	Note that, we currently don't support text as an input or output type,
	so text box controls are strictly for calculating values or giving inputs names or whatever.
 
*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNodeCRTL_TextBox = function(parent, props){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution
		var me = this;

		//save the parent element node
		this.parentNode = parent;

		//reference to our controls primary DOM element
		this.mvarDOM = null;

		//properties may have been omitted
		props = (typeof props === "undefined") ? {} : props;
		props = (props === null) ? {} : props;

		//get the default value optional parameter
		this.mvarVal = (typeof props.defaultValue === "undefined") ? '' : props.defaultValue;

		//is this control locked for editing?
		this.mvarEditLock = (typeof props.locked === "undefined") ? false : props.locked;


	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add the html for a value slider
		$(parent).append('<div class="NC_textBox"><input type="text" value="' + this.mvarVal + '"/></div>');

		//save reference to the this controls primary DOM element
		this.mvarDOM = $(parent).find('.NC_textBox');

		//get reference specially to the text boc
		this.mvarInput = this.mvarDOM.find('input');

		//bind input events specifically for this control:
		this.mvarInput.keydown( function(event){ if(event.keyCode==13) me.raiseEvent.change(me);} );
		this.mvarInput.blur( 	function(event){ me.raiseEvent.change(me);} );

		//properly set the value
		this.setValue(this.mvarVal, true);

		//if this control is locked, properly lock it now
		if(this.mvarEditLock) this.setLocked(true);



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS



}//clsNodeCRTL_TextBox



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
	
	//get the current value
	clsNodeCRTL_TextBox.prototype.getValue = function(){ return this.mvarInput.val(); };



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
	
	//set the value of the slider
	clsNodeCRTL_TextBox.prototype.setValue = function(val, nofire){

		//set the value of the text vox
		this.mvarInput.val(val);

		//call the change function
		nofire = (typeof nofire === 'undefined') ? false : nofire;
		if(!nofire)
			me.raiseEvent.change(me);

	}//setValue(val)

	//set the control locked or unlocked
	clsNodeCRTL_TextBox.prototype.setLocked = function(bool){

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
	clsNodeCRTL_TextBox.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNodeCRTL_TextBox.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarInput.val());

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNodeCRTL_TextBox.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)