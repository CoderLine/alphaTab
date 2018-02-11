var headers = document.getElementsByTagName("td");
var parentWindow = parent.window;
var activeIndex = -1;
var prevWidth = "";

for (var i=0;i<headers.length;i++) {
	var thisHeader = headers[i];
	var expandToggle = thisHeader.getElementsByTagName("a")[0];
	thisHeader.ondblclick = function() {
		toggleExpanded(this.getElementsByTagName("a")[0], this);
	}
	thisHeader.onselectstart = function() {return false;} // ie
	thisHeader.onmousedown = function() {return false;} //others
	expandToggle.onclick = function() {
		toggleExpanded(this, this.parentNode.parentNode);
	}
}

function toggleExpanded(expandElement, tdElement){
	if (hasClass(expandElement, "expanded")){
		expandElement.setAttribute("title", "Click to maximise");
		tdElement.setAttribute("title", "Double click to maximise");
		removeClass(expandElement, "expanded");
		removeClass(tdElement, "active");
		resetHeaders(headers);
		resetFrames();
	} else {
		expandElement.setAttribute("title", "Click to minimise");
		tdElement.setAttribute("title", "Double click to minimise");
		addClass(expandElement, "expanded");
		addClass(tdElement, "active");
		setHeaders(headers);
		setFrames();
	}
}

function setHeaders(headers){
	for (var i=0;i<headers.length;i++) {
		if (hasClass(headers[i],"active")==false) {
			headers[i].style.display="none";
		}else{
			prevWidth = headers[i].getAttribute("width");
			headers[i].setAttribute("width", "100%");
			activeIndex=i;
		}
	}
}

function setFrames(){
	var frameset = parentWindow.document.getElementsByTagName("frameset")[1];
	var colsArray = frameset.cols.split(",");
	if (activeIndex>=0) {
		colsArray[activeIndex] = "100%";
	}
	frameset.cols = colsArray.toString();
}

function resetHeaders(headers){
	for (var i=0;i<headers.length;i++) {
		if (i==activeIndex){
			headers[i].setAttribute("width", prevWidth);
		}else{
			headers[i].style.display="";
		}
	}
}

function resetFrames(){
	var frameset = parentWindow.document.getElementsByTagName("frameset")[1];
	frameset.cols = frameset.cols.replace("100%","*");
}

function hasClass(element, className) {
	if (typeof element != "object" || element.nodeType != 1) return false;

	if (element.className.indexOf((className))<0) {
		return false;
	} else {
		return true;
	}
}

function addClass(element, className) {
	if (typeof element != "object" || element.nodeType != 1) return false;

	if ( !hasClass(element, className) ) {
		space = element.className.length > 0 ? " " : "";
		element.className += space + className;
	}
}

function removeClass(element, className) {
	if (typeof element != "object" || element.nodeType != 1) return false;

	var re = new RegExp("\\s?"+className)
	element.className = element.className.replace(re, "");
}