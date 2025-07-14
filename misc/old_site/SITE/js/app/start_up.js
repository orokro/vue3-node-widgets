


//wait for the document to completey load before we start building the JS scene
$(document).ready(function(){

	//first thing we need to do is create two nodes, a default output node and a default colorpicker node
	/*var nodeOut = new clsNode(800, 100, 120, 80);
	nodeOut.setTitle('Output Node');

	nodeOut.addAttribute({'caption':'Output', 'def':'Paint Bucket Colorization Rule', 'CRTLType':'HTML', 'input':{'col':'color','type':'color'}, 'CRTLProps':{'defaultValue':'Paint Bucket Colorization Rule'} });
*/	

	//nodes will display a message when they receive an update signal
	window.showUpdates=true;
	
	//first thing we need to do is create two nodes, a default output node and a default colorpicker node
	var OutNodeID = nodeManager.createNode(clsNode_OutputPaintBucket, 	{x:'800', y:'100', w:'120', h:'80'});

	//next we need to make a default color picker for the output
	var ColorNodeID = nodeManager.createNode(clsNode_ColorPicker, 	{x:'600', y:'100', w:'120', h:'80', 'props':{'defaultValue':'009E8E'} }); //7A5BCF

	//lets connect the color node to the paintbucket by default
	nodeWireHandler.addConnectionByNodeID(ColorNodeID, 'col', OutNodeID, 'col');

	//for debugging lets generate a bunch of nodes
	/*nodeManager.createNode(clsNode_MathTrig, 	{x:'600', y:'300', w:'140', h:'80'});
	nodeManager.createNode(clsNode_MathLogic, 	{x:'800', y:'300', w:'140', h:'80'});
	nodeManager.createNode(clsNode_MathABOps, 	{x:'1000', y:'300', w:'140', h:'80'});
	nodeManager.createNode(clsNode_MathRound, 	{x:'1200', y:'300', w:'140', h:'80'});*/

	//create a new paint application
	var mainPaintApp = new clsPaintApplication($('#divTabPaintShop'));

	//switchTab('tab2');

	$(window).resize(function(){
		//$('.divPaintShopContainer table').css('height', ($(window).height() - 134 - 10) + 'px');
		//$('#divNodeEditor').css('height', ($(window).height() - 134 - 10) + 'px');

		$('.divPaintShopContainer table').css('height', (750) + 'px');
		$('#divNodeEditor').css('height',750 + 'px');
	}).resize();

	nodeWireHandler.renderWires();

	//$('.divPaintShopContainer table').css('height', $(window).height() + 'px');
/*
	//next we need to make a default color picker for the output
	var nodeColor = new clsNode_ColorPicker({x:'600', y:'100', w:'120', h:'80'});

 
	//for debugging lets generate a bunch of nodes
	var nodeMathTrig = new clsNode_MathTrig({x:'600', y:'300', w:'140', h:'80'});
	var nodeMathTrig = new clsNode_MathLogic({x:'800', y:'300', w:'140', h:'80'});
	var nodeMathABOps = new clsNode_MathABOps({x:'1000', y:'300', w:'140', h:'80'});
	var nodeMathABOps = new clsNode_MathRound({x:'1200', y:'300', w:'140', h:'80'});
*/
	//nodeColor.mvarDOM.find('.nodeBody').html('');

	//new jscolor.color(nodeColor.mvarDOM.find('.color').get());
	//var myPicker = new jscolor.color(document.getElementById('test'));
	//myPicker.fromString('99FF33')

	window.ctxmenu = false;
	$('body').get()[0].oncontextmenu = function(){return window.ctxmenu;};

	$(document).keydown(function(event){
		if(event.keyCode == 67){

			window.ctxmenu = !window.ctxmenu;
		}
	})
})//document is ready

