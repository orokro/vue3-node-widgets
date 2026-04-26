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
