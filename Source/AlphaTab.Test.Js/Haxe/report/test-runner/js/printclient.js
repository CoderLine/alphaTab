if(typeof massive=='undefined') massive = {}
if(!massive.munit) massive.munit = {}
if(!massive.munit.js) massive.munit.js = {}




var queue = [];
var timer = null;


var COLOR_PASSED = "#A9D1AC";
var COLOR_FAILED = "#c82020";
var COLOR_ERROR = "#c82020";
var COLOR_WARNING = "#FFDE7A";
var COLOR_DEFAULT = "white";

/**
* Pushes a javascript call into a deferred queue in order
* to prevent additional unit testing from blocking
*/
function addToQueue(scope, arg1, arg2, arg3, arg4)
{
	var args = [];
	if(arg4) args.unshift(arg4);
	if(arg3) args.unshift(arg3);
	if(arg2) args.unshift(arg2);
	if(arg1) args.unshift(arg1);
	
	if(args.length > 0)
	{
		var item  = scope + "(\"" + args.join("\",\"") + "\")";
	}
	else
	{
		var item  = scope + "()";
	}
	queue.push(item);
	if(timer ==  null) timer = setTimeout("emptyQueue()", 10);
	return true;
}

function emptyQueue()
{
	if(!initialized) initialize();

	var i = 0;
	for(i=0; i<queue.length; i++)
	{
		var item = queue[i];
		eval(item);
	}

	queue = [];
	timer = null;
}


//////////

var initialized = false;
var munitDiv = null;

var currentLine = null;

var currentClassDiv = null;
var currentClassId = null;
var currentCoverageId = null;
var currentCoverageDiv = null;

var missingCoverageDiv = null;

var MUNIT_HEADER = "munit-header";
var MUNIT_TESTS = "munit-tests";
var MUNIT_COVERAGE = "munit-coverage";
var MUNIT_IGNORED = "munit-ignored";
var MUNIT_SUMMARY = "munit-summary";
var MUNIT_COVERAGE_BREAKDOWN = "munit-coverage-breakdown";


function setResult(result)
{
	var summary = document.getElementById(MUNIT_SUMMARY);

	if(summary != null)
	{
		if(result.toString() == "true")
		{
			summary.style.backgroundColor = "#89de8c";
		}
		else
		{
			summary.style.backgroundColor = "#ff776d";
		}
	}

	window.scrollTo(0,document.body.scrollHeight);

	currentClassId = null;

	if(parent != null && parent != this) parent.testComplete();
	
}

function setResultBackground(result)
{
	if(result.toString() == "true")
	{
		document.body.style.backgroundColor = "#89de8c";
	}
	else
	{
		document.body.style.backgroundColor = "#ff776d";
	}
}


function debug(value)
{
	 var div = createDiv("debug", "debug");
	 munitDiv.appendChild(div);
	 div.innerHTML = value;
}

function initialize()
{
	initialized = true;

	munitDiv = createDiv("munit", "munit");
	document.body.appendChild(munitDiv);

	var swf = document.getElementById("swfContainer");
	if(swf != null && swf != undefined)
	{
		swf.setAttribute("width",0);
		swf.setAttribute("height",0);
	}
}

function munitPrintLine(value, clazz)
{
	if(!initialized) initialize();

	if(clazz == null) clazz = "line";
	currentLine = createDiv(null, clazz);
	currentLine.innerHTML = value;
	munitDiv.appendChild(currentLine);
}

function munitPrint(value)
{
	if(currentLine == null)
	{
		munitPrintLine(value);
	}
	else
	{
		currentLine.innerHTML += value;	
	}
}

function munitTrace(value)
{
	if(!initialized) initialize();

	if(currentClassId != null)
	{
		addTestTrace(value);
	}
	else
	{
		munitPrintLine(value, "trace");
		munitPrintLine("");
	}

}




///// TEST APIS ///////

//prints to the current test div
function createTestClass(testClass)
{
	if(!initialized) initialize();

	if(currentClassId == null)
	{
		var tests = createDiv(MUNIT_TESTS, MUNIT_TESTS);
		munitDiv.appendChild(tests);
	}
	
	currentClassId = convertStringToId(testClass);
	currentClassDiv = createTestDiv(currentClassId);

	document.getElementById(MUNIT_TESTS).appendChild(currentClassDiv);

	var headerParent = document.getElementById(currentClassId + "_header_parent");
	
	icon = document.getElementById(currentClassId + "_icon");
	icon.setAttribute("class", "icon-busy" );
	
	createToggle(currentClassId);
}

