/*
	InputCartesianCoordNode.js
	--------------------------

	So this node is a bit more specific than others.
	Part of this project will be to provide a demo for rendering graphics on a canvas.
	I will be recreating a project from 2014.

	Specifically, this node will provide info about the pixel being painted,
	specifically the X and Y coordinates of the pixel.

	It can also specify if it's relative to the mouse or the canvas.
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
export default class InputCartesianCoords extends NWNode {

	// static properties for the class
	static nodeName = 'Cartesian Coords';
	static icon = 'input';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.INPUT);

		this.addField(FIELD_TYPE.PROP, { 
			name: 'mouseCentric',
			title: 'Centered on Mouse', 
			description: "If true, coordinates are relative to mouse position. If false, relative to center of canvas.",
			type: VBoolean,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'posV2',
			title: 'Pixel X, Y as Vector2', 
			description: "Pixel X and Y as Vector2",
			type: VVector2,
		});	
	
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'xPos',
			title: 'X',
			description: "X Position",
			type: VInteger
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'yPos',
			title: 'Y',
			description: "Y Position",
			type: VInteger
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'u',
			title: 'U (0→1)',
			description: "Normalized horizontal position: 0 at left edge, 1 at right edge. Ignores centering.",
			type: VNumber
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'v',
			title: 'V (0→1)',
			description: "Normalized vertical position: 0 at top edge, 1 at bottom edge. Ignores centering.",
			type: VNumber
		});

		// Evaluation function: converts canvas pixel coordinates into
		// cartesian coordinates, either canvas-centered or mouse-centered.
		// ctx = { x, y, width, height, mouseX, mouseY }
		this.setEvalFunction((inputs, ctx) => {
			const mouseCentric = inputs.mouseCentric || false;
			const px = ctx?.x ?? 0;
			const py = ctx?.y ?? 0;
			const w  = ctx?.width  ?? 1;
			const h  = ctx?.height ?? 1;
			const originX = mouseCentric ? (ctx?.mouseX ?? 0) : w / 2;
			const originY = mouseCentric ? (ctx?.mouseY ?? 0) : h / 2;
			const rx = px - originX;
			const ry = py - originY;
			return {
				posV2: { x: rx, y: ry },
				xPos:  Math.round(rx),
				yPos:  Math.round(ry),
				u: w > 0 ? px / w : 0,
				v: h > 0 ? py / h : 0,
			};
		});
	}

	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
