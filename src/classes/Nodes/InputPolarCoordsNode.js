/*
	InputPolarCoordsNode.js
	-----------------------

	So this node is a bit more specific than others.
	Part of this project will be to provide a demo for rendering graphics on a canvas.
	I will be recreating a project from 2014.

	Specifically, this node will provide info about the pixel being painted,
	specifically the Theta (angle) and Radius (distance from center).

	It can also specify if it's relative to the mouse or the center of the canvas.
*/

import NWNode from '../NWNode.js';
import { NODE_TYPE, FIELD_TYPE } from '../NWNode.js';
import { 
	VAngle,
	VAngles,
	VBoolean,
	VCharacter,
	VColor3,
	VColor4,
	VInteger,
	VNumber,
	VText,
	VVector2,
	VVector3,
	VEnum,
 } from '../Types/index.js';
 
// main export
export default class InputPolarCoords extends NWNode {

	// static properties for the class
	static nodeName = 'Polar Coords';
	static icon = 'input';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.INPUT);
	
		this.addField(FIELD_TYPE.PROP, { 
			name: 'degrees',
			title: 'Angle Format', 
			description: "Use Degrees? If false, radians will be used",
			type: VBoolean.OnLabel('Deg').OffLabel('Rad'),
		});	

		this.addField(FIELD_TYPE.PROP, { 
			name: 'mouseCentric',
			title: 'Centered on Mouse', 
			description: "If true, coordinates are relative to mouse position. If false, relative to center of canvas.",
			type: VBoolean,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'theta',
			title: 'Theta',
			description: "Angle from Center",
			type: VNumber
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'radius',
			title: 'Radius',
			description: "Distance from Center",
			type: VNumber
		});
	}
	

	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);

		this.fieldState.degrees.val = true;
	}

}
