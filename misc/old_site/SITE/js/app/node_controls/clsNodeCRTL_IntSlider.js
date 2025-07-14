/*
	
	This class defines the logic for a interger slider control.

	Slider controls must always have a minimum and a maxium, otherwise a value control should be used.
 
*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNodeCRTL_IntSlider = function(parent, props){

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
		this.mvarVal = (typeof props.defaultValue === "undefined") ? 0 : props.defaultValue;

		//is this control locked for editing?
		this.mvarEditLock = (typeof props.locked === "undefined") ? false : props.locked;

		//the range is optiona. It will be betwen 0 and 1 if nothing is specified:
		this.mvarMinVal = (typeof props.minValue === "undefined") ? 0 : props.minValue;
		this.mvarMaxVal = (typeof props.maxValue === "undefined") ? 10 : props.maxValue;

		//this boolean represents the state of the controls edit mode
		this.mvarEditMode = false;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add the html for a value slider
		$(parent).append('<div class="NC_intSlider"><span>' + this.formatValue() + '</span><input type="text"/></div>');

		//save reference to the this controls primary DOM element
		this.mvarDOM = $(parent).find('.NC_intSlider');

		//bind input events specifically for this control:
		this.mvarDOM.dblclick(function(event){ if(!this.mvarEditMode) me.doEditMode(event);} ); //if(event.shiftKey)
		this.mvarDOM.find('input').keydown( function(event){ if(event.keyCode==13) me.endEditMode(event);} );
		this.mvarDOM.find('input').blur( function(event){me.endEditMode(event);} );

		this.mvarDOM.mousedown( function(event){ if(!this.mvarEditMode) me.startValueDrag(event);} );

		//properly set the value
		this.setValue(this.mvarVal, true);

		//if this control is locked, properly lock it now
		if(this.mvarEditLock) this.setLocked(true);



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS



}//clsNodeCRTL_IntSlider



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
	
	//get the current value
	clsNodeCRTL_IntSlider.prototype.getValue = function(){ return this.mvarVal; };



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
	
	//set the value of the slider
	clsNodeCRTL_IntSlider.prototype.setValue = function(val, nofire){

		//parse the value from the string
		newVal = parseInt(val);

		//make sure this value fits within the range
		newVal = this.rangeTrimVal(newVal);

		//save the new value
		this.mvarVal = newVal;

		//update the div
		this.mvarDOM.find('span').html(this.formatValue());

		//calculate the gradient percentage
		var percent = parseInt((this.mvarVal / this.mvarMaxVal) * 100)

		//update the background gradient
		var me = this;
		me.mvarDOM.css('background', 'linear-gradient(to right,  #4C7C7A 0%,#5D898F ' + percent + '%,#4F5268 ' + percent + '%,#282845 100%)');
		this.mvarDOM.hover( 
							function(){ 
										me.mvarDOM.css('background', 'linear-gradient(to right,  #4C7C7A 0%,#5D898F ' + percent + '%,#4F5268 ' + percent + '%,#282845 100%)');},

							function(){
										me.mvarDOM.css('background', 'linear-gradient(to right,  #4C7C7A 0%,#5D898F ' + percent + '%,#43475e ' + percent + '%,#20203d 100%)')} );

		//call the change function
		nofire = (typeof nofire === 'undefined') ? false : nofire;
		if(!nofire)
			me.raiseEvent.change(me);

	}//setValue(val)

	//set the control locked or unlocked
	clsNodeCRTL_IntSlider.prototype.setLocked = function(bool){

		//update our member variable
		this.mvarEditLock = bool;

		//if we're locked, we need to add some locked CSS
		if(this.mvarEditLock)
			this.mvarDOM.addClass('locked');
		else
			this.mvarDOM.removeClass('locked');

	}//setLocked(bool)



/*background: linear-gradient(to right, #42a8bc 0%,#44c9c7 50%,#43475e 51%,#20203d 100%);*/

/*background: -moz-linear-gradient(left,  #aebcbf 0%, #6e7774 50%, #0a0e0a 50%, #0a0809 100%);
background: -webkit-gradient(linear, left top, right top, color-stop(0%,#aebcbf), color-stop(50%,#6e7774), color-stop(50%,#0a0e0a), color-stop(100%,#0a0809));
background: -webkit-linear-gradient(left,  #aebcbf 0%,#6e7774 50%,#0a0e0a 50%,#0a0809 100%);
background: -o-linear-gradient(left,  #aebcbf 0%,#6e7774 50%,#0a0e0a 50%,#0a0809 100%);
background: -ms-linear-gradient(left,  #aebcbf 0%,#6e7774 50%,#0a0e0a 50%,#0a0809 100%);
background: linear-gradient(to right,  #aebcbf 0%,#6e7774 50%,#0a0e0a 50%,#0a0809 100%);
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#aebcbf', endColorstr='#0a0809',GradientType=1 ); */




//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//enter edit mode for this value, when double clicked
	clsNodeCRTL_IntSlider.prototype.doEditMode = function(event){

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
	clsNodeCRTL_IntSlider.prototype.endEditMode = function(event){

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
	clsNodeCRTL_IntSlider.prototype.startValueDrag = function(event){
		
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
	clsNodeCRTL_IntSlider.prototype.doValueDrag = function(deltaX, deltaY){

		//caculate a new value based on the delta values
		//(we only really care about deltaX since this is a horizontal-dragging slider)
		//also note that, this equation squares the delta value and we're only incrementing in units of 0.01
		//this way, if the mouse moves faster, the value will increase by bigger amounts
		var newVal = this.dragStartVal - ((deltaX));

		//use our setting logic to set the value
		this.setValue(newVal, true);

		//raise change event
		this.raiseEvent.change(this);

	}//doValueDrag(event)

	//this function trims a number to fit within the range of this control, as specified
	clsNodeCRTL_IntSlider.prototype.rangeTrimVal = function(val){
		if(val < this.mvarMinVal) val = this.mvarMinVal;
		if(val > this.mvarMaxVal) val = this.mvarMaxVal;
		return val;
	}//rangeTrimVal(val)

	//this function returns a string that has the proper decimal places for this controls value
	clsNodeCRTL_IntSlider.prototype.formatValue = function(){
		//return '' + parseFloat(Math.round(this.mvarVal * 1000) / 1000).toFixed(3);
		return '' + parseInt(this.mvarVal);
	}//formatValue()




//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNodeCRTL_IntSlider.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNodeCRTL_IntSlider.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNodeCRTL_IntSlider.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)