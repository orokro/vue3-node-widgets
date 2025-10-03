/*
	BuildDefaultLayout.js
	---------------------

	Utility to build the default layout for the NWEditor
*/

// import all our nodes
import { 

	GroupNode,
	GroupInputNode,
	GroupOutputNode,

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


function addBuildInNodesBatch01(g) {
	// add some debug nodes so we can test UI
	g.addNode(TrigNode, 20, 100);
	g.addNode(ABMathNode, 220, 100);
	g.addNode(ABCompareNode, 400, 100);
	g.addNode(RoundNode, 580, 100);
	g.addNode(TrigNode, 760, 100);
	g.addNode(ClampValueNode, 940, 100);
	g.addNode(MapRangeNode, 1120, 100);
	g.addNode(LerpValueNode, 1300, 100);

	// next row is vector 2
	g.addNode(V2ScaleNode, 220, 460);
	g.addNode(V2AddNode, 400, 460);
	g.addNode(V2SubNode, 580, 460);
	g.addNode(V2DotNode, 760, 460);
	g.addNode(V2LerpNode, 940, 460);
	g.addNode(V2SeparateXYNode, 1120, 460);
	g.addNode(V2CombineXYNode, 1300, 460);

	// next row is vector 3
	g.addNode(V3ScaleNode, 220, 720);
	g.addNode(V3AddNode, 400, 720);
	g.addNode(V3SubNode, 580, 720);
	g.addNode(V3DotNode, 760, 720);
	g.addNode(V3LerpNode, 940, 720);
	g.addNode(V3SeparateXYZNode, 1120, 720);
	g.addNode(V3CombineXYZNode, 1300 , 720);

	// next row is random things
	g.addNode(RandomColorNode, 220, 980);
	g.addNode(RandomNumberNode, 400, 980);
	g.addNode(RandomV2Node, 580, 980);
	g.addNode(RandomV3Node, 760, 980);
	g.addNode(RandomBoolNode, 940, 980);

	// next row is color nodes
	g.addNode(ColorMixNode, 220, 1260);
	g.addNode(ColorBlendNode, 400, 1260);
	g.addNode(SeparateAlpha, 580, 1260);
	g.addNode(SeparateHSVNode, 760, 1260);
	g.addNode(SeparateRGBNode, 940, 1260);
	g.addNode(CombineRGBNode, 1120, 1260);
	g.addNode(CombineRGBANode, 1300, 1260);
	g.addNode(CombineHSVNode, 1480, 1260);

	// window.atn = g.addNode(AllTypesNode, 320, 100);
	window.atn = g.addNode(AllTypesNode, 20, 460);
	// window.atnOut = g.addNode(AllTypesOutNode, 20, 460);
}


function addBuildInNodesBatch02(g) {

	// add the new nodes specific for the demo
	g.addNode(InputCanvasInfo, 20, 20);
	g.addNode(InputCartesianCoords, 220, 20);
	g.addNode(InputPolarCoords, 420, 20);

	g.addNode(OutputColor, 620, 20);

	g.addNode(TexChecker, 20, 240);
	g.addNode(TexDiamonds, 220, 240);
	g.addNode(TexNoise, 420, 240);
	g.addNode(TexImage, 620, 240);
	g.addNode(TexLayer, 820, 240);
}


function buildNaturalLayout01(g) {

	// inputs along left
	g.addNode(InputCartesianCoords, 20, 20, 'coords');
	g.addNode(InputPolarCoords, 20, 200, 'pcoords');
	g.addNode(InputCanvasInfo, 20, 400, 'canvas');

	// output on right
	g.addNode(OutputColor, 600, 20, 'output');

	// some random stuff in the middle
	g.addNode(TexChecker, 320, 20, 'checker');
	g.addNode(GroupNode, 320, 400, 'group1');

	nextTick(() => {
	
		// get both nodes
		const cartesianNode = g.nodes.value[0];
		const polarNode = g.nodes.value[1];
		const checkerNode = g.nodes.value[4];
		const outputNode = g.nodes.value[3];

		// get relevant fields:
		const thetaField = polarNode.static.fields[2];
		const colorAField = checkerNode.static.fields[1];
		const coordsField = cartesianNode.static.fields[1];
		const widthField = checkerNode.static.fields[0];
		const checkerColorField = checkerNode.static.fields[4];
		const outColorField = outputNode.static.fields[0];

		// make new connections
		const newConnTheta = g.connMgr.addConnectionBasic();
		const newConnCoords = g.connMgr.addConnectionBasic();
		const newConnOut = g.connMgr.addConnectionBasic();

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
