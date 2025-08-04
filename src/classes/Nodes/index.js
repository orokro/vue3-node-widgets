/*
	index.js
	--------

	Import & provide some things for the NWEditor class.
*/

// import all our node types
import ABMathNode from './ABMathNode';
import ABCompareNode from './ABCompareNode';
import ClampValueNode from './ClampValueNode';
import MapRangeNode from './MapRangeNode';
import LerpValueNode from './LerpValueNode';
import RoundNode from './RoundNode';
import TrigNode from './TrigNode';
import RandomColorNode from './RandomColorNode';
import RandomNumberNode from './RandomNumberNode';
import ColorMixNode from './ColorMixNode';
import ColorPickerNode from './ColorPickerNode';
import AllTypesNode from './AllTypesNode';
import AllTypesOutNode from './AllTypesOutNode';

// make a reusable list of default nodes
const defaultNodeList = [
	{ class: AllTypesNode, menuPath: '/Debug' },
	{ class: AllTypesOutNode, menuPath: '/Debug/' },
	
	{ class: ABMathNode, menuPath: '/Math (Scalar)' },
	{ class: ABCompareNode, menuPath: '/Math (Scalar)' },
	{ class: RoundNode, menuPath: '/Math (Scalar)' },
	{ class: ClampValueNode, menuPath: '/Math (Scalar)' },
	{ class: LerpValueNode, menuPath: '/Math (Scalar)' },
	{ class: MapRangeNode, menuPath: '/Math (Scalar)' },	
	{ class: TrigNode, menuPath: '/Math (Scalar)' },

	{ class: RandomColorNode, menuPath: '/Math/Random/' },
	{ class: RandomNumberNode, menuPath: 'math/Random' },
	{ class: ColorMixNode, menuPath: '/Color' },
	{ class: ColorPickerNode, menuPath: '/Color' }
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
	RandomColorNode,
	RandomNumberNode,
	ColorMixNode,
	ColorPickerNode,
	AllTypesNode,
	AllTypesOutNode
};
