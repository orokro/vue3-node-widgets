/*
	NWGraph.js
	----------

	Historical note:
	Originally part of NWEditor.js, split out for clarity and separation of concerns.

	Basically, the list of wires (connections) and instantiated nodes (boxes) that make up the graph,
	were originally in a root object called graph, like { nodes: [], wires: [] }.

	But, if I want to be able to have node groups, it makes sense to store graphs as a more
	smaller atomic unit, so I can have a graph that contains nodes and wires, and then
	another graph that contains nodes and wires, and so on.

	Therefore, graphs will have their own connection manager,
	but they'll still share the same type registry and available nodes list.
*/

// vue
import { ref, shallowRef, reactive } from 'vue';

// our app
import { ConnectionManager } from './ConnectionManager';

// external libs/misc
import t from 'typical';

// main export
export class NWGraph {

	/**
	 * Constructs a new NWGraph instance.
	 */
	constructor() {

		// our list of instantiated nodes and connections
		this.nodes = shallowRef([]);
		this.wires = shallowRef([]);

		// make new manager for our connections in this graph specifically
		// (previously we had a global one in NWEditor, but this makes more sense for node groups)
		this.connMgr = new ConnectionManager(this);
	}


	/**
	 * Adds a node to our graph at the specified position.
	 * 
	 * @param {Function} nodeClass - The class of the node to add.
	 * @param {Number} x - The x position to add the node at.
	 * @param {Number} y - The y position to add the node at.
	 * @param {String|null} slug - An optional slug to assign to the node.
	 * @returns {NWNode} - The newly created node.
	 */
	addNode(nodeClass, x = 0, y = 0, slug = null) {

		// // if x and y are 0, use the current menu position
		// if (x === 0 && y === 0) {
		// 	x = this.poop.menuX.value;
		// 	y = this.poop.menuY.value;
		// }

		// // now using the pan & zoom values, adjust the x and y positions
		// x = (x - this.poop.panX.value) / this.poop.zoomScale.value;
		// y = (y - this.poop.panY.value) / this.poop.zoomScale.value;

		// // hide the menu if it's open
		// if (this.poop.showMenu.value)
		// 	this.poop.showMenu.value = false;

		let newNode = null;

		// if we were passed in a class, instantiate it
		if (t.isClass(nodeClass)) {
			newNode = new nodeClass();
		}

		// if we were passed in an object, instantiate the class from the object
		else if (t.isObject(nodeClass) && t.isDefined(nodeClass.class)) {
			newNode = new nodeClass.class();
		}

		// set the position of the node
		newNode.setPosition(x, y);

		// if we got a slug
		if (t.isDefined(slug) && t.isString(slug)) {
			newNode.slug = slug;
		}

		// add the node to our graph
		this.nodes.value = [...this.nodes.value, newNode];

		return newNode;
	}


	/**
	 * Finds a node by its slug.
	 * 
	 * @param {String} slug - The slug of the node to find.
	 * @returns {NWNode|null} - The node with the specified slug, or null if not found.
	 */
	findNodeBySlug(slug) {

		// if we were passed in a slug, find the node by slug
		if (t.isDefined(slug) && t.isString(slug)) {
			return this.nodes.value.find(n => n.slug === slug);
		}

		// if we weren't passed in a slug, return null
		return null;
	}


	/**
	 * Removes a node from the graph.
	 * @param {*} nodeOrNodeID - The node or node ID to remove.
	 * @returns {Boolean} - True if the node was removed, false otherwise.
	 */
	removeNode(nodeOrNodeID) {

		// find the node by id or reference
		const node = t.isDefined(nodeOrNodeID) ? this.nodes.value.find(n => n.id === nodeOrNodeID || n === nodeOrNodeID) : null;

		// if we found the node, remove it
		if (node) {

			// delete the node
			this.nodes.value = this.nodes.value.filter(n => n !== node);

			// break any connections this node may have
			this.connMgr.breakConnectionsByNode(node);
			return true;
		}

		// if we didn't find the node, return false
		return false;
	}

}

