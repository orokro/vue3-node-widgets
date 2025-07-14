/*
	
	This class defines the logic for a float value control.

	Unlike sliders, value controls do not have minimum or maximums.

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNodeCRTL_FloatValue = function(parent, props){

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

		//was a domain specified?
		this.mvarDomain = (typeof props.domain === "undefined") ? '-+' : props.domain;

		//get the default value optional parameter
		this.mvarVal = (typeof props.defaultValue === "undefined") ? 0.0 : props.defaultValue;

		//is this control locked for editing?
		this.mvarEditLock = (typeof props.locked === "undefined") ? false : props.locked;

		//this boolean represents the state of the controls edit mode
		this.mvarEditMode = false;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add the html for a value slider
		$(parent).append('<div class="NC_floatValue"><span>' + this.formatValue() + '</span><input type="text"/></div>');

		//save reference to the this controls primary DOM element
		this.mvarDOM = $(parent).find('.NC_floatValue');

		//bind input events specifically for this control:
		this.mvarDOM.dblclick(function(event){  if(!this.mvarEditMode)  me.doEditMode(event);} );
		this.mvarDOM.find('input').keydown( function(event){ if(event.keyCode==13) me.endEditMode(event);} );
		this.mvarDOM.find('input').blur( function(event){me.endEditMode(event);} );

		this.mvarDOM.mousedown( function(event){  if(!this.mvarEditMode) me.startValueDrag(event);} );

		//properly set the value
		this.setValue(this.mvarVal, true);

		//if this control is locked, properly lock it now
		if(this.mvarEditLock) this.setLocked(true);



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS



}//clsNodeCRTL_FloatValue



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
	
	//get the current value
	clsNodeCRTL_FloatValue.prototype.getValue = function(){ return this.mvarVal; };
	clsNodeCRTL_FloatValue.prototype.getDomain = function(){ return this.mvarDomain; };
	


//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
	
	//set the value of the slider
	clsNodeCRTL_FloatValue.prototype.setValue = function(val, nofire){

		//parse the value from the string
		newVal = parseFloat(val);

		//limit it to our domain
		if(this.mvarDomain != '-+'){
			if(this.mvarDomain == '-' && newVal>0.0)
				newVal = -0.0;
			if(this.mvarDomain == '+' && newVal<0.0)
				newVal = 0.0;
		}

		//save the new value
		this.mvarVal = newVal;

		//update the div
		this.mvarDOM.find('span').html(this.formatValue());

		//call the change function
		nofire = (typeof nofire === 'undefined') ? false : nofire;
		if(!nofire)
			this.raiseEvent.change(this);

	}//setValue(val)

	//set the domain
	clsNodeCRTL_FloatValue.prototype.setDomain = function(domain){

		//save the domain
		this.mvarDomain = domain;

		//reset the value incase it conflicts
		this.setValue( this.mvarVal );
	}//setDomain(domain)

	//set the control locked or unlocked
	clsNodeCRTL_FloatValue.prototype.setLocked = function(bool){

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
	
	//enter edit mode for this value, when double clicked
	clsNodeCRTL_FloatValue.prototype.doEditMode = function(event){

		//prevent UI artifacts
		event.preventDefault();

		//if we're locked, just GTFO
		if(this.mvarEditLock) return;

		//otherwise, make necessary changes
		//hide the value in the primary text area
		this.mvarDOM.find('span').hide();
		this.mvarDOM.find('input').val(this.formatValue()).show().focus();

		//this is now in edit mode
		this.mvarEditMode = true;

			
	}//doEditMode(event)

	//exit edit mode for this value, when double clicked
	clsNodeCRTL_FloatValue.prototype.endEditMode = function(event){

		//get the textbox value
		var newVal = this.mvarDOM.find('input').val();

		//make sure it's a valid integer or float
		if(newVal.match(/^[-+]?([0-9]+)?\.?[0-9]+$/) != null){

			//use our setting logic to set the value
			this.setValue(newVal, true);

		}//end if

		//hide the text box and show the regular span
		this.mvarDOM.find('span').show();
		this.mvarDOM.find('input').hide();

		//this is no longer in edit mode
		this.mvarEditMode = false;

		//raise change event
		this.raiseEvent.change(this);

	}//doEditMode(event)


	//this function starts the logic for the value of this control to be slid with dragging
	clsNodeCRTL_FloatValue.prototype.startValueDrag = function(event){
		
		//if edit mode, NOPE
		if(this.mvarEditMode) return;

		//if we're locked, just GTFO
		if(this.mvarEditLock) return;

		//save the initial position of the node so we can calculate a delta later
		this.dragStartVal = this.mvarVal;

		//call start a drag with our dragHandler object, and pass our callback function to it
		var me = this;
		dragHandler.dragStart( function(x, y){event.preventDefault(); me.doValueDrag(x, y);} );

	}//startValueDrag(event)

	//this function is the call back function for dragging that actually changes the value
	clsNodeCRTL_FloatValue.prototype.doValueDrag = function(deltaX, deltaY){

		//caculate a new value based on the delta values
		//(we only really care about deltaX since this is a horizontal-dragging slider)
		//also note that, this equation squares the delta value and we're only incrementing in units of 0.01
		//this way, if the mouse moves faster, the value will increase by bigger amounts
		var newVal = this.dragStartVal - ((deltaX) * 0.01);

		//use our setting logic to set the value
		this.setValue(newVal, true);

		//raise change event
		this.raiseEvent.change(this);

	}//doValueDrag(event)


	//this function returns a string that has the proper decimal places for this controls value
	clsNodeCRTL_FloatValue.prototype.formatValue = function(){
		return '' + parseFloat(Math.round(this.mvarVal * 1000) / 1000).toFixed(3);
	}//formatValue()




//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNodeCRTL_FloatValue.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNodeCRTL_FloatValue.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNodeCRTL_FloatValue.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)