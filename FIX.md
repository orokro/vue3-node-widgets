# vue3-node-widgets — `validateFn is not a function` on PROP fields

## Symptom

When a node carries a `FIELD_TYPE.PROP` field whose widget is `NVNumberWidget` or `NVIntegerWidget`, typing or otherwise editing the prop value throws:

```
Uncaught TypeError: e.field.validateFn is not a function
    at Proxy.validate (vue3-node-widgets.js:1769)
    at isValidValue        (vue3-node-widgets.js:1641)
    at changeValue         (vue3-node-widgets.js:1655)
```

Reproduces against any consumer node that does:

```js
this.addField(FIELD_TYPE.PROP, {
    name: 'val',
    title: 'Value',
    type:  VNumber,    // or VInteger
});
```

## Why

`NWNode.addField` (in `src/classes/NWNode.js`) builds the field descriptor object differently per `fieldType`. For `INPUT` and `OUTPUT` the descriptor includes:

```js
validateFn: options.validateFn,
lintFn:    options.lintFn,
```

…but the `PROP` case (~line 474 in current source) omits both:

```js
case FIELD_TYPE.PROP:
    const propDef = {
        ...baseField,
        valueType:   options.type,
        title:       options.title,
        description: options.description,
        align:       options.align,
        // ← validateFn / lintFn missing
    };
    ...
```

PROP fields render the same widgets as INPUT fields. The number / integer widgets call `props.field.validateFn(value)` directly:

- `src/components/TypeWidgets/NVNumberWidget.vue` line 106
- `src/components/TypeWidgets/NVIntegerWidget.vue` line 104

…so when the descriptor doesn't carry the function, the widget throws on the first edit. Boolean / Color / Vector2 widgets happen to not call `field.validateFn`, which is why those PROP types appear to work. It's still wrong for them too — wired up custom `validateFn` / `lintFn` from the consumer would silently be discarded.

## Fix

In `src/classes/NWNode.js`, change the `FIELD_TYPE.PROP` case of `addField` to include `validateFn` and `lintFn` from options. The default fallbacks already live on `options` (`options.validateFn` defaults to `(value) => true`, `options.lintFn` to `(value) => value`), so no extra defaulting is needed here.

```js
case FIELD_TYPE.PROP:

    const propDef = {
        ...baseField,
        valueType:   options.type,
        title:       options.title,
        description: options.description,
        align:       options.align,
        // ↓↓↓ ADD THESE TWO LINES ↓↓↓
        validateFn:  options.validateFn,
        lintFn:      options.lintFn,
    };

    this.fields.push(propDef);
    break;
```

## Test

After the patch, build the library, reinstall in a consumer, and type into a `Number Const` / `Integer Const` node's value field. No console error; value updates and round-trips through `editorState.getModel()` / save-load cleanly.

## Notes

- No public-API change. The PROP descriptor gains two functions that the rest of the library already expects.
- Saved graphs that pre-date the fix continue to load — `validateFn` / `lintFn` are recomputed at construction time, not serialized.
- If you ship this with the next bump, consumers that were silently dropping their custom `validateFn` / `lintFn` on PROP fields will start getting them honored. That's the intended behaviour but worth noting in the changelog.


---


# vue3-node-widgets — `nodeClassRegistry` not exported from main entry

## Symptom

Saved graphs that contain consumer-supplied custom node classes (any node passed via `createEditorState({ availableNodes: [...] })` that isn't part of the library's own `defaultNodeList`) lose those nodes when the graph is reloaded from disk. The library logs:

```
Could not find node class for key: "TimeInputNode"
Could not find node class for key: "OutputColorAlphaNode"
...
Could not find nodes for wire: wire_<id>
Could not find nodes for wire: wire_<id>
```

Wires referencing those nodes are dropped too, because the wire-resolution pass runs after node instantiation.

## Why

`NWGraph.deserialize` (around line 618) resolves saved nodes via the module-scoped Map:

```js
import { defaultNodeList, nodeClassRegistry } from './Nodes/index.js';
```

That Map is built **once** at library-module-load time from `defaultNodeList`:

```js
const nodeClassRegistry = new Map();
for (const entry of defaultNodeList) {
    if (entry.key && \!nodeClassRegistry.has(entry.key)) {
        nodeClassRegistry.set(entry.key, entry);
    }
    if (\!nodeClassRegistry.has(entry.class.name)) {
        nodeClassRegistry.set(entry.class.name, entry);
    }
}
```

Custom node classes that consumers pass via `createEditorState({ availableNodes })` go into the editor state's local `availableNodes` field (used for the add-node menu and interactive node construction) but are NEVER visible to this global Map — so they're invisible to the deserialize path.

The library's own `src/index.js` also doesn't re-export `nodeClassRegistry`, so consumers can't even register their custom classes there as a workaround. The only thing that works today is to monkey-patch via the package's deep import path — fragile and bypasses the package's "consumer contract" comment at the top of `src/index.js`.

## Fix

Add a single re-export to `src/index.js` (right next to the existing `defaultNodeList` export):

```js
// In src/index.js, near the bottom:
export { nodeClassRegistry } from './classes/Nodes/index.js';
```

That's the whole library-side change. Build + republish, bump consumers.

Consumers can then register their custom nodes at module-load time:

```js
// in the consumer's setup file, alongside createEditorState's availableNodes config:
import { nodeClassRegistry } from 'vue3-node-widgets';

const customNodes = [
  { class: TimeInputNode,        menuPath: '/Input',  key: 'TimeInputNode' },
  { class: OutputColorAlphaNode, menuPath: '/Output', key: 'OutputColorAlphaNode' },
  // ...
];

for (const entry of customNodes) {
  if (entry.key && \!nodeClassRegistry.has(entry.key)) {
    nodeClassRegistry.set(entry.key, entry);
  }
  if (entry.class?.name && \!nodeClassRegistry.has(entry.class.name)) {
    nodeClassRegistry.set(entry.class.name, entry);
  }
}
```

Idempotent guards via `\!has(...)` mean the loop is HMR-safe and tolerates being run more than once.

## Test

After the patch, build the library, reinstall in a consumer that ships custom nodes, save a graph that uses one, reload from disk. Custom nodes should reconstruct alongside library defaults; no "Could not find" warnings; wires connecting customs should resolve.

## Future improvement (not part of this fix)

A cleaner long-term API would let `createEditorState({ availableNodes })` ALSO register those nodes into the global registry (or, even better, into a per-state registry that the deserialize path can fall through to). The global-registry workaround above is what consumers can do today; a future minor version could deprecate it in favor of the per-state form. The patch in this section is purely additive — re-exposing what already exists internally — so it doesn't preclude the better API later.
