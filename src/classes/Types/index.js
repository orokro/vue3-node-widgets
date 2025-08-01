// Central export and coalescer registry for all built-in types

// Import all again locally for wiring coalescers
import { VNumber } from './VNumber.js';
import { VAngle } from './VAngle.js';
import { VInteger } from './VInteger.js';
import { VVector2 } from './VVector2.js';
import { VVector3 } from './VVector3.js';
import { VAngles } from './VAngles.js';
import { VColor3 } from './VColor3.js';
import { VColor4 } from './VColor4.js';
import { VBoolean } from './VBoolean.js';
import { VText } from './VText.js';
import { VCharacter } from './VCharacter.js';
import { VEnum } from './VEnum.js';
import VType from '../VType.js';

// Register cross-type coalescers

VNumber.addFromCoalescer(VBoolean, (val) => val?.value ? 1.0 : 0.0);
VNumber.addFromCoalescer(VText, (val) => {
	const parsed = parseFloat(val?.value);
	return isNaN(parsed) ? undefined : parsed;
});

VAngle.addFromCoalescer(VNumber, (val) => val?.value);
VAngle.addToCoalescer(VNumber, (val) => val?.value);

VInteger.addFromCoalescer(VNumber, (val) => Math.round(val?.value));
VInteger.addFromCoalescer(VCharacter, (val) => val?.value?.charCodeAt?.(0));
VInteger.addFromCoalescer(VBoolean, (val) => val?.value ? 1 : 0);
VInteger.addFromCoalescer(VText, (val) => {
	const parsed = parseInt(val?.value, 10);
	return isNaN(parsed) ? undefined : parsed;
});
VInteger.addToCoalescer(VNumber, (val) => parseFloat(val?.value));
VInteger.addToCoalescer(VCharacter, (val) => typeof val?.value === 'number' ? String.fromCharCode(val.value) : undefined);

VVector2.addFromCoalescer(VVector3, (val) => ({ x: val?.value?.x, y: val?.value?.y }));
VVector2.addFromCoalescer(VText, (val) => {
	try {
		const obj = JSON.parse(val?.value);
		if (typeof obj.x === 'number' && typeof obj.y === 'number') return obj;
	} catch {}
	return undefined;
});
VVector2.addToCoalescer(VNumber, (val) => {
	const v = val?.value;
	return v ? Math.sqrt(v.x ** 2 + v.y ** 2) : undefined;
});

VVector3.addFromCoalescer(VVector2, (val) => ({ x: val?.value?.x, y: val?.value?.y, z: 0 }));
VVector3.addFromCoalescer(VColor3, (val) => ({ x: val?.value?.r, y: val?.value?.g, z: val?.value?.b }));
VVector3.addFromCoalescer(VText, (val) => {
	try {
		const obj = JSON.parse(val?.value);
		if (typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.z === 'number') return obj;
	} catch {}
	return undefined;
});
VVector3.addToCoalescer(VNumber, (val) => {
	const v = val?.value;
	return v ? Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2) : undefined;
});
VVector3.addToCoalescer(VColor3, (val) => ({ r: val?.value?.x, g: val?.value?.y, b: val?.value?.z }));

VAngles.addFromCoalescer(VVector3, (val) => val?.value);
VAngles.addToCoalescer(VVector3, (val) => val?.value);

VColor3.addFromCoalescer(VVector3, (val) => ({ r: val?.value?.x, g: val?.value?.y, b: val?.value?.z }));
VColor3.addFromCoalescer(VColor4, (val) => ({ r: val?.value?.r, g: val?.value?.g, b: val?.value?.b }));
VColor3.addFromCoalescer(VText, (val) => {
	try {
		const obj = JSON.parse(val?.value);
		if (typeof obj.r === 'number' && typeof obj.g === 'number' && typeof obj.b === 'number') return obj;
	} catch {}
	return undefined;
});
VColor3.addToCoalescer(VVector3, (val) => ({ x: val?.value?.r, y: val?.value?.g, z: val?.value?.b }));
VColor3.addToCoalescer(VColor4, (val) => ({ r: val?.value?.r, g: val?.value?.g, b: val?.value?.b, a: 1.0 }));

VColor4.addFromCoalescer(VColor3, (val) => ({ r: val?.value?.r, g: val?.value?.g, b: val?.value?.b, a: 1.0 }));
VColor4.addFromCoalescer(VText, (val) => {
	try {
		const obj = JSON.parse(val?.value);
		if (typeof obj.r === 'number' && typeof obj.g === 'number' && typeof obj.b === 'number' && typeof obj.a === 'number') return obj;
	} catch {}
	return undefined;
});
VColor4.addToCoalescer(VColor3, (val) => ({ r: val?.value?.r, g: val?.value?.g, b: val?.value?.b }));

VBoolean.addFromCoalescer(VInteger, (val) => val?.value !== 0);
VBoolean.addFromCoalescer(VNumber, (val) => val?.value !== 0);
VBoolean.addFromCoalescer(VText, (val) => {
	if (typeof val?.value !== 'string') return true;
	const lower = val.value.toLowerCase();
	return !(val.value === '' || lower === 'false' || lower === '0' || lower === '0.0');
});
VBoolean.addToCoalescer(VInteger, (val) => val?.value ? 1 : 0);
VBoolean.addToCoalescer(VText, (val) => JSON.stringify(val?.value));

VCharacter.addFromCoalescer(VInteger, (val) => typeof val?.value === 'number' ? String.fromCharCode(val.value) : undefined);
VCharacter.addFromCoalescer(VText, (val) => typeof val?.value === 'string' ? val.value.charAt(0) : undefined);
VCharacter.addToCoalescer(VInteger, (val) => val?.value?.charCodeAt?.(0));
VCharacter.addToCoalescer(VText, (val) => val?.value);

VText.addFromCoalescer(VCharacter, (val) => val?.value);
VText.addFromCoalescer(VType, (val) => JSON.stringify(val?.value ?? val));
VText.addFromCoalescer(VVector2, (val) => JSON.stringify(val?.value));
VText.addFromCoalescer(VVector3, (val) => JSON.stringify(val?.value));
VText.addFromCoalescer(VColor3, (val) => JSON.stringify(val?.value));
VText.addFromCoalescer(VColor4, (val) => JSON.stringify(val?.value));
VText.addToCoalescer(VCharacter, (val) => typeof val?.value === 'string' ? val.value.charAt(0) : undefined);

// Export all types for external use
export {
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
	VEnum,
	VType
};
