# vue3-node-widgets

A system for customizable Node-graphs that can either run logic or provide a model of the graph.
Nodes can use built-in widgets, or be completely customizable by adding your own components for the fields or nodes themselves.

Note:

If you're reading this, you're in the 'master' branch before this project was converted to a vue3 plugin.

I'm developing this system in a working vue3 project.

Later, I will move this branch to some other name, and extract just the logic for the plugin.

Once the plugin works and is on NPM, this readme will be updated and relevant.

Also note: this is for graphs, not for programming like visual scripting languages. More like shaders.


# Notes on Architecture

## NWEditor and NWEditorGraph

The fundamental heart of the system is in the `NWEditor` class. This will hold the instance of a node graph that can be displayed on on screen. the `NW` prefix stands for _"Node Widget"_ and will be present in various files and class names throughout the project.

Paired with the `NWEditor`, is the Vue component `NWEditorGraph.vue`. This component is the highest level component for the system, that shows a node graph that is pannable, zoomable, editable, etc.

The `NWEditorGraph` will instantiate it's own `NWEditor` context automatically, but one can be provided to it via props if you wish to have multiple views of the same editable graph.

The `NWEditor` has a handle of members & methods, but the most notable are:

- `graph`:
	This is an object like `{ nodes: shallowRef([]), wires: shallowRef([]) }`, and this is the heart of the state - after all an ode graph editor isn't much use without a graph.

	In this case, we have two shallowRefs of arrays storing the node instances as well as the wires (connections) between them

- `connMgr`:
	The `NWEditor` keeps an instance of `ConnectionManager`, which operates on the `graph.wires` array. The ConnectionManager handles a lot of the state logic around connecting & disconnecting nodes with wires, as well as updating the wires when nodes are moved or destroyed

- `typeRegistry`:
	The `NWEditor` can be provided a pre-instantiated `VTypeRegistry`, or will create it's own if none is provided.

	Because the nodes in the system need data types for their sockets, the `VTypeRegistry` is a critical system making sure that types can be registered into the system & converted between.

	The section on custom typing below will explain this in more detail.

- `availableNodes`:
	The last, but not least, important member of `NWEditor` is the list of `availableNodes`. This will be a list of class constructors for classes that extend `NodeWidget`

	Note that this member, `availableNodes` works in parallel with the previous item: `typeRegistry`. In order for the wires to wire between the sockets of various on-screen nodes, the types that the nodes use must be present in the `typeRegistry` instance.

	The `availableNotes` list is a `shallowRef([])` and will be the nodes that are listed in the Add Node menu.

	The list of the available nodes to use can be passed into the constructor of `NWEditor`, but nodes can also be added or removed at run time with the method `addAvailableNodes(nodesList)`


So to recap - the heard of the `vue3-node-widgets` library is the `NWEditor` class, which provides four critical elements: `graph`, `connMgr`, `typeRegistry`, and `availableNodes`. With these four pieces, we can build user-editable node graphs & wire 'em up.

---

# Types

Let's move onto the subject of types.

Types play an important role in node graphs - various nodes can have input sockets and output sockets that can be wired to and from. These sockets can have different value types, similar to any programming language.

However, in addition to primitives like Number, Integer, String, etc, it would be useful for engineers who implement a graph to also define their own types. For example, this library comes with an non primitive type called `Vector2` which holds data in the shape `{x, y}`.

In order to make a robust system where the node components can use any arbitrary types, we need a formal way to define some things related to types:

- We need a way to define the types themselves. In this case, they will be JavaScript classes that extend the base class `VType`.

- Types that extend `VType` need to provide many things such as

  - `typeName` a pretty string name to be used in the UI where this type is concerned

  - `description` another UI focused string for hinting the user on the usage of this type. Note that, these types are not TypeScript types, and meant to be user facing types for a user playing with a node graph. They are meant to be the kinds of wires & sockets available on the nodes. These are not necessarily meant to be consumed by programmers, other than the engineers building the nodes that will use these custom types.

  - `nodeWidgetComponent` a Vue component constructor to build the UI widget for this type when it's added to a Node. Note that this is technically optional, and only used if the node doesn't specify it's own custom UI.

  - `validateFn` - again, optional, but types should specify how to validate themselves

  - `lintFn` - a function to tidy up input data to a preferred format for the type. Up to the engineer

  - `compareFn` - a function to provide truthiness comparisons for this custom type

