/*
	BuildDefaultLayout.js
	---------------------

	Utility to build the default layout for the NWEditor
*/

// import all our nodes
import { 
	ABMathNode,
	ABCompareNode,
	ClampValueNode,
	MapRangeNode,
	LerpValueNode,
	RoundNode,
	TrigNode,
	
	AllTypesNode,
	AllTypesOutNode,

	V2ScaleNode,
	V2AddNode,
	V2SubNode,
	V2DotNode,
	V2LerpNode,
	V2SeparateXYNode,
	V2CombineXYNode,

	V3ScaleNode,
	V3AddNode,
	V3SubNode,
	V3DotNode,
	V3LerpNode,
	V3SeparateXYZNode,
	V3CombineXYZNode,

	ColorMixNode,
	ColorBlendNode,
	SeparateAlpha,
	SeparateHSVNode,
	SeparateRGBNode,
	CombineRGBNode,
	CombineRGBANode,
	CombineHSVNode,
	
	RandomColorNode,
	RandomNumberNode,
	RandomV2Node,
	RandomV3Node,
	RandomBoolNode,

	InputCanvasInfo,
	InputCartesianCoords,
	InputPolarCoords,

	OutputColor,

	TexChecker,
	TexDiamonds,
	TexNoise,
	TexImage,
	TexLayer,

} from '@Nodes/index.js';


function addBuildInNodesBatch01(ctx) {
	// add some debug nodes so we can test UI
	ctx.addNode(TrigNode, 20, 100);
	ctx.addNode(ABMathNode, 220, 100);
	ctx.addNode(ABCompareNode, 400, 100);
	ctx.addNode(RoundNode, 580, 100);
	ctx.addNode(TrigNode, 760, 100);
	ctx.addNode(ClampValueNode, 940, 100);
	ctx.addNode(MapRangeNode, 1120, 100);
	ctx.addNode(LerpValueNode, 1300, 100);

	// next row is vector 2
	ctx.addNode(V2ScaleNode, 220, 460);
	ctx.addNode(V2AddNode, 400, 460);
	ctx.addNode(V2SubNode, 580, 460);
	ctx.addNode(V2DotNode, 760, 460);
	ctx.addNode(V2LerpNode, 940, 460);
	ctx.addNode(V2SeparateXYNode, 1120, 460);
	ctx.addNode(V2CombineXYNode, 1300, 460);

	// next row is vector 3
	ctx.addNode(V3ScaleNode, 220, 720);
	ctx.addNode(V3AddNode, 400, 720);
	ctx.addNode(V3SubNode, 580, 720);
	ctx.addNode(V3DotNode, 760, 720);
	ctx.addNode(V3LerpNode, 940, 720);
	ctx.addNode(V3SeparateXYZNode, 1120, 720);
	ctx.addNode(V3CombineXYZNode, 1300 , 720);

	// next row is random things
	ctx.addNode(RandomColorNode, 220, 980);
	ctx.addNode(RandomNumberNode, 400, 980);
	ctx.addNode(RandomV2Node, 580, 980);
	ctx.addNode(RandomV3Node, 760, 980);
	ctx.addNode(RandomBoolNode, 940, 980);

	// next row is color nodes
	ctx.addNode(ColorMixNode, 220, 1260);
	ctx.addNode(ColorBlendNode, 400, 1260);
	ctx.addNode(SeparateAlpha, 580, 1260);
	ctx.addNode(SeparateHSVNode, 760, 1260);
	ctx.addNode(SeparateRGBNode, 940, 1260);
	ctx.addNode(CombineRGBNode, 1120, 1260);
	ctx.addNode(CombineRGBANode, 1300, 1260);
	ctx.addNode(CombineHSVNode, 1480, 1260);

	// window.atn = ctx.addNode(AllTypesNode, 320, 100);
	window.atn = ctx.addNode(AllTypesNode, 20, 460);
	// window.atnOut = ctx.addNode(AllTypesOutNode, 20, 460);
}


function addBuildInNodesBatch02(ctx) {

	// add the new nodes specific for the demo
	ctx.addNode(InputCanvasInfo, 20, 20);
	ctx.addNode(InputCartesianCoords, 220, 20);
	ctx.addNode(InputPolarCoords, 420, 20);

	ctx.addNode(OutputColor, 620, 20);

	ctx.addNode(TexChecker, 20, 240);
	ctx.addNode(TexDiamonds, 220, 240);
	ctx.addNode(TexNoise, 420, 240);
	ctx.addNode(TexImage, 620, 240);
	ctx.addNode(TexLayer, 820, 240);
}


function buildNaturalLayout01(ctx) {

	// inputs along left
	ctx.addNode(InputCartesianCoords, 20, 20, 'coords');
	ctx.addNode(InputPolarCoords, 20, 200, 'pcoords');
	ctx.addNode(InputCanvasInfo, 20, 400, 'canvas');

	// output on right
	ctx.addNode(OutputColor, 1020, 20, 'output');

	// some random stuff in the middle
	ctx.addNode(TexChecker, 320, 20, 'checker');

	// set up a wire
	ctx.connMgr.tempWire.startX = 9 * 20;
	ctx.connMgr.tempWire.startY = 5.5 * 20;
	ctx.connMgr.tempWire.endX = 16 * 20;
	ctx.connMgr.tempWire.endY = 4.7 * 20;

	ctx.connMgr.addConnectionBasic(
		9*20, 5.4*20,
		16*20, 3.8*20
	);
}


export {
	addBuildInNodesBatch01,
	addBuildInNodesBatch02,
	buildNaturalLayout01,
}
