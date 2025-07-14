/*
	
	This class defines dropbox node

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNodeCRTL_DropBox = function(parent, props){

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
		this.mvarVal = (typeof props.defaultValue === "undefined") ? 0 : props.defaultValue;

		//keep a count of items that have been added
		this.mvarItemCount = 0;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add the html for a value slider
		$(parent).append('<select class="NC_DropBox"></select>');

		//save reference to the this controls primary DOM element
		this.mvarDOM = $(parent).find('.NC_DropBox');

		//if a list of dropdown items was passed in the properties, add them now
		var listOfItems = (typeof props.items === "undefined") ? [] : props.items;

		//bind input events specifically for this control:
		for(var i=0; i < listOfItems.length; i++){

			//add the item using our mutator method
			this.addItem(listOfItems[i]);

		} //next i

		//properly set the value
		this.setValue(this.mvarVal, true);

		//if this control is locked, properly lock it now
		if(this.mvarEditLock) this.setLocked(true);

		//find and event for when the select box changes
		this.mvarDOM.change(function(){ me.mvarVal = $(this).val(); me.raiseEvent.change(me); });


	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
}



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS

	//get the current value
	clsNodeCRTL_DropBox.prototype.getValue = function(){ return this.mvarVal; };



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
	
	//set the value of this control
	clsNodeCRTL_DropBox.prototype.setValue = function(val, nofire){

		//set the value
		this.mvarVal = val;
		this.mvarDOM.val(val);

		//call the change function
		nofire = (typeof nofire === 'undefined') ? false : nofire;
		if(!nofire)
			me.raiseEvent.change(me);

	}//setValue(val)

	//set the control locked or unlocked
	clsNodeCRTL_DropBox.prototype.setLocked = function(bool){

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
	
	clsNodeCRTL_DropBox.prototype.addItem = function(itemStr){

		//add an option
		this.mvarDOM.append('<option value="' + (this.mvarItemCount++) + '">' + itemStr + '</option>')

	}//addItem(itemStr)



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNodeCRTL_DropBox.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNodeCRTL_DropBox.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNodeCRTL_DropBox.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)