/*
	
	This class makes a colorpicker node 

*/

//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
//MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS +++ MAIN CLASS
clsNode_Texture_Image = function(props){

		//save our type name
		this.typeName = 'Texture_Image';
		
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

		//we need to build a canvas to draw the image from the url to
		this.dataCanvas = document.createElement('canvas');
		this.dataImg = null;
		this.dataCTX = this.dataCanvas.getContext('2d');
		this.dataImgData = null;
		this.dataW = 500;
		this.dataH = 500;


	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//create a new node object as a blank slate
		this.NODE = new clsNode(props.newID, ((typeof props.x === "undefined") ? 100 : props.x), ((typeof props.y === "undefined") ? 100 : props.y), ((typeof props.w === "undefined") ? 140 : props.w), ((typeof props.h === "undefined") ? 100 : props.h));

		//tell the node about us
		this.NODE.super = me;
		
		//give our node the proper title
		this.NODE.setTitle('Texture &#9658; Image');

		//build our nodes attributes
		this.NODE.addAttribute({'caption':'Preview Thumb', 		'CRTLType':'HTML', 			'CRTLProps':{'defaultValue':'<input type="file" class="fileInput"/>'} });
		this.NODE.addAttribute({'caption':'Sample X:', 			'CTRLType':'INT_VALUE', 	'input':{'name':'x', 		'type':'int'}, 		'output':{'name':'x', 		'type':'int'},		'CRTLProps':{'defaultValue':'0', 'domain':'+-'}		});
		this.NODE.addAttribute({'caption':'Sample Y:', 			'CTRLType':'INT_VALUE', 	'input':{'name':'y', 		'type':'int'}, 		'output':{'name':'y', 		'type':'int'},		'CRTLProps':{'defaultValue':'0', 'domain':'+-'}		});
		this.NODE.addAttribute({'caption':'Output Color', 		'CTRLType':'COLOR', 														'output':{'name':'col', 	'type':'color'},	'CRTLProps':{'defaultValue':'000000', 'locked':true}				});

		//add events for loading a file from the local computer
		this.dataFileInput = this.NODE.mvarDOM.find('.fileInput')[0];
		this.dataFileInput.addEventListener('change', function(e){me.handleFiles(e, me); }, false);

		//add events for the sample change
		this.NODE.getCTRL(1).onChange(function(val){ me.update(); });
		this.NODE.getCTRL(2).onChange(function(val){ me.update(); });
		
		//update it once on creation, so it's output values are gauranteed to be calculated by the model at least once
		this.update();


	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS

		//load an image to sample
		this.handleFiles = function(e, me) {

		    //get url from file
		    var url = URL.createObjectURL(e.target.files[0]);

		    //create empty new image
			me.dataImg = new Image();

			//set up function to load the image
		    me.dataImg.onload = function() {

		    	//make sure the canvas fits the correct size
				me.dataCanvas.width = me.dataW;
				me.dataCanvas.height = me.dataH;

		        //draw the data to the canvas
				me.dataCTX.drawImage(me.dataImg, 0, 0, me.dataW, me.dataH);

				//get the data from the image
				me.dataImgData = me.dataCTX.getImageData(0, 0, me.dataW, me.dataH);
				me.dataImgData = me.dataImgData.data;

			}//image load

			//set the source to the local file URL which will cause the onload to fire
		    me.dataImg.src = url;
		    
		}//handleFiles(e)

}//clsNode_Texture_Image



//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS
//PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS +++ PROTOTYPAL METHODS



//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS
//GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS +++ GETTERS

	//return the current state-of-attrs
	clsNode_Texture_Image.prototype.getModelAttrs = function(){

		return {
					'data': 	this.dataImgData,	
					'dataW':  	this.dataW,
					'dataH':  	this.dataH,
					'x': 		this.NODE.getInputVal('x', 		this.NODE.getCTRL(1)),
					'y': 		this.NODE.getInputVal('y', 		this.NODE.getCTRL(2))
				};
	}//getModelAttrs()

	



//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS
//SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS +++ SETTERS



//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
//GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS +++ GENERAL METHODS
	
	//the model function defines the behavior of the node in a static fashing
	//so it can be used even if not with an instantiated instance
	clsNode_Texture_Image.prototype.model = function(inputs){

		//black until sampled
		var sampleColor = '000000';

		//if we havent loaded an image yet, just return black
		if(inputs.data != null){

			//get the pixel position to sample
			var pixelPos = (((inputs.y+inputs.dataH) % inputs.dataH) * inputs.dataW + ( (inputs.x+ inputs.dataW) % inputs.dataW))  * 4;

			//get the R, G, B, A values at this point
			var r = inputs.data[ pixelPos   ];
			var g = inputs.data[ pixelPos+1 ];
			var b = inputs.data[ pixelPos+2 ];
			var a = inputs.data[ pixelPos+3 ];
			
			//convert to hex...
			var hex = colorMath.RGBToHex(r, g, b);

			//this is now our color
			sampleColor = hex;
		}
		
		

		//build the list of outputs as defined for the node
		return {
					'data': 		inputs.data,
					'dataW': 		inputs.dataW,
					'dataH': 		inputs.dataH,
					'x': 			inputs.x,
					'y': 			inputs.y,
					'col': 			sampleColor
				};

	}//model(inputs)

	//update teh value of this node when any of it's nodes change.
	clsNode_Texture_Image.prototype.update = function(){

		//show update toast in title bar of node!
		this.NODE.showUpdate();

		//build list of inputs to pass to our model
		var inputs = this.getModelAttrs();

		//use our model to compute the outputs
		this.NODE.outputs = this.model(inputs);

		//update the color three control
		this.NODE.getCTRL(3).setValue( this.NODE.outputs.col, true);

		//tell the wire manager that an update has occured
		nodeWireHandler.nodeUpdate(this.NODE.mvarNodeID);
			
	}//update()



//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
//EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS +++ EVENTS
	
	//create raise event object for namespacing
	clsNode_Texture_Image.prototype.raiseEvent = {};


	//CHANGE EVENT +++ CHANGE EVENT +++ CHANGE EVENT
	clsNode_Texture_Image.prototype.raiseEvent.change = function(me){

		//call the change call back function if one exists
		if(me.changeCallBack != null)
			me.changeCallBack.call(null, me.mvarVal);

	}//raiseEvent.change()

	//set the call back function for the change event
	clsNode_Texture_Image.prototype.onChange = function(callBackFunction){

		//set the callback function=
		this.changeCallBack = callBackFunction;

	}//onChange(callBackFunction)




//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU
//REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU +++ REGISTER NODE WITH CREATION MENU

//this bit of code is run as soon as this file is loaded, which means the nodeCreationMenu file must already have been loaded.
nodeCreationMenu.registerNodeMenuItem('Image', ['Texture'], clsNode_Texture_Image);