function updateTestSummary(value)
{
	var line = document.getElementById(currentClassId + "_header");
	line.innerHTML += value;
}

function addTestTrace(value)
{	
	var contents = document.getElementById(currentClassId + "_contents");

	var line = createDiv(null, "trace");
	line.innerHTML = value;
	contents.appendChild(line);	
}

function addTestPass(value)
{
	var contents = document.getElementById(currentClassId + "_contents");
	var line = createDiv(null, "pass");
	line.innerHTML = value;
	contents.appendChild(line);	
}


function addTestFail(value)
{
	var contents = document.getElementById(currentClassId + "_contents");
	var line = createDiv(null, "fail");
	line.innerHTML = value;
	contents.appendChild(line);	
}

function addTestError(value)
{
	var contents = document.getElementById(currentClassId + "_contents");
	var line = createDiv(null, "error");
	line.innerHTML = value;
	contents.appendChild(line);	
}

function addTestIgnore(value)
{
	var contents = document.getElementById(currentClassId + "_contents");
	var line = createDiv(null, "ignore");
	line.innerHTML = value;
	contents.appendChild(line);	
}

function addTestCoverageClass(coverageClass, percentage)
{
	var contents = document.getElementById(currentClassId + "_contents");

	currentCoverageId = convertStringToId("coverage_" + coverageClass);
	currentCoverageDiv = createSectionDiv(currentCoverageId, "test-coverage");
	
	contents.appendChild(currentCoverageDiv);

	var line = document.getElementById(currentCoverageId + "_header");
	line.innerHTML += "Coverage:" + coverageClass + "<b> [" + percentage + "%]</b>";

	createToggle(currentCoverageId);

}

function addTestCoverageItem(value)
{
	var contents = document.getElementById(currentCoverageId + "_contents");
	var line = createDiv(null, "coverage");
	line.innerHTML = value;
	contents.appendChild(line);	
}

function setTestClassResult(level)
{
	var color = null;
	var icon = null;

	switch(level)
	{
		case "0":
			//color =COLOR_PASSED;// green pas
			icon = "passed";
		 	break;
		case "1":
			color = COLOR_FAILED// red fail
			icon = "failed";
			break;
		case "2":
			color = COLOR_ERROR;// red error
			icon = "error";
			break;
		case "3":
			//color = COLOR_WARNING;// yellow passed but not covered
			icon = "passed";
			break;
		default: 
			break;
	}

	if(color != null)
	{
		var line = document.getElementById(currentClassId + "_header");
		line.style.color = color;
	}

	if(icon != null)
	{
		var iconDiv = document.getElementById(currentClassId + "_icon");
		iconDiv.setAttribute("class", "icon-" + icon);
	}

	var contents = document.getElementById(currentClassId + "_contents");
	if(contents.childNodes.length == 0)
	{
		removeToggle(currentClassId);
	}
}

/////////// FINAL REPORTS ///////////

function createCoverageReport(value)
{
	var lineBreak = createLineBreak();
	munitDiv.appendChild(lineBreak);


	var coverage = createSectionDiv(MUNIT_COVERAGE, "munit-coverage");
	munitDiv.appendChild(coverage);

	var header = document.getElementById(MUNIT_COVERAGE + "_header");
	header.innerHTML = "<b>Code Coverage Result: " + value + "%</b>";


	var content = document.getElementById(MUNIT_COVERAGE + "_contents");
	

	createToggle(MUNIT_COVERAGE);
}

var currentCoverageReportID = null;

function addMissingCoverageClass(coverageClass, percentage)
{
	if(missingCoverageDiv == null)
	{
		addCoverageReportSection("Missing Code Coverage");
		missingCoverageDiv = document.getElementById(currentCoverageReportID + "_contents");
	}


	currentCoverageId = convertStringToId("coverage_for_" + coverageClass);
	currentCoverageDiv = createSectionDiv(currentCoverageId, "missing-coverage-item");

	missingCoverageDiv.appendChild(currentCoverageDiv);

	createToggle(currentCoverageId);

	var line = document.getElementById(currentCoverageId + "_header");
	line.innerHTML += "Coverage: " + coverageClass + "<b> [" + percentage + "%]</b>";
}



