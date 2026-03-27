/*
	index.js
	--------

	Import & provide some things for the NWEditor class.
*/

// import all our node types
import AllTypesNode from './AllTypesNode';
import AllTypesOutNode from './AllTypesOutNode';
import ABMathKnobNode from './ABMathKnobNode';
import SuperWaveNode from './SuperWaveNode';

// special nodes
import GroupNode from './GroupNode';
import GroupInputNode from './GroupInputNode';
import GroupOutputNode from './GroupOutputNode';

import ABMathNode from './ABMathNode';
import ABCompareNode from './ABCompareNode';
import ClampValueNode from './ClampValueNode';
import MapRangeNode from './MapRangeNode';
import LerpValueNode from './LerpValueNode';
import RoundNode from './RoundNode';
import TrigNode from './TrigNode';
import AverageNode from './AverageNode';

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

import OutputColor from './OutputColorNode';

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
// key: stable string used for serialization - never changes even if class is renamed.
// Each class must appear only once; menu visibility is controlled by menuPath alone.
const defaultNodeList = [

	// special / group nodes
	{ class: GroupNode,        menuPath: '/Special',        key: 'GroupNode' },
	{ class: GroupInputNode,   menuPath: '/Special/',       key: 'GroupInputNode' },
	{ class: GroupOutputNode,  menuPath: '/Special/',       key: 'GroupOutputNode' },

	// debug nodes
	{ class: AllTypesNode,     menuPath: '/Debug',          key: 'AllTypesNode' },
	{ class: AllTypesOutNode,  menuPath: '/Debug/',         key: 'AllTypesOutNode' },
	{ class: ABMathKnobNode,   menuPath: '/Debug/',         key: 'ABMathKnobNode' },
	{ class: SuperWaveNode,    menuPath: '/Debug/',         key: 'SuperWaveNode' },

	// mathematical nodes
	{ class: ABMathNode,       menuPath: '/Math (Scalar)',  key: 'ABMathNode' },
	{ class: ABCompareNode,    menuPath: '/Math (Scalar)',  key: 'ABCompareNode' },
	{ class: RoundNode,        menuPath: '/Math (Scalar)',  key: 'RoundNode' },
	{ class: AverageNode,      menuPath: '/Math (Scalar)',  key: 'AverageNode' },
	{ class: ClampValueNode,   menuPath: '/Math (Scalar)',  key: 'ClampValueNode' },
	{ class: LerpValueNode,    menuPath: '/Math (Scalar)',  key: 'LerpValueNode' },
	{ class: MapRangeNode,     menuPath: '/Math (Scalar)',  key: 'MapRangeNode' },
	{ class: TrigNode,         menuPath: '/Math (Scalar)',  key: 'TrigNode' },

	// vector2 nodes
	{ class: V2ScaleNode,      menuPath: '/Math (Vector2)', key: 'V2ScaleNode' },
	{ class: V2AddNode,        menuPath: '/Math (Vector2)', key: 'V2AddNode' },
	{ class: V2SubNode,        menuPath: '/Math (Vector2)', key: 'V2SubNode' },
	{ class: V2DotNode,        menuPath: '/Math (Vector2)', key: 'V2DotNode' },
	{ class: V2LerpNode,       menuPath: '/Math (Vector2)', key: 'V2LerpNode' },
	{ class: V2SeparateXYNode, menuPath: '/Math (Vector2)', key: 'V2SeparateXYNode' },
	{ class: V2CombineXYNode,  menuPath: '/Math (Vector2)', key: 'V2CombineXYNode' },

	// vector3 nodes
	{ class: V3ScaleNode,      menuPath: '/Math (Vector3)', key: 'V3ScaleNode' },
	{ class: V3AddNode,        menuPath: '/Math (Vector3)', key: 'V3AddNode' },
	{ class: V3SubNode,        menuPath: '/Math (Vector3)', key: 'V3SubNode' },
	{ class: V3DotNode,        menuPath: '/Math (Vector3)', key: 'V3DotNode' },
	{ class: V3LerpNode,       menuPath: '/Math (Vector3)', key: 'V3LerpNode' },
	{ class: V3SeparateXYZNode,menuPath: '/Math (Vector3)', key: 'V3SeparateXYZNode' },
	{ class: V3CombineXYZNode, menuPath: '/Math (Vector3)', key: 'V3CombineXYZNode' },

	// color nodes
	{ class: ColorMixNode,     menuPath: '/Color',          key: 'ColorMixNode' },
	{ class: ColorBlendNode,   menuPath: '/Color',          key: 'ColorBlendNode' },
	{ class: SeparateRGBNode,  menuPath: '/Color',          key: 'SeparateRGBNode' },
	{ class: SeparateAlpha,    menuPath: '/Color',          key: 'SeparateAlphaNode' },
	{ class: SeparateHSVNode,  menuPath: '/Color',          key: 'SeparateHSVNode' },
	{ class: CombineRGBNode,   menuPath: '/Color',          key: 'CombineRGBNode' },
	{ class: CombineRGBANode,  menuPath: '/Color',          key: 'CombineRGBANode' },
	{ class: CombineHSVNode,   menuPath: '/Color',          key: 'CombineHSVNode' },

	// random nodes
	{ class: RandomColorNode,  menuPath: '/Random/',        key: 'RandomColorNode' },
	{ class: RandomNumberNode, menuPath: '/Random/',        key: 'RandomNumberNode' },
	{ class: RandomV2Node,     menuPath: '/Random/',        key: 'RandomV2Node' },
	{ class: RandomV3Node,     menuPath: '/Random/',        key: 'RandomV3Node' },
	{ class: RandomBoolNode,   menuPath: '/Random/',        key: 'RandomBoolNode' },

	// input nodes
	{ class: InputCanvasInfo,       menuPath: '/Input',     key: 'InputCanvasInfoNode' },
	{ class: InputCartesianCoords,  menuPath: '/Input',     key: 'InputCartesianCoordsNode' },
	{ class: InputPolarCoords,      menuPath: '/Input',     key: 'InputPolarCoordsNode' },

	// output node
	{ class: OutputColor,      menuPath: '/Output',         key: 'OutputColorNode' },

	// texture nodes
	{ class: TexChecker,       menuPath: '/Texture',        key: 'TexCheckerNode' },
	{ class: TexDiamonds,      menuPath: '/Texture',        key: 'TexDiamondsNode' },
	{ class: TexNoise,         menuPath: '/Texture',        key: 'TexNoiseNode' },
	{ class: TexImage,         menuPath: '/Texture',        key: 'TexImageNode' },
	{ class: TexLayer,         menuPath: '/Texture',        key: 'TexLayerNode' },

];

// Build a stable registry Map for serialization lookups.
// Keyed by the explicit `key` string (primary) and also by constructor.name (fallback).
// Built once at module-load time so deserialize() is O(1) per node.
const nodeClassRegistry = new Map();
for (const entry of defaultNodeList) {
	// primary: explicit key string (survives minification)
	if (entry.key && !nodeClassRegistry.has(entry.key)) {
		nodeClassRegistry.set(entry.key, entry);
	}
	// fallback: constructor.name (works in dev and with keepNames in prod)
	if (!nodeClassRegistry.has(entry.class.name)) {
		nodeClassRegistry.set(entry.class.name, entry);
	}
}

// export all the things
export {
	defaultNodeList,
	nodeClassRegistry,
	
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

	GroupNode,
	GroupInputNode,
	GroupOutputNode,
};
