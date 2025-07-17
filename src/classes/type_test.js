// test_types.js

import {
	VNumber,
	VAngle,
	VInteger,
	VVector2,
	VVector3,
	VAngles,
	VColor3,
	VColor4,
	VBoolean,
	VText,
	VCharacter,
	VType
} from './Types/index.js';

import { VTypeRegistry } from './VTypeRegistry.js';

const types = [
	VNumber, VAngle, VInteger, VVector2, VVector3,
	VAngles, VColor3, VColor4, VBoolean, VText, VCharacter
];

const registry = new VTypeRegistry(types);

function logResult(fromType, toType, input, output) {
	console.log(`\n[${fromType.typeName} -> ${toType.typeName}]`);
	console.log(`Input:  ${input.toString()}`);
	console.log(`Output: ${output?.toString?.() ?? output}`);
}

function testCoalesce(fromCls, toCls, rawValue) {
	const fromInstance = new fromCls(rawValue);
	const result = registry.coalesce(fromCls, toCls, fromInstance);
	logResult(fromCls, toCls, fromInstance, result);
}

function testAll() {
	console.log("\n=== Running Type Coalescing Tests ===");

	testCoalesce(VNumber, VInteger, 5.7);
	testCoalesce(VInteger, VNumber, 42);
	testCoalesce(VNumber, VAngle, -90.25);
	testCoalesce(VAngle, VNumber, 180);
	testCoalesce(VBoolean, VInteger, true);
	testCoalesce(VNumber, VBoolean, 0);
	testCoalesce(VVector3, VNumber, { x: 1, y: 2, z: 2 });
	testCoalesce(VVector2, VVector3, { x: 1, y: 2 });
	testCoalesce(VVector3, VVector2, { x: 1, y: 2, z: 3 });
	testCoalesce(VAngles, VVector3, { x: 90, y: 45, z: 30 });
	testCoalesce(VColor3, VVector3, { r: 0.1, g: 0.2, b: 0.3 });
	testCoalesce(VColor4, VColor3, { r: 1, g: 0.5, b: 0.25, a: 0.75 });
	testCoalesce(VColor3, VColor4, { r: 1, g: 0.5, b: 0.25 });
	testCoalesce(VText, VVector3, '{"x":3,"y":4,"z":0}');
	testCoalesce(VVector3, VText, { x: 3, y: 4, z: 0 });
	testCoalesce(VText, VBoolean, "false");
	testCoalesce(VBoolean, VText, true);
	testCoalesce(VInteger, VCharacter, 65);
	testCoalesce(VCharacter, VInteger, 'A');
	testCoalesce(VCharacter, VText, 'Z');
	testCoalesce(VText, VCharacter, 'Hello');

	// Multi-hop test: Vector3 -> Float -> Integer
	const v3 = new VVector3({ x: 3, y: 4, z: 0 });
	const multiHop = registry.coalesce(VVector3, VInteger, v3);
	logResult(VVector3, VInteger, v3, multiHop);
}

testAll();