function addCoverageReportSection(title, contents)
{
	var coverage = document.getElementById(MUNIT_COVERAGE + "_contents");

	var lineBreak = createLineBreak();
	coverage.appendChild(lineBreak);


	var sectionID = convertStringToId(MUNIT_COVERAGE + "_contents" + "_" +title);
	var section = createSectionDiv(sectionID, MUNIT_COVERAGE_BREAKDOWN);
	
	coverage.appendChild(section);
	
	var header = document.getElementById(sectionID + "_header");
	header.innerHTML = title;

	if(contents != null)
	{
		var content = document.getElementById(sectionID + "_contents");
		content.innerHTML = contents;
	}

	createToggle(sectionID);
	currentCoverageReportID = sectionID;
}

function addCoverageSummary(value)
{
	var coverage = document.getElementById(MUNIT_COVERAGE + "_contents");

	var lineBreak = createLineBreak();
	coverage.appendChild(lineBreak);

	var line = createDiv(null, "coverage-summary");
	line.innerHTML += value;

	coverage.appendChild(line);
	
}




//////////
function printSummary(value)
{
	var lineBreak = createLineBreak();
	munitDiv.appendChild(lineBreak);

	
	var coverage = createDiv(MUNIT_SUMMARY, "munit-summary");

	coverage.innerHTML = value;
	munitDiv.appendChild(coverage);
}


////////////////////// INTERNAL //////////////////

function createTestDiv(id)
{
	var test = createSectionDiv(id, "munit-test");
	return test;
}

/*
<div id="foo" class="munit-item">
	<div id="foo_header" class="munit-item-header"></div>
	<div id="foo_contents" class="munit-item-contents" ></div>
</div>
*/
function createSectionDiv(id, clazz)
{
	if(document.getElementById(id) != null)
	{
		return document.getElementById(id);
	}

	var item = createDiv(id, clazz);

	var headerParent = createDiv(id + "_header_parent", clazz + "-header-parent");
	
	var icon = createDiv(id + "_icon", "icon");
	headerParent.appendChild(icon);
		
	var header = createDiv(id + "_header", clazz + "-header");
	headerParent.appendChild(header);

	var contents = createDiv(id + "_contents", clazz + "-contents");
	item.appendChild(headerParent);
	item.appendChild(contents);

	return item;
}

/*
	<div id="foo" class="foo-class">
*/
function createDiv(id, clazz)
{
	if(id != null && document.getElementById(id) != null)
	{
		return document.getElementById(id);
	}

	var div = document.createElement("div");
	if(id != null) div.setAttribute("id", id);
	if(clazz != null) div.setAttribute("class", clazz);

	return div;
}

function createLineBreak()
{ 
	var lb = document.createElement("hr");
	//var lb = createDiv(null, "lineBreak");
	//lb.innerHTML = "-----------------------------";
	return lb;
}

function createToggle(id)
{
	var arrow = document.getElementById(id + "_header_arrow");
	if(arrow != null) return;

	var headerParent = document.getElementById(id + "_header_parent");
	headerParent.setAttribute("onclick", "toggleVisibility('" + id + "')");
	arrow = createDiv(id + "_header_arrow",  "arrow-closed");
	headerParent.insertBefore(arrow, headerParent.firstChild.nextSibling);

	var testContents = document.getElementById(id + "_contents");
	testContents.style.display = "none";	
}

function removeToggle(id)
{
	var arrow = document.getElementById(id + "_header_arrow");

	if(arrow == null) return;

	var headerParent = document.getElementById(id + "_header_parent");
	headerParent.setAttribute("onclick", "");

	var arrow = document.getElementById(id + "_header_arrow");
	arrow.setAttribute("class", "arrow-none");

	var testContents = document.getElementById(id + "_contents");
	testContents.style.display = "none";	
}

function toggleVisibility(id, forceOpen)
{
	var testContents = document.getElementById(id + "_contents");
	if(forceOpen != true) forceOpen = testContents.style.display == "none";
	
	testContents.style.display = forceOpen ? "block" : "none";	

	var arrow = document.getElementById(id + "_header_arrow");
	arrow.setAttribute("class", forceOpen ? "arrow-open" : "arrow-closed");
}

function convertStringToId(value)
{
	value = value.split(" ").join("_");
	value = value.split(".").join("_");
	value = value.split("&nbsp;").join("_");
	return value;
}



