/*
	index.js
	--------

	Import & provide some things for the NWEditor class.
*/

// import all our node types
import AllTypesNode from './AllTypesNode';
import AllTypesOutNode from './AllTypesOutNode';

import ABMathNode from './ABMathNode';
import ABCompareNode from './ABCompareNode';
import ClampValueNode from './ClampValueNode';
import MapRangeNode from './MapRangeNode';
import LerpValueNode from './LerpValueNode';
import RoundNode from './RoundNode';
import TrigNode from './TrigNode';

import ColorMixNode from './ColorMixNode';
import ColorBlendNode from './ColorBlendNode';
import SeparateAlpha from './SeparateAlphaNode';
import SeparateHSVNode from './SeparateHSVNode';
import SeparateRGBNode from './SeparateRGBNode';
import CombineRGBNode from './CombineRGBNode';
import CombineRGBANode from './CombineRGBANode';
import CombineHSVNode from './CombineHSVNode';

import V2ScaleNode from './V2ScaleNode';
import V2AddNode from './V2AddNode';	
import V2SubNode from './V2SubNode';
import V2DotNode from './V2DotNode';
import V2LerpNode from './V2LerpNode';
import V2SeparateXYNode from './V2SeparateXYNode';
import V2CombineXYNode from './V2CombineXYNode';

import V3ScaleNode from './V3ScaleNode';
import V3AddNode from './V3AddNode';	
import V3SubNode from './V3SubNode';
import V3DotNode from './V3DotNode';
import V3LerpNode from './V3LerpNode';
import V3SeparateXYZNode from './V3SeparateXYZNode';
import V3CombineXYZNode from './V3CombineXYZNode';

import RandomColorNode from './RandomColorNode';
import RandomNumberNode from './RandomNumberNode';
import RandomV2Node from './RandomV2Node';
import RandomV3Node from './RandomV3Node';
import RandomBoolNode from './RandomBoolNode';


import InputCanvasInfo from './InputCanvasInfoNode';
import InputCartesianCoords from './InputCartesianCoordsNode';
import InputPolarCoords from './InputPolarCoordsNode';

import TexChecker from './TexCheckerNode';
import TexDiamonds from './TexDiamondsNode';
import TexNoise from './TexNoiseNode';
import TexImage from './TexImageNode';
import TexLayer from './TexLayerNode';

// import Input

// make a reusable list of default nodes
const defaultNodeList = [

	// debug nodes
	{ class: AllTypesNode, menuPath: '/Debug' },
	{ class: AllTypesOutNode, menuPath: '/Debug/' },

	// mathematical nodes
	{ class: ABMathNode, menuPath: '/Math (Scalar)' },
	{ class: ABCompareNode, menuPath: '/Math (Scalar)' },
	{ class: RoundNode, menuPath: '/Math (Scalar)' },
	{ class: ClampValueNode, menuPath: '/Math (Scalar)' },
	{ class: LerpValueNode, menuPath: '/Math (Scalar)' },
	{ class: MapRangeNode, menuPath: '/Math (Scalar)' },	
	{ class: TrigNode, menuPath: '/Math (Scalar)' },

	// vector2 nodes
	{ class: V2ScaleNode, menuPath: '/Math (Vector2)' },
	{ class: V2AddNode, menuPath: '/Math (Vector2)' },
	{ class: V2SubNode, menuPath: '/Math (Vector2)' },
	{ class: V2DotNode, menuPath: '/Math (Vector2)' },
	{ class: V2LerpNode, menuPath: '/Math (Vector2)' },
	{ class: V2SeparateXYNode, menuPath: '/Math (Vector2)' },
	{ class: V2CombineXYNode, menuPath: '/Math (Vector2)' },

	// vector3 nodes
	{ class: V3ScaleNode, menuPath: '/Math (Vector3)' },
	{ class: V3AddNode, menuPath: '/Math (Vector3)' },
	{ class: V3SubNode, menuPath: '/Math (Vector3)' },
	{ class: V3DotNode, menuPath: '/Math (Vector3)' },
	{ class: V3LerpNode, menuPath: '/Math (Vector3)' },
	{ class: V3SeparateXYZNode, menuPath: '/Math (Vector3)' },
	{ class: V3CombineXYZNode, menuPath: '/Math (Vector3)' },

	// color nodes
	{ class: ColorMixNode, menuPath: '/Color' },
	{ class: ColorBlendNode, menuPath: '/Color' },
	{ class: SeparateRGBNode, menuPath: '/Color' },
	{ class: SeparateAlpha, menuPath: '/Color' },
	{ class: SeparateHSVNode, menuPath: '/Color' },
	{ class: CombineRGBNode, menuPath: '/Color' },
	{ class: CombineRGBANode, menuPath: '/Color' },
	{ class: CombineHSVNode, menuPath: '/Color' },

	// random nodes
	{ class: RandomColorNode, menuPath: '/Random/' },
	{ class: RandomNumberNode, menuPath: 'Random/' },
	{ class: RandomV2Node, menuPath: '/Random/' },
	{ class: RandomV3Node, menuPath: '/Random/' },
	{ class: RandomBoolNode, menuPath: '/Random/' },

	// input nodes


];

// export all the things
export { 
	defaultNodeList,
	
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
};