- There are other useful things to define on a custom type, but the above list is the essentials

- We also need a formal system to specify how these types can convert between each other. The base class `VType` provides a couple useful methods for dealing with type conversion (coalescence):

  - `addToCoalescer(targetType, fn)` this static method can be called on a class that extends `VType`. This will allow the engineer to provide a custom function that will be used when the node graph tries to convert from said type, to `targetType`. Note that this is a "to" Coalescer... see next method for more

  - `addFromCoalescer(sourceType, fn)` this is a sister method to the prior method. Instead of specifying how a type class should convert TO something, we can also give it a preference on how it should convert FROM another type. This way, types can specify preferred methods on how they're converted both from/to. If both types specify, the target type will be authority.

  - `getFromCoalescer(sourceType)` does that it says on the tin: returns the method that was previously specified for this from type conversion

  - `getToCoalescer(targetType)` is the same as above, but for fetching to-type functions.

## Recap

So, custom types can be made by extending the `VType` base class.

Types need to provide some critical things like `typeName`, `description`, `nodeWidgetComponent`, as well as some useful methods like `validateFn`, `lintFn`, `comparefn`.

Once a type class has been defined, static methods on it such as `addToCoalescer` and `addFromCoalescer` can be called to tell it how to convert between different types.

Note that the coalescer step is done via static methods because it needs to happen _after_ all types are defined, otherwise you would end up with a _chicken-before-the-egg_ problem when defining types. How can you specify a "To conversion" to a type that isn't defined yet? If you define that first, how can you specify it's "From conversion" from the other type that's not define yet?

Therefore, the flow would be to:

- Define all types you'll need as classes that extend `VType`
- In an `index.js` or similar file, import all the types & then build their coalescers.

# VTypeRegistry

The previous section talked about the work needed to define custom types - which will be the kinds of values that can be specified as sockets on nodes.

In order for the `vue3-node-widget` library to use those types, they need to be loaded into a `VTypeRegistry` instance. The constructor takes a list of these type class constructors and does some magic on them.

It will load all the types internally and loop over them. It will build a graph of first-order conversions: i.e. all the ways the types specify themselves how they can be converted to/from other types.

However, it's possible that the engineer designing the types did not provide pathways for all possible 'to' and 'from'. After all, that would be an (potentially) exponentially big problem. If you have 10 types, you could be a mad man and specify 180 conversions:

- For each of the 10 type, specify how to convert it TO the other 9 types
- For each of the 10 types, specify how to convert it FROM the other 9 types
- Therefore, each of the 10 type would need 18 functions
- And therefore 180 total conversions specified

Obviously this is unreasonable and pointless. Therefore, after the `VTypeRegister` "ingests" the type list with their built in coalescers, it will then automatically build a graph of second-order, composed conversions. Consider the following example:

User defines the following types, with example values:

Number: v
Vector2: {x, y}
Vector3: {x, y, z}
Color3: {r, g, b}

Then they add methods to do the following:

Number converts to Vector2 as v => {x: v, y: v}
Vector2 converts to Vector3 as v => {x: v.x, y: v.y, z: 0}
Vector3 converts to Color3 as v => {r: v.x, g: v.y, b: b.z }

The user never specified how to convert Number -> Color3

however, because there exists a chain of intermediate steps, the `VTypeRegistry` will automatically detect & cache a route like
`Number -> Vector2 -> Vector3 -> Color3`

This is the power of the `VTypeRegister` and will allow a user to connect a wire from disparate socket types & automatically convert the data. Of course, the integrity of the data during the conversion is only as good as the type author provided.

But with a well thought out type system for it's purpose, the UI should work well for the user.

# TODO: 
- Write about custom Nodes, ConnectionManager


