function verboseInit(__verbose) {

var $ = require('jquery');
var isVerbose = __verbose;
//jQuery document ready event
$( document ).ready(function(event) {
    console.log( "jQuery doc ready!" );
    
    if(isVerbose){
	    setupVerboseReader();
	    
	    //on window resize event
	    var resizeTimer;
	    $(window).on('resize', function(e) {
			clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function() {
				outputWinData();
				outputMainScrollsData();
			}, 250);
	    });
	    
	    var afterScrollHandler = debounce(function() {
			outputWinData();
			outputMainScrollsData();
		}, 250);

		document.addEventListener('scroll', afterScrollHandler);
	    
    }
    
});



function setupVerboseReader() {
	var verboseReader = document.createElement("div");
	verboseReader.setAttribute("id", "verboseReader");
	document.body.appendChild(verboseReader);
	
	//windowObject Data
	var winData = document.createElement("section");
	winData.setAttribute("id", "winData");
	verboseReader.append(winData);
	
	$( "#winData" ).click(function(e) {
		$(this).toggleClass( "read" );
	});
	outputWinData();
	
	//mainScrolls Data
	var mainScrollsData = document.createElement("section");
	mainScrollsData.setAttribute("id", "mainScrollsData");
	verboseReader.append(mainScrollsData);
	
	$( "#mainScrollsData" ).click(function(e) {
		$(this).toggleClass( "read" );
	});
	outputMainScrollsData();

}

function outputMainScrollsData() {
	var win = window; //create a snapshot of the window object
	
	var sections = Array.prototype.slice.call( document.querySelectorAll( "#mainScrolls>section" ) );
	
	var title = $("<h2></h2>").text("#mainScrolls");
	$("#mainScrollsData").html(title);
	
	var list = $("#mainScrollsData").append('<ul></ul>').find('ul');
	var $mainScrollsHeight = $("#mainScrolls").height();
	list.append('<li><big>' + $mainScrollsHeight + '</big></li>');
	list.append('<li><big>' + sections.length + '</big></li>');

	for (var i = 0; i < sections.length; i++) {
		list.append('<li><span><b>sections[' + i + ']: </b></span> <span><b>offsetTop: </b>' + sections[i].offsetTop + '</span></li>');
	}
	
	
}

function outputWinData() {
	var win = window; //create a snapshot of the window object
	
	var winTitle = $("<h2></h2>").text("Window Object");
	$("#winData").html(winTitle);
	
	var list = $("#winData").append('<ul></ul>').find('ul');
	list.append('<li><span><b>innerWidth: </b>' + win.innerWidth + '</span> <span><b>innerHeight: </b>' + win.innerHeight + '</span></li>');
	list.append('<li><span><b>outerWidth: </b>' + win.outerWidth + '</span> <span><b>outerHeight: </b>' + win.outerHeight + '</span></li>');
	list.append('<li><span><b>pageXOffset: </b>' + win.pageXOffset + '</span> <span><b>pageYOffset: </b>' + win.pageYOffset + '</span></li>');
	list.append('<li><span><b>scrollX: </b>' + win.scrollX + '</span> <span><b>scrollY: </b>' + win.scrollY + '</span></li>');
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

}

export default verboseInit;
