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
import { nextTick } from 'vue';


function addBuildInNodesBatch01(ctx) {
	// add some debug nodes so we can test UI
	ctx.rootGraph.addNode(TrigNode, 20, 100);
	ctx.rootGraph.addNode(ABMathNode, 220, 100);
	ctx.rootGraph.addNode(ABCompareNode, 400, 100);
	ctx.rootGraph.addNode(RoundNode, 580, 100);
	ctx.rootGraph.addNode(TrigNode, 760, 100);
	ctx.rootGraph.addNode(ClampValueNode, 940, 100);
	ctx.rootGraph.addNode(MapRangeNode, 1120, 100);
	ctx.rootGraph.addNode(LerpValueNode, 1300, 100);

	// next row is vector 2
	ctx.rootGraph.addNode(V2ScaleNode, 220, 460);
	ctx.rootGraph.addNode(V2AddNode, 400, 460);
	ctx.rootGraph.addNode(V2SubNode, 580, 460);
	ctx.rootGraph.addNode(V2DotNode, 760, 460);
	ctx.rootGraph.addNode(V2LerpNode, 940, 460);
	ctx.rootGraph.addNode(V2SeparateXYNode, 1120, 460);
	ctx.rootGraph.addNode(V2CombineXYNode, 1300, 460);

	// next row is vector 3
	ctx.rootGraph.addNode(V3ScaleNode, 220, 720);
	ctx.rootGraph.addNode(V3AddNode, 400, 720);
	ctx.rootGraph.addNode(V3SubNode, 580, 720);
	ctx.rootGraph.addNode(V3DotNode, 760, 720);
	ctx.rootGraph.addNode(V3LerpNode, 940, 720);
	ctx.rootGraph.addNode(V3SeparateXYZNode, 1120, 720);
	ctx.rootGraph.addNode(V3CombineXYZNode, 1300 , 720);

	// next row is random things
	ctx.rootGraph.addNode(RandomColorNode, 220, 980);
	ctx.rootGraph.addNode(RandomNumberNode, 400, 980);
	ctx.rootGraph.addNode(RandomV2Node, 580, 980);
	ctx.rootGraph.addNode(RandomV3Node, 760, 980);
	ctx.rootGraph.addNode(RandomBoolNode, 940, 980);

	// next row is color nodes
	ctx.rootGraph.addNode(ColorMixNode, 220, 1260);
	ctx.rootGraph.addNode(ColorBlendNode, 400, 1260);
	ctx.rootGraph.addNode(SeparateAlpha, 580, 1260);
	ctx.rootGraph.addNode(SeparateHSVNode, 760, 1260);
	ctx.rootGraph.addNode(SeparateRGBNode, 940, 1260);
	ctx.rootGraph.addNode(CombineRGBNode, 1120, 1260);
	ctx.rootGraph.addNode(CombineRGBANode, 1300, 1260);
	ctx.rootGraph.addNode(CombineHSVNode, 1480, 1260);

	// window.atn = ctx.rootGraph.addNode(AllTypesNode, 320, 100);
	window.atn = ctx.rootGraph.addNode(AllTypesNode, 20, 460);
	// window.atnOut = ctx.rootGraph.addNode(AllTypesOutNode, 20, 460);
}


function addBuildInNodesBatch02(ctx) {

	// add the new nodes specific for the demo
	ctx.rootGraph.addNode(InputCanvasInfo, 20, 20);
	ctx.rootGraph.addNode(InputCartesianCoords, 220, 20);
	ctx.rootGraph.addNode(InputPolarCoords, 420, 20);

	ctx.rootGraph.addNode(OutputColor, 620, 20);

	ctx.rootGraph.addNode(TexChecker, 20, 240);
	ctx.rootGraph.addNode(TexDiamonds, 220, 240);
	ctx.rootGraph.addNode(TexNoise, 420, 240);
	ctx.rootGraph.addNode(TexImage, 620, 240);
	ctx.rootGraph.addNode(TexLayer, 820, 240);
}


function buildNaturalLayout01(ctx) {

	// inputs along left
	ctx.rootGraph.addNode(InputCartesianCoords, 20, 20, 'coords');
	ctx.rootGraph.addNode(InputPolarCoords, 20, 200, 'pcoords');
	ctx.rootGraph.addNode(InputCanvasInfo, 20, 400, 'canvas');

	// output on right
	ctx.rootGraph.addNode(OutputColor, 600, 20, 'output');

	// some random stuff in the middle
	ctx.rootGraph.addNode(TexChecker, 320, 20, 'checker');

	// set up a wire
	// ctx.connMgr.addConnectionBasic(
	// 	9*20, 5.4*20,
	// 	16*20, 3.8*20
	// );

	nextTick(() => {
	
		// get both nodes
		const cartesianNode = ctx.rootGraph.nodes.value[0];
		const polarNode = ctx.rootGraph.nodes.value[1];
		const checkerNode = ctx.rootGraph.nodes.value[4];
		const outputNode = ctx.rootGraph.nodes.value[3];

		// get relevant fields:
		const thetaField = polarNode.static.fields[2];
		const colorAField = checkerNode.static.fields[1];
		const coordsField = cartesianNode.static.fields[1];
		const widthField = checkerNode.static.fields[0];
		const checkerColorField = checkerNode.static.fields[4];
		const outColorField = outputNode.static.fields[0];

		// make new connections
		const newConnTheta = ctx.rootGraph.connMgr.addConnectionBasic();
		const newConnCoords = ctx.rootGraph.connMgr.addConnectionBasic();
		const newConnOut = ctx.rootGraph.connMgr.addConnectionBasic();

		// wire it up
		newConnTheta.setInput(polarNode, thetaField);
		newConnTheta.setOutput(checkerNode, colorAField);

		newConnCoords.setInput(cartesianNode, coordsField);
		newConnCoords.setOutput(checkerNode, widthField);

		newConnOut.setInput(checkerNode, checkerColorField);
		newConnOut.setOutput(outputNode, outColorField);
	});

}


export {
	addBuildInNodesBatch01,
	addBuildInNodesBatch02,
	buildNaturalLayout01,
}
