// type_test.js
// Run with: node type_test.js

import { VTypeRegistry } from './VTypeRegistry.js';
import { VFloat } from './Types/VFloat.js';
import { VInt } from './Types/VInt.js';
import { VVector2 } from './Types/VVector2.js';
import { VColor } from './Types/VColor.js';

function logTest(title, fn) {
	try {
		fn();
		console.log(`✔️  ${title}`);
	} catch (e) {
		console.error(`❌  ${title}`);
		console.error(e);
	}
}

// Register types
const registry = new VTypeRegistry([
	VFloat,
	VInt,
	VVector2,
	VColor
]);

// TEST CASES
logTest("Can coalesce Float -> Int", () => {
	if (!registry.canCoalesce(VFloat, VInt)) throw new Error("Missing coalescer");
	const result = registry.coalesce(VFloat, VInt, 3.6);
	if (result !== 4) throw new Error(`Expected 4, got ${result}`);
});

logTest("Can coalesce Int -> Float", () => {
	if (!registry.canCoalesce(VInt, VFloat)) throw new Error("Missing coalescer");
	const result = registry.coalesce(VInt, VFloat, 5);
	if (result !== 5.0) throw new Error(`Expected 5.0, got ${result}`);
});

logTest("Can coalesce Vector2 -> Float (average)", () => {
	const vec = { x: 4, y: 6 };
	const result = registry.coalesce(VVector2, VFloat, vec);
	if (result !== 5) throw new Error(`Expected 5, got ${result}`);
});

logTest("Can coalesce Vector2 -> Color (composed)", () => {
	const vec = { x: 0.2, y: 0.4 };
	const result = registry.coalesce(VVector2, VColor, vec);
	if (typeof result !== 'string' || !result.startsWith('#')) {
		throw new Error(`Expected color hex, got ${result}`);
	}
});

logTest("Check metadata reliability score for composed path", () => {
	const meta = registry.getMetadata(VVector2, VColor);
	if (!meta) throw new Error("Missing metadata");
	if (meta.firstOrder) throw new Error("Should be composed");
	if (meta.reliability < 2) throw new Error(`Expected reliability >= 2, got ${meta.reliability}`);
});

logTest("Fails when no coalescer exists", () => {
	try {
		registry.coalesce(VColor, VVector2, '#ffffff');
		throw new Error("Should have thrown");
	} catch (e) {
		if (!/No coalescer/.test(e.message)) throw e;
	}
});
