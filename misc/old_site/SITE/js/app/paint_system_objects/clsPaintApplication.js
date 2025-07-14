/*
	What is the purpose of this file?

	This file defines an object which is responsbile for an instance of a paint application.

	This will probably be a singleton, but I'll write it as a class if there ever needs to be more than one paint tab open at once.

*/

//the main paint application
//NOTE: this object doesn't use prototyping because only one exists at a time.
//no need for the extra headache.
//The main purpose, therefore, is for name spacing
var clsPaintApplication = function(DOMContainer){
	
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

		//our canvas object and it's drawing context
		this.canvas = null;
		this.CTX = null;

		//save dom element that will be the container for our paint application
		this.mvarDOM = DOMContainer;

		//keep track of the current tool
		this.mvarTool = this.CONST.TOOL_BUCKET;

		//array of tool objects
		this.tools = [];


	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//save reference to the work area (where the canvas goes) and the toolbox area
		this.mvarWorkAreaDOM = this.mvarDOM.find('.paintShopWorkArea');
		this.mvarToolAreaDOM = this.mvarDOM.find('.paintShopTools');

		//create a new tool box
		this.toolbox = new clsPaintToolBox(this.mvarToolAreaDOM);

		//create a new canvas
		this.canvas = new clsPaintCanvas(this.mvarWorkAreaDOM);
		
		//save the drawing context
		this.CTX = this.canvas.mvarCTX;

		//default canvas tool icon
		me.canvas.mvarCanvasDOM.css('cursor',"url('img/cursors/tool_paint_bucket.gif'), auto" );

		//create new of each tool
		this.tools[this.CONST.TOOL_BUCKET] = new clsTool_PaintBucket(	this.canvas 	);
		this.tools[this.CONST.TOOL_PENCIL] = new clsTool_Pencil(		this.canvas 	);
		this.tools[this.CONST.TOOL_ERASER] = new clsTool_Eraser(		this.canvas 	);

		//add event for when the tool changes
		this.toolbox.onChange(function(tool, props){

			me.mvarTool = tool;

			switch(tool){
				case me.CONST.TOOL_BUCKET:
					me.canvas.mvarCanvasDOM.css('cursor',"url('img/cursors/tool_paint_bucket.gif'), auto" );
					break;

				case me.CONST.TOOL_PENCIL:
					me.canvas.mvarCanvasDOM.css('cursor',"url('img/cursors/tool_pencil.gif'), auto" );
					me.tools[tool].setSize(props.size);
					break;

				case me.CONST.TOOL_ERASER:
					me.canvas.mvarCanvasDOM.css('cursor',"url('img/cursors/tool_eraser.gif'), auto" );
					me.tools[tool].setSize(props.size);
					break;
			}//swatch 
		});

		//add events for mouse up, mouse move, and mouse down for the canvas, to pass along to the tool
		this.canvas.mvarCanvasDOM.mousedown(function(event){ me.tools[me.mvarTool].mouseDown(event);  	});
		this.canvas.mvarCanvasDOM.mousemove(function(event){ me.tools[me.mvarTool].mouseMove(event);  	});
		this.canvas.mvarCanvasDOM.mouseup(	function(event){ me.tools[me.mvarTool].mouseUp(event);  	});
		


	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS




}//object clsPaintApplication()