# vue3-node-widgets

A Vue 3 component library for building **node-graph editors** — think shader-style or blueprint-style canvas tools. Ships the editor component itself, a value-type system with multi-hop type coalescence, and a JSON AST output suitable for codegen targets like GLSL.

> **Status: 0.0.1-beta.0.** First public cut. The shader-graph use case is the load-bearing one for this release; the API is stable enough to integrate against, but expect refinement before 0.1.0.

## Install

```sh
npm install vue3-node-widgets
```

Peer dependencies:

- `vue` ^3.5 — required.
- `material-design-icons-iconfont` ^6.7 — optional, only needed if you want the built-in icons to render. The library uses CSS classes that match the iconfont; without it, icons fall back to text. Install separately and import its CSS in your app's entry.

## Quick start

The shader-graph case in one block:

```js
import { createApp } from 'vue';
import {
    createEditorState,
    NWEditorGraph,
    defaultTypes,
    defaultNodeList,
} from 'vue3-node-widgets';

import 'vue3-node-widgets/style.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css'; // optional but pretty

const editorState = createEditorState({
    types: defaultTypes,            // VNumber, VVector2/3, VColor3/4, etc. — all built-ins
    availableNodes: defaultNodeList, // ~50 built-in nodes (math, color, vector, random, texture, I/O, group)
});

createApp({
    components: { NWEditorGraph },
    template: `<NWEditorGraph :state="editorState" style="width:100%; height:100vh" />`,
    setup() { return { editorState }; },
}).mount('#app');
```

`createEditorState({})` with no args produces an *empty* editor — no types, no coalescers, no available nodes. Default-off lets you build editors for non-shader domains (audio graphs, dataflow editors) by importing only what you need or supplying entirely custom types.

## What's on `editorState`

Everything goes through the state object — consumers should never need to reach into internal classes.

```js
// Save / load
editorState.serialize()             // → JSON-safe object
editorState.deserialize(data)       // ← replaces state, resets all windows to root, clears selection

// Evaluation / export
editorState.getComputeFn()          // → per-pixel closure: ({x,y,width,height,mouseX,mouseY}) => {r,g,b}
editorState.evaluate(inputs)        // → single-shot, returns outputs object
editorState.getModel(options?)      // → JSON AST — see "The model" below

// Selection (last-touched-wins across all attached windows)
editorState.selection               // → ComputedRef<NWNode[]>
editorState.selectionCount          // → ComputedRef<Number>
editorState.activeGraph             // → ComputedRef<NWGraph>
editorState.activeGraphPath         // → ComputedRef<String[]>  breadcrumb labels
editorState.setSelection(nodes)     // throws if nodes are from different graphs
editorState.clearSelection()

// Change notification
editorState.changeVersion           // → Ref<Number>  bumps on any structural or value change

// Inspector helpers (so you stay out of node.fieldState)
editorState.getNodeInfo(node)       // → { id, type, title, icon, kind, fields[] }
editorState.getFieldBinding(node, fieldName)
                                    // → { value, setValue, valueRef, type, kind, wired, title, ... }
editorState.setFieldValue(node, fieldName, value)
```

## The model — JSON AST for codegen

`editorState.getModel()` returns a JSON-safe representation of the graph in topological order, ready to walk for codegen:

```js
{
    nodes: [
        {
            id:    'node_xyz',
            type:  'ABMath',                  // serializeKey
            kind:  'processing',              // 'input' | 'output' | 'processing' | 'group'
            fields: [
                { name: 'aValue', kind: 'input',  type: 'Number', value: 0,    wired: true  },
                { name: 'bValue', kind: 'input',  type: 'Number', value: 0,    wired: false },
                { name: 'op',     kind: 'prop',   type: 'Enum',   value: 'add' },
                { name: 'result', kind: 'output', type: 'Number' },
            ],
        },
        // …
    ],
    wires: [
        {
            id:    'wire_abc',
            from:  { nodeId: 'node_a', field: 'posV2',    type: 'Vector2' },
            to:    { nodeId: 'node_b', field: 'outColor', type: 'Color3'  },
            coalesce: {                       // null when src and dst types match
                firstOrder: false,
                hops: ['Vector2', 'Vector3', 'Color3'],
            },
        },
        // …
    ],
    order: ['node_a', 'node_x', 'node_b'],    // topological execution order
}
```

`coalesce.hops` is the chain of type-name strings the value passes through when source and destination types differ. For shader codegen, the hops tell you exactly which conversions to emit between node outputs. The hop chain comes from the type registry's pre-computed multi-hop coalescer — composition is automatic when each link defines its own first-order conversions.

> Group nodes are emitted nested in 0.0.1b — each group node carries a `subGraph` field with the recursive model. Flat-mode (inlining group contents and re-routing wires through Group I/O) is on the 0.0.2 roadmap. Pass `{ flattenGroups: false }` to silence the related warning if your graphs contain groups.

## Render-loop / live-preview pattern

Watch `changeVersion` to know when to re-call `getModel()` (or `getComputeFn()`):

```js
import { watch } from 'vue';

watch(() => editorState.changeVersion.value, () => {
    const model = editorState.getModel();
    const glsl = compileToGLSL(model);   // your codegen
    rebuildShader(glsl);
});
```

Every field edit, node add/remove, and wire add/remove bumps `changeVersion`. UI-driven widget edits flow through the same signaling path as programmatic writes.

## Multi-view sharing

Mount multiple `<NWEditorGraph>` instances against the same state. They share graph data and selection (last-touched-wins) but each has its own pan/zoom and breadcrumb position — drilling into a sub-graph in one window doesn't affect the other:

```vue
<template>
    <div class="split-view">
        <NWEditorGraph :state="state" />
        <NWEditorGraph :state="state" />
    </div>
</template>
```

This is the Blender-style use case — one window stays at root for context, another drills into a sub-graph for editing.

## Custom nodes

Extend `NWNode` to define your own:

```js
import { NWNode, NODE_TYPE, FIELD_TYPE, VNumber } from 'vue3-node-widgets';

export class MyDoubleNode extends NWNode {

    static nodeName = 'Double';
    static icon = 'close';

    static {
        this.init();
        this.setNodeType(NODE_TYPE.PROCESSING);

        this.addField(FIELD_TYPE.INPUT,  { name: 'x',      title: 'X',      type: VNumber });
        this.addField(FIELD_TYPE.OUTPUT, { name: 'result', title: 'Result', type: VNumber });

        this.setEvalFunction((inputs) => ({
            result: (inputs.x ?? 0) * 2,
        }));
    }
}
```

Then pass it (alongside the built-ins or alone) when building state:

```js
const state = createEditorState({
    types: defaultTypes,
    availableNodes: [
        ...defaultNodeList,
        { class: MyDoubleNode, menuPath: '/Custom', key: 'MyDoubleNode' },
    ],
});
```

## Fully custom node UIs

Setting a `customComponent` on a node class replaces its entire body with a Vue component of your choice — useful when the default field-row layout doesn't fit (e.g., a knob+display console, an inline SVG visualization, a hand-painted skin). The library still renders the title bar and socket dots; everything else is yours:

```js
import { NWNode, NODE_TYPE, FIELD_TYPE, VNumber } from 'vue3-node-widgets';
import MyConsoleUI from './MyConsoleUI.vue';

export class MyConsoleNode extends NWNode {

    static nodeName = 'My Console';

    static {
        this.init();
        this.setNodeType(NODE_TYPE.PROCESSING);

        // Fields still defined normally — sockets render at the matching rows.
        // Your custom component can read field state via the `node` prop.
        this.addField(FIELD_TYPE.INPUT,  { name: 'in',  title: 'In',  type: VNumber });
        this.addField(FIELD_TYPE.OUTPUT, { name: 'out', title: 'Out', type: VNumber });

        this.setCustomComponent(MyConsoleUI);
    }
}
```

For a per-FIELD custom widget instead of a per-node body, set `nodeWidgetComponent` on the value type — the Kelvin example below shows that pattern.

The two custom-UI demos shipped in `defaultNodeList` are the canonical references:

- **`ABMathKnobNode`** — example of a custom *field widget* (knob input replacing the default number input).
- **`SuperWaveNode`** — example of a fully custom *node body* (hand-painted skin with a custom oscilloscope display).

Both ship under the `/Examples` menu path and are worth digging into the source of when building your own.

## Custom types

Extend `VType` to define your own value type. Supply a default value, a Vue component for the inline widget, and any `fromCoalescers` / `toCoalescers` you want for cross-type conversion:

```js
import { VType, VNumber } from 'vue3-node-widgets';
import MyKelvinWidget from './MyKelvinWidget.vue';

export class VKelvin extends VType {
    static {
        this.init();
        this.addFromCoalescer(VNumber, (val) => val?.value); // VNumber → VKelvin
        this.addToCoalescer(VNumber,   (val) => val?.value); // VKelvin → VNumber
    }
    static typeName = 'Kelvin';
    static themeColor = '#ff8a4c';
    static defaultValue = 6500;
    static nodeWidgetComponent = MyKelvinWidget;
}
```

Then add it to your state — composed conversion paths through other types appear automatically:

```js
const state = createEditorState({
    types: [...defaultTypes, VKelvin],
    availableNodes: [...defaultNodeList],
});
```

Because `VKelvin ↔ VNumber` is registered, anything reachable from `VNumber` (Integer, Boolean, Text, etc.) also coalesces through it.

## Theming

`<NWEditorGraph>` accepts a `:theme` prop — an object whose keys map to CSS variables driving the editor's appearance:

```vue
<NWEditorGraph :state="state" :theme="{
    nodeBodyBGColor: '#222',
    nodeOutlineColor: '#6cf',
    wireColor: 'orange',
    /* … */
}" />
```

The full set of theme keys is documented in the source of `NWStyle.vue`.

## Reference integration

The repository ships a test harness that exercises the public API exactly as a consumer would write it. After cloning:

```sh
npm install
npm run dev
```

Then visit `http://localhost:5173/harness.html`. The harness mounts two `<NWEditorGraph>` instances against a shared state, has a sidebar inspector that uses `getNodeInfo` / `getFieldBinding`, and toolbar buttons for `getModel` / `evaluate` / serialize-roundtrip. It's the shortest path to seeing how the pieces fit.

## Beta notes / known limitations

- `getModel({ flattenGroups: true })` (default) emits group nodes nested with a `subGraph` field rather than inlining their contents. Flat-mode is 0.0.2 work.
- `evaluate(inputs)` and `getComputeFn()` have different I/O shapes by design (single-shot mutating vs. per-pixel pure closure). Unifying them is a 0.0.2 consideration; if you only need one, use the matching one.
- No undo/redo yet. Undo via Command pattern is on the post-0.1.0 roadmap.

## License

MIT — see [LICENSE](./LICENSE).
