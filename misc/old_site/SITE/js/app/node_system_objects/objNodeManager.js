/*
	What is the purpose of this file?

	This file defines an object which is responsbile for things like keeping track of all the nodes in the scene, adding and removing them

*/

//the main node manager for all the nodes in the current set up
//NOTE: this object doesn't use prototyping because only one exists at a time.
//no need for the extra headache.
//The main purpose, therefore, is for name spacing
var nodeManager = new function(){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//count for node IDs
		this.mvarNodeIDCounter = 0;

		//keep an array of all nodes in the systme
		this.mvarNodes = [];



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//it's important that we don't try to build this until the document has loaded
		//wait for the document to be ready
		$(document).ready(function(){

			


		});//document is ready



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS

		//add a node into the system
		this.createNode = function(nodeClassReference, nodeCreationProperties){

			//get a new ID
			var newID = this.mvarNodeIDCounter++;

			//save new id to the properties
			nodeCreationProperties.newID = newID;

			//create the node
			var newNode = new nodeClassReference(nodeCreationProperties);

			//save the new node to our list of nodes
			me.mvarNodes[newID] = newNode;

			//return the ID of the node created
			return newID;

		}//createNode(nodeClassReference, nodeCreationProperties)

		//delete a node from the system
		this.deleteNode = function(nodeID){

			//tell the wire manage to delete all connections with this node in them
			nodeWireHandler.deleteConnectionsByNodeID(nodeID);

			//get local node reference
			var node = this.mvarNodes[nodeID].NODE;

			//unbind all events from this nodes dom...
			node.mvarDOM.find('*').unbind();

			//remove all the HTML for the node
			node.mvarDOM.remove();

			//set the node to null in our array.
			//node, we can just slice it out, because in this array the ID of the node is the index.
			//we cant slive it out or it would affect all the other ids.
			//I should make this better some day. Oh well. live and learn.
			me.mvarNodes[nodeID] = null;

		}//deleteNode(nodeID)


}//object nodeManager()