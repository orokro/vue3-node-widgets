
$(document).ready(function(){

	//manage the tabs
	$('#ulTabs li').click(function(){

		//tab name is stored as class
		var tabName = $(this).attr('class').split(' ')[0];

		//remove all selected-tab sclasses from the tabgs
		$('#ulTabs li').removeClass('selectedTab');
		$(this).addClass('selectedTab');

		//hide all tabs, show just this tab
		$('.divTab').hide();
		$('div.'+tabName).show();

		nodeWireHandler.renderWires();
	});
});

function switchTab(tabName){

	//get the dom for this tab
	var thisTab = $('#ulTabs').find('.'+tabName)[0];

	//remove all selected-tab sclasses from the tabgs
	$('#ulTabs li').removeClass('selectedTab');
	$(thisTab).addClass('selectedTab');

	//hide all tabs, show just this tab
	$('.divTab').hide();
	$('div.'+tabName).show();

	nodeWireHandler.renderWires();
}