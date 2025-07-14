/*
	What is the purpose of this file?

	This file defines an singleton object reponsible for creating a pop-up menu with node creation items

*/

//the main node creation menu
//NOTE: this object doesn't use prototyping because only one exists at a time.
//no need for the extra headache.
//The main purpose, therefore, is for name spacing
var nodeCreationMenu = new function(){

	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES
	//MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES +++ MEMBER VARIABLES

		//for scope resolution and such
		var me = this;

		//list a tree-style nested object of menu items
		this.mvarMenuItems = {'name':'main', 'type':'menu', 'items':[]};

		//a linear array of search items for the search engine
		this.mvarSearchList = [];

		//reference to our DOM element
		this.mvarDOM = null;

		//keep track if the menu is currently visible
		this.mvarIsShown = false;

		//keep track of the curren't "selected" search result, so
		//the user can use the UP / DOWN arrow keys for selection a search result instead
		//of using the mouse
		//NOTE: -1 means nothing is selected
		this.mvarCurrentSearchResultSelected = -1;

		//keep track of the number of search results for any query
		this.mvarSResultsTotal = 0;



	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION
	//CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION +++ CONSTRUCTION

		//it's important that we don't try to build this until the document has loaded
		//wait for the document to be ready
		$(document).ready(function(){

			//we need to add the HTML to the document that will be the menu
			$('#divNodeEditor').append('<div id="divNodeCreationMenu"><div class="searchBar"><input type="text" placeholder="search for a node..."></input></div><div class="searchResults"></div><div class="menuItems"><div class="nodeCreationMenuHeader"><i>Creation Menu:</i></div></div></div>');

			//get a reference to our dom element so we don't have to query each time
			me.mvarDOM = $('#divNodeCreationMenu');

			//get a couple more handle DOM references
			me.mvarSearchResultsDOM = me.mvarDOM.find('.searchResults');
			me.mvarMenuDOM = me.mvarDOM.find('.menuItems');

			//now that we have the dom element, we can build the menu items (that should have already been registered)
			me.buildMenuHTML(me.mvarMenuItems, me.mvarDOM.find('.menuItems'), true);

			//set up an event handler to show the menu when certain keys are pressed
			$(document).keyup(function(event){ 

				//dont show the menus when focused on inputs (where you would normally be typing)
				if ($(event.target).is('input, textarea'))
		            return;   

				//if the key is spacebar (32), or shift+a (65) then show the menu!
				if(event.keyCode == 32 || event.keyCode == 65) 
					me.showMenu();

				//if the key is escape, hide the menu
				if(me.mvarIsShown && event.keyCode == 27)
					me.hideMenu();
			} );

			//add a click event to the main node editor. This will be used to hide the menu if it's visible
			$('#divNodeEditor').click(function(){ if(me.mvarIsShown) me.hideMenu();});

			//prevent bubbling
			me.mvarDOM.click(function(){return false;});

			//add an event for the search box, so we can handle search results
			me.mvarDOM.find('.searchBar input').keyup(me.handleSearch);

		});//document is ready



	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS
	//METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS +++ METHODS

		//do a search!
		this.handleSearch = function(event){

			//if the key is escape, hide the menu
			if(me.mvarIsShown && event.keyCode == 27){
				me.hideMenu();
				return false;
			}
			
			//before we do the regular search duties, there's something else to check.
			//if the KeyPress was up - or - down on the keyboard, then isntead of doing a search
			//we should increment / decrement the "selected" search result from the current results
			if(event.keyCode==38 || event.keyCode==40){

				//if up key was pressed, decrement the "selected item" counter
				if(event.keyCode==38)
					me.mvarCurrentSearchResultSelected--;
				else
					me.mvarCurrentSearchResultSelected++;

				//make sure it's within a valid range
				if(me.mvarCurrentSearchResultSelected<0)
					me.mvarCurrentSearchResultSelected=0;
				if(me.mvarCurrentSearchResultSelected >= me.mvarSResultsTotal)
					me.mvarCurrentSearchResultSelected = (me.mvarSResultsTotal-1);

				//remove the selection class from all search results
				me.mvarDOM.find('.searchItem').removeClass('nodeCreationMenuItemSelected');

				//add the class just to the one we care about
				$(me.mvarDOM.find('.searchItem')[me.mvarCurrentSearchResultSelected]).addClass('nodeCreationMenuItemSelected');

				//return, since there wasn't a change to the search
				//also, return false because we don't want the up and down arrows to move the text-caret and returning false is the same as prevent default.
				event.preventDefault();
				return false;
			}//end if arrow keys

			//get the value of the search box
			var query = $(this).val();

			//if the value is empty, then the search box has been cleared.
			//all we should do is hide the search results, show the regular menu
			//and exit
			if(query===''){

				//hide search results.
				me.mvarSearchResultsDOM.hide();
				
				//show regular menu
				me.mvarMenuDOM.show();

				//bizzounce
				return;
			}//end if empty query

			//otherwise, we should do a search!
			
			//first let's hide the normal menu items and show the search results
			me.mvarMenuDOM.hide();
			me.mvarSearchResultsDOM.show();

			//since we're oding a new search, no search item should be selected
			me.mvarCurrentSearchResultSelected = -1;

			//let's start the search process by breaking the query into it's keywords
			var keywords = query.split(' ');

			//now we need to loop over our linear array of searchable items and check for keywords
			//but before we do that, one important thing:
			//we want the search results to be sorted by matches. So if you have two keywords,
			//results that match both keywords should be listed before results that only match one.
			//to do this, we'll build an array will mostly null values.
			//then when we determine how many matches a result has, we'll store it to that INDEX in the array
			//so items under index 3 will have 3 matches...
			//because we'll end up with an array that may have holes in it, we'll need to keep track of the highest
			//number of matches for the search. This way when we're done we'll know the maximum for the loop

			//maximum matches found for any one item
			var maxMatches = 0;

			//two dimensional array of matches
			//where the index of the top-level array is the number of matches
			var matches = [];

			//loop thru search array and check for matches
			for(var i=0; i<me.mvarSearchList.length; i++){

				//get this search item
				var searchItem = me.mvarSearchList[i];

				//loop thru keywords and see how many match
				var matchCount = 0;
				for(var k=0; k<keywords.length; k++){

					//get the keyword
					var keyw = keywords[k].toUpperCase();

					//check if this item has this keyword and increment the match count if it does
					if(searchItem.keywords.toUpperCase().indexOf(keyw) != -1)
						matchCount++;

				}//next k

				//if there were no matches, no need to report this searchItem
				//however, if there was a match we should store it in our matches[] array
				if(matchCount > 0){

					//if this match count is higher than our previous total, let's update our previous total
					if(matchCount > maxMatches)
						maxMatches = matchCount;

					//if our array of matches doesn't have anything for this index defeined yet, create a new array
					if(typeof matches[matchCount] === 'undefined')
						matches[matchCount] = [];

					//add this search item to the array of matches
					matches[matchCount].push(searchItem);

				}//end if has a match or more

			}//next i

			//now that we've checked all our search items, we will have a strangely formatted multidimensional array
			//the index number on the top level array will reflect how many keyword matches those search items had.
			//it's sub-array will be a list of the search results that match.
			//however, its entirely possible to have an array of single matches, and an array of tripple matches
			//but no double matches.
			/*This means our array might have "holes" in it, like this: 
																			[
																				[match, match],
																				undefined,
																				[match, match, match, match, match],
																				undefined,
																				undefined,
																				[match]
																			]
			*/
			//so to build the HTML for the search results,
			//we have to loop over this array and check to make sure an element is defined.
			//if it is, we will loop over those it's child elements and make the HTML
			//note, we are also going in reverse order because we want the most matches to be ontop

			//before we clear the previous search results, we should unbind any events we binded to them
			//I think this is required to prevent memory leaks of event handlers building up
			me.mvarSearchResultsDOM.find('.searchItem').unbind();

			//before we loop, let's clear our search results box
			me.mvarSearchResultsDOM.html('<div class="nodeCreationMenuHeader"><i>Search Results:</i></div>');

			//if no search results were found, just say "none"
			if(maxMatches==0){
				me.mvarSearchResultsDOM.append('<div class="nodeCreationMenuHeader" style="padding:10px 0px; text-align:center;"><i>None</i></div>');
			
			//otherwise. loop over matches and build the results!
			}else{

				//whilst we're looping over matches, let's keep track of just how many search results there were
				me.mvarSResultsTotal = 0;

				//loop over matches
				for(var m=maxMatches; m>0; m--){

					//check if this is defined
					if( !(typeof matches[m] === 'undefined') ){

						//get it's array of matches
						var mArr = matches[m];

						//loop over matches and generate HTML
						for(var ma=0; ma<mArr.length; ma++){

							//get this match
							var match = mArr[ma];

							//make an html entry for each match!	
							me.mvarSearchResultsDOM.append( '<div class="nodeCreationMenuItem menuItem_NODE searchItem">' +
																'<div class="searchItemPath">' + match.keywords + '</div>' + 
																'<div class="searchItemName">' + match.name + '</div>' + 
															'</div>'
															);

							//get reference to the recently added search item
							var thisSearchItemDOM = me.mvarSearchResultsDOM.find('.searchItem').last();

							//use closures so the function event handler keeps a reference to the proper values
							(function(){
								var nodeReference = match.nodeReference;

								//add an event to create a node!
								thisSearchItemDOM.mousedown(function(event){

									//first things first - we need to hide the menu
									nodeCreationMenu.hideMenu();
									
									//get the current cursor position (we need to subract the top of the node editor or else it will be off)
									var cursorX = dragHandler.mvarMouseX - 50 - nodeGridHandler.mvarX;
									var cursorY = dragHandler.mvarMouseY - $('#divNodeEditor').offset().top - nodeGridHandler.mvarY - 10;

									//next, we need to tell the node manager to create a new node type
									var newNodeID = nodeManager.createNode(nodeReference, {'x':cursorX, 'y':cursorY });

									//now that we have an ID for the node we just generated, we should attach it to the mouse by default
									nodeManager.mvarNodes[newNodeID].NODE.startDrag(event);


								});
							})();

							//increment our total number of search results
							me.mvarSResultsTotal++;

						}//next ma

					}//end if matches was defined

				}//next m

			}//end if were there matches

			//now that we've built all the HTML we're done with the search!

		}//handleSearch(event)

		//display the menu!
		this.showMenu = function(event){
			
			//get the current cursor position (we need to subract the top of the node editor or else it will be off)
			var cursorX = dragHandler.mvarMouseX - 50;
			var cursorY = dragHandler.mvarMouseY - $('#divNodeEditor').offset().top - 20;

			//move the menu to the correct spot:
			me.mvarDOM.css('left', cursorX+'px').css('top', cursorY+'px');

			//make sure the search results and the search box input are both EMPTY
			me.mvarDOM.find('.searchBar input').val('');
			me.mvarDOM.find('.searchResults').html('');

			//make sure the menu is shown and not previous search results
			me.mvarSearchResultsDOM.hide();
			me.mvarMenuDOM.show();

			//display the menu and focus the search box after it appears
			{
				var inputBoxxy = me.mvarDOM.find('.searchBar input');
				me.mvarDOM.fadeIn(200, function(){ inputBoxxy.focus(); });
			}

			//now visible
			me.mvarIsShown = true;

		}//showMenu(event)

		//hide the menu!
		this.hideMenu = function(event){

			//hide the menu
			me.mvarDOM.fadeOut(75);

			//now hidden
			me.mvarIsShown = false;

		}//hideMenu(event)

		//this is very important... each node defination file will call this function register itself.
		//This is where the menus will build themselves, so if a new Node is created down the line,
		//it will add itself to the creation menu
		this.registerNodeMenuItem = function(nodeName, arrPath, nodeItem){

			//HOW THIS WORKS..
			//node are named-spaced. For instance, all math-nodes should be under a Math header.
			//however, many some nodes will need to be two layers deep, such as Math->Random Numbers->
			//I decided to buiuld this system N-Deep, so it just works.
			//What this means is, arrPatth will be an array of layer names (think of them as directory names)
			//such as:
			//arrPath = ['Math', 'Random', 'Random Fractions']
			//we basically just need to loop over this array that was passed to us, and create any missing directories
			//finally add the node to the the final directory
			//let's get busy!

			//first we need to need to make a reference to the main menu. As we progress down the tree,
			//this reference will change to reflect the current menu
			var currentMenu = me.mvarMenuItems;

			//while we're building htis menu, we'll also contactenate all the items into one string (details at 6)
			var menuCatStr = '';

			//loop thru the array that was passed to us
			for(var i=0; i<arrPath.length; i++){

				//get the name of the menu item
				var itemName = arrPath[i];

				//concatenate the menu item to our string
				menuCatStr += itemName + ' \ ';

				//now we need to loop over our current menu and see if it has any menus with this name
				var found=false;
				for(var mi=0; mi<currentMenu.items.length; mi++){

					//check to see if we found a menu item that matches this name
					if(currentMenu.items[mi].type=='menu' && currentMenu.items[mi].name==itemName){

						//yup!
						found=true;

						//save this as the new current menu item
						currentMenu = currentMenu.items[mi];

						//all do with this for loop
						break;
					}//end if matching menu

				}//next mi

				//if a matching menu item was found, we just need to continue the i for loop.
				if(found){
					continue;

				//otherwise, we need to make a new menu item and use that to continue!
				}else{

					//make a new menu object
					var newMenu = {'name':itemName, 'type':'menu', 'items':[]}

					//add it to the current array of our menu items
					currentMenu.items.push(newMenu);

					//the new menu is now our current menu!
					currentMenu = newMenu;
				}

			}//next i


			//now that we've exhausted the menu directory struture, the variable currentMenu should reflect the menu who deserves this node!
			//lets add it to the menu!
			currentMenu.items.push( {
										'name': nodeName,
										'type':'node',
										'nodeReference':nodeItem 
									} );

			//6 O'Clock News:
			//remeber that stright we built by concatenating all the directory names?
			//lets put it to use. To start, will finish it off with the node name
			menuCatStr += nodeName;

			//now this string was built for the search system.
			//in a perfect world, we'd have a nice hash / map / heap / whatever search system
			//but for our purposes we have a linear system. Even if we have 100 nodes this will still be plenty fast.
			//anyway, this search system has an array of strings it checks for keywords, and we just built the string for this node!
			//lets add it to the search system's linear list of searchable nodes
			me.mvarSearchList.push( {
										'name': nodeName,
										'keywords': menuCatStr,
										'nodeReference':nodeItem 
									} );


		}//registerNodeMenuItem(arrPath, nodeItem)

		//build the menu HTML
		//recusrive function to build a nested HTML menu
		this.buildMenuHTML = function(menu, parentNode, visible){

			//remove any existing event hooks to prevent memory leaks of stacked up event hooks
			$(parentNode).find('.nodeCreationMenuItem').unbind();

			//clear the parent node to start with a blank slate
			$(parentNode).html('');
			
			//just pass everything else onto the recusive funciton
			this.buildMenuHTMLRecuvsive(menu, parentNode, visible);

		}//buildMenuHTML(parentNode, visible)

		//recusrive function to build a nested HTML menu
		this.buildMenuHTMLRecuvsive = function(menu, parentNode, visible){

			//loop over the menu items
			for(var i=0; i<menu.items.length; i++){

				//get a local reference to the item, outside of the array
				var item = menu.items[i];

				//add a HTML element to the parent DOM elemnt for this menu item:
				$(parentNode).append('<div class="nodeCreationMenuItem">' + item.name + '</div>');

				//we should get a reference to the node just created
				var newDomElement = $(parentNode).find('.nodeCreationMenuItem').last();

				//if this is a NODE item, let's add that class and add the event handlers for this menu item
				if(item.type=='node'){
					newDomElement.addClass('menuItem_NODE');

					//use closures so the function event handler keeps a reference to the proper values
					(function(){
						var nodeReference = item.nodeReference;

						//add an event to create a node!
						newDomElement.mousedown(function(event){

							//first things first - we need to hide the menu
							nodeCreationMenu.hideMenu();
							
							//get the current cursor position (we need to subract the top of the node editor or else it will be off)
							var cursorX = dragHandler.mvarMouseX - 50 - nodeGridHandler.mvarX;
							var cursorY = dragHandler.mvarMouseY - $('#divNodeEditor').offset().top - nodeGridHandler.mvarY - 10;

							//next, we need to tell the node manager to create a new node type
							var newNodeID = nodeManager.createNode(nodeReference, {'x':cursorX, 'y':cursorY });

							//now that we have an ID for the node we just generated, we should attach it to the mouse by default
							nodeManager.mvarNodes[newNodeID].NODE.startDrag(event);

						});
					})();
				
				//otherwise, if it's actually another menu we have to add it's class and then loop over it's menu items too
				}else{
					newDomElement.addClass('menuItem_MENU');

					//add a subdivision menu to this item for all it's chlredy
					newDomElement.append('<div class="subMenuContainer"></div>');

					//recusively add it's menu items
					me.buildMenuHTML(item, newDomElement.find('.subMenuContainer'), false);
				}

			}//next i

		}//buildMenuHTMLRecuvsive(parentNode, visible)



}//object nodeCreationMenu()