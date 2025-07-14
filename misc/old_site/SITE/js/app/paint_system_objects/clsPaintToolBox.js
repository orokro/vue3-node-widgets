/*
	What is the purpose of this file?

	This file defines an object which is responsbile for managing the tool box in a paint application

*/

//paint application tool box.
//NOTE: this object doesn't use prototyping because only one exists at a time.
//no need for the extra headache.
//The main purpose, therefore, is for name spacing
var clsPaintToolBox = function(DOMContainer){

	//CONSTANTS +++ CONSTANTS +++ CONSTANTS +++ CONSTANTS +++ CONSTANTS +++ CONSTANTS
	//CONSTANTS +++ CONSTANTS +++ CONSTANTS +++ CONSTANTS +++ CONSTANTS +++ CONSTANTS
		
		this.CONST = 	{
							TOOL_BUCKET:0,
							TOOL_PENCIL:1,
							TOOL_ERASER:2
						}



	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//save dom element that will be the container for our canvas
		this.mvarContainerDOM = DOMContainer;

		//reference to our own DOM elemetns
		this.mvarDOM = DOMContainer;

		//keep track of the current tool
		this.mvarTool = this.CONST.TOOL_BUCKET;

		//keep track of tool settings for each tool
		this.tools = [{}, {size: 10}, {size: 10}];



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//add the HTML for our canvas, complete with wrappers
		this.mvarDOM.append	(	
								'Select a Tool:<br>' +
								'<div class="PSTool_Bucket divPSTool selectedToolIcon" 	style="background:url(\'img/paint_shop/tool_icon_bucket.png\') 0px 0px;" width="59" height="59" ></div>' +
								'<div class="PSTool_Pencil divPSTool" 					style="background:url(\'img/paint_shop/tool_icon_pencil.png\') 0px 0px;" width="59" height="59" ></div>' +
								'<div class="PSTool_Eraser divPSTool" 					style="background:url(\'img/paint_shop/tool_icon_eraser.png\') 0px 0px;" width="59" height="59" ></div>' +
								'<br><br>' +
								'<div class="divToolSettings">' + 
									'Tool Settings:<br>' +
									'<div class="settingsPayne">' + 
										'<div class="PSTool_Bucket toolSettings"><i>NONE for Paint Bucket</i></div>' + 
										'<div class="PSTool_Pencil toolSettings" style="display:none;"></div>' + 
										'<div class="PSTool_Eraser toolSettings" style="display:none;"></div>' + 
										'<br><br>' + 
									'</div>' +
								'</div>' +
								'<div class="divNodeLogic">' +
									'Tool Node Logic:' + 
									'<div class="toolNodeLogicBox">' + 
										'<div class="toolNodeLogicRow toolNodeLogicSelected"><i>Default</i></div>' + 
										'<div class="toolNodeLogicRow">Node Editor Setup</div>' + 
									'</div>' +
									'<br><br>' +
								'</div>' +
								'<div class="divNodeInputs">' +
									'Node Inputs:<br>' +
								'</div>'
							);
	
		//create slider controls for the size of the brush and eraser
		this.mvarDOM.find('.toolSettings.PSTool_Pencil').append('Brush Size:<br>');
		this.pencilSizeSlider = new clsNodeCRTL_IntSlider( this.mvarDOM.find('.toolSettings.PSTool_Pencil') , {'minValue':1, 'maxValue':100, 'defaultValue':10 });
		this.mvarDOM.find('.toolSettings.PSTool_Eraser').append('Brush Size:<br>');
		this.eraserSizeSlider = new clsNodeCRTL_IntSlider( this.mvarDOM.find('.toolSettings.PSTool_Eraser') , {'minValue':1, 'maxValue':100, 'defaultValue':10 });

		//add event hooks for the sliders, so they update the tools ettings
		this.pencilSizeSlider.onChange(function(val){ me.tools[me.CONST.TOOL_PENCIL].size = val; me.raiseEvent.change(me); });
		this.eraserSizeSlider.onChange(function(val){ me.tools[me.CONST.TOOL_ERASER].size = val; me.raiseEvent.change(me); });
		
		//add events for selecting a tool
		this.mvarDOM.find('.divPSTool').click(function(event){ me.selectTool(event, this); })

}//object clsPaintToolBox()



//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS

	//selects a tool when a tool button is clicked
	clsPaintToolBox.prototype.selectTool = function(event, toolIcon){

		//remove selected CSS from all tool icons
		this.mvarDOM.find('.divPSTool').removeClass('selectedToolIcon');

		//select this tool
		$(toolIcon).addClass('selectedToolIcon');

		//figure out which tool this is, and display the relevant options
		//the tool type is the first class name
		var toolTypeName = $(toolIcon).attr('class').split(' ')[0];

		//hide all options
		this.mvarDOM.find('.toolSettings').hide();

		//show settings only for this tool
		this.mvarDOM.find('.' + toolTypeName + '.toolSettings').show();

		//based on the name, set it as our current tool and display or hide necessary elements
		switch(toolTypeName){
			case 'PSTool_Bucket':
				this.mvarTool = this.CONST.TOOL_BUCKET;
				this.mvarDOM.find('.divNodeLogic').show();
				this.mvarDOM.find('.divNodeInputs').show();
				break;

			case 'PSTool_Pencil':
				this.mvarTool = this.CONST.TOOL_PENCIL;
				this.mvarDOM.find('.divNodeLogic').show();
				this.mvarDOM.find('.divNodeInputs').show();
				break;

			case 'PSTool_Eraser':
				this.mvarTool = this.CONST.TOOL_ERASER;
				this.mvarDOM.find('.divNodeLogic').hide();
				this.mvarDOM.find('.divNodeInputs').hide();
				break;
		}//swatch

		//tell anyone who's listening that our tool has changed
		this.raiseEvent.change(this);

	}//selectTool(event, toolIcon)



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsPaintToolBox.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsPaintToolBox.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarTool, me.tools[me.mvarTool]);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsPaintToolBox.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)