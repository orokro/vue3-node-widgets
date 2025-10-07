/*
	fitHelper.js
	------------

	Utility to ensure an element fits within its container or viewport bounds.
	Works with both raw HTML elements and Vue refs.
*/

// vue
import { isRef, nextTick } from 'vue';


/**
 * Ensures a target element stays fully visible inside its container (or parent if none provided).
 * It measures the element's position and size, compares it to the container,
 * and applies a CSS transform to keep it on screen.
 * 
 * @param {HTMLElement|Ref<HTMLElement>} targetEl - The target element or a Vue ref to it.
 * @param {HTMLElement|Ref<HTMLElement>} [containerEl] - Optional container or its ref. Defaults to the parent of targetEl.
 * @param {number} [padding=0] - Optional padding (in pixels) to keep between the target and container edges.
 * @returns {{ moved: boolean, x: number, y: number }} 
 * Returns an object describing how much the element was moved.
 * If no movement was needed, `moved` is false and both x/y are 0.
 */
export async function ensureFit(targetEl, containerEl, padding = 0) {

	// --- Step 1: Unwrap Vue refs if necessary -----------------------------
	targetEl = isRef(targetEl) ? targetEl.value : targetEl;
	containerEl = isRef(containerEl) ? containerEl.value : containerEl;

	if (!targetEl) {
		// console.warn('[ensureFit] No target element provided.');
		return { moved: false, x: 0, y: 0 };
	}

	// Default to parent element if container not given
	if (!containerEl) {
		containerEl = targetEl.parentElement;
	}

	if (!containerEl) {
		// console.warn('[ensureFit] No container element found or provided.');
		return { moved: false, x: 0, y: 0 };
	}

	// --- Step 2: Clear previous transform before measuring ----------------
	targetEl.style.transform = 'none';

	// --- Step 3: Wait for next DOM update ---------------------------------
	await nextTick();

	// --- Step 4: Measure both target and container ------------------------
	const containerRect = containerEl.getBoundingClientRect();
	const targetRect = targetEl.getBoundingClientRect();

	// --- Step 5: Compute overflow distances -------------------------------
	let shiftX = 0;
	let shiftY = 0;

	// Right overflow
	if (targetRect.right + padding > containerRect.right) {
		shiftX = containerRect.right - padding - targetRect.right;
	}

	// Left overflow
	if (targetRect.left - padding < containerRect.left) {
		const newShift = containerRect.left + padding - targetRect.left;
		// Choose the larger adjustment if both sides overflow
		shiftX = Math.abs(newShift) > Math.abs(shiftX) ? newShift : shiftX;
	}

	// Bottom overflow
	if (targetRect.bottom + padding > containerRect.bottom) {
		shiftY = containerRect.bottom - padding - targetRect.bottom;
	}

	// Top overflow
	if (targetRect.top - padding < containerRect.top) {
		const newShift = containerRect.top + padding - targetRect.top;
		shiftY = Math.abs(newShift) > Math.abs(shiftY) ? newShift : shiftY;
	}

	// --- Step 6: Apply correction transform -------------------------------
	if (shiftX !== 0 || shiftY !== 0) {
		targetEl.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
	}

	// --- Step 7: Return movement info -------------------------------------
	const moved = shiftX !== 0 || shiftY !== 0;
	return { moved, x: shiftX, y: shiftY };
}
