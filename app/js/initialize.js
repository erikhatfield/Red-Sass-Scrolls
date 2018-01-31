import verboseInit from './verbose';


document.addEventListener('DOMContentLoaded', () => {
  console.log('initialized');

  	verboseInit(false);
 
});

var $ = require('jquery');
var win = window;//snapshot of window object
var sections = Array.prototype.slice.call( document.querySelectorAll( "#mainScrolls>section" ) );
    
//jQuery document ready event
$( document ).ready(function(event) {
    console.log( "jQuery doc ready!" );
    
	initScrollVisualizer();
	

    var afterScrollHandler = debounce(function(e) {
		heavyScrollHandler(e);
	}, 250);
	
	var afterResizeHandler = debounce(function(e) {
		resizeHandler(e);
	}, 250);


	function rawScrollHandler() {
		var $topPercent = ((win.pageYOffset / $("#mainScrolls").height()) * 100) + "%";
		$("#scrollLocation").css('top', $topPercent);
		
		setActiveSection(0);
		
		var index = window.location.hash.substr(1);
		var j = parseInt(index) + 1;
		var $topset = 1 * (win.scrollY - sections[index].offsetTop);
		var $topset2 = (sections[j].offsetTop - win.scrollY);
		
		sections[index].querySelector('article').setAttribute('style', 'top: -' + ($topset /4) + "px");
		sections[j].querySelector('article').setAttribute('style', 'top: -' + ($topset2 /8) + "px");
		
		sections[j].querySelector('div>div').setAttribute('style', 'top: -' + ($topset * .2) + "px");
		sections[j].querySelector('div>div').nextElementSibling.setAttribute('style', 'top: -' + ($topset * .4) + "px");
		
		sections[j].querySelector('div>div').nextElementSibling.nextElementSibling.setAttribute('style', 'top: -' + ($topset * .8) + "px");
		sections[j].querySelector('div>div').nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('style', 'top: -' + ($topset * 1.6) + "px");
		
	}

	function heavyScrollHandler(e){
		
	}

	function resizeHandler(e){
		win = window;//update window obj snapshot
	}

    document.addEventListener('scroll', afterScrollHandler);
    document.addEventListener('scroll', rawScrollHandler);
    window.addEventListener('resize', afterResizeHandler);
    
    
});

function setActiveSection(__i) {
	var i = __i;
	if(sections[i] === undefined) {
		return;
	} else {
		if((win.scrollY >= sections[i].offsetTop) && (win.scrollY <= (sections[i].offsetTop + sections[i].clientHeight))){
			sections[i].setAttribute("class", "active");
			window.location.hash = i;
			if(sections[i+1] !== undefined) {
				sections[i+1].setAttribute("class", "active-next");
			}
			return setActiveSection(i+2);
		} else {
			sections[i].setAttribute("class", "");
			if(sections[i+1] !== undefined) {
				sections[i+1].setAttribute("class", "");
			}
			return setActiveSection(i+1);
		}
	}
}

function initScrollVisualizer() {
	var $scrollVisualizer = document.createElement("div");
	$scrollVisualizer.setAttribute("id", "scrollVisualizer");
	document.body.append($scrollVisualizer);
	
	for (var i = 0; i < sections.length; i++) {
		$("#scrollVisualizer").append('<div></div>');
	}
	
	$("#scrollVisualizer").append('<b id="scrollLocation"></b>');
	
	updateScrollVisualizer();	
}

function updateScrollVisualizer() {
	var divs = Array.prototype.slice.call( document.querySelectorAll( "#scrollVisualizer>div" ) );

	for (var i = 0; i < divs.length; i++) {
		divs[i].setAttribute('style', 'height: ' + ((sections[i].clientHeight / $("#mainScrolls").height()) * 100) + '%');
	}
	$("#scrollLocation").css('height', ((win.innerHeight / $("#mainScrolls").height()) * 100) + '%');
	
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

