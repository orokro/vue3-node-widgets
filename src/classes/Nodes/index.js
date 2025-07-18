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

// make a reusalbe list of default nodes
const defaultNodeList = [

	{ class: ABMathNode, menuPath: '/Math' },
	{ class: MapRangeNode, menuPath: '/Math' },
	{ class: RoundNode, menuPath: '/Math' },
	{ class: TrigNode, menuPath: '/Math' },
	{ class: RandomColorNode, menuPath: '/Random' },
	{ class: RandomNumberNode, menuPath: '/Random' },
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
	ColorPickerNode
};
