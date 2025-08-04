/*
	index.js
	--------

	Import & provide some things for the NWEditor class.
*/

// import all our node types
import ABMathNode from './ABMathNode';
import MapRangeNode from './MapRangeNode';
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
	{ class: AllTypesOutNode, menuPath: '/Debug/Outputs' },
	{ class: ABMathNode, menuPath: '/Math' },
	{ class: MapRangeNode, menuPath: '/Math' },
	{ class: RoundNode, menuPath: '/Math' },
	{ class: TrigNode, menuPath: '/Math' },
	{ class: RandomColorNode, menuPath: '/Math/Random/' },
	{ class: RandomNumberNode, menuPath: 'math/Random' },
	{ class: ColorMixNode, menuPath: '/Color' },
	{ class: ColorPickerNode, menuPath: '/Color' }
];

// export all the things
export { 
	defaultNodeList,
	ABMathNode,
	MapRangeNode,
	RoundNode,
	TrigNode,
	RandomColorNode,
	RandomNumberNode,
	ColorMixNode,
	ColorPickerNode,
	AllTypesNode,
	AllTypesOutNode
};
