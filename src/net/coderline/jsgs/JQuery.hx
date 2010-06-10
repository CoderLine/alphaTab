/**
 * ...
 * @author Adrian Veith
 */

package net.coderline.jsgs;
import js.Dom;
import js.XMLHttpRequest;

//using jquery.JQuery;

typedef OffsetPos = {
	top: Int,
	left: Int
}

class JQuery 
{
	public function new() { }
	
	static public inline function Elements(e: Dynamic): JQuery { return untyped (jQuery(e)); }
	static public inline function This(): JQuery { return untyped __js__("jQuery(this)"); }
	static public inline function CreateHtml(html: String, ?doc: Dynamic): JQuery { return untyped (jQuery(html, doc)); }
	
	static public inline function Qy(query: String): JQuery { return untyped jQuery(query); }
	static public inline function QyContext(query: String, context: Dynamic): JQuery { return untyped jQuery(query, context); }
	static public inline function Ready(f: Void -> Void): JQuery { return untyped (jQuery(f)); }
	
	static public inline function Fn_Extend(o: Dynamic): JQuery { return untyped (jQuery.fn.extend(o)); }
	static public inline function Extend(o: Dynamic): JQuery { return untyped (jQuery.extend(o)); }
	
	public inline function Each(f: Int -> Void): JQuery {	return untyped this.each(f); 	}
	
	
	public inline function Size(): Int { return untyped this.size(); }
	public var Length(getLength, null): Int;
	private inline function getLength(): Int { return untyped this.length; }
	public var Selector(getSelector, null): String;
	private inline function getSelector(): String { return untyped this.selector(); }
	public var Context(getContext, null): HtmlDom;
	private inline function getContext(): HtmlDom { return untyped this.context(); }
	
	public inline function Eq(p: Int): JQuery { return untyped this.eq(p); }
	public inline function Get(): Array<HtmlDom> { return untyped this.get(); }
	public inline function GetAt(p: Int): HtmlDom { return untyped this.get(p); }
	public inline function Index(subject: Dynamic): Int { return untyped this.index(subject); }
	public inline function Data(name: String): Dynamic { return untyped this.data(name); }
	public inline function SetData(name: String, value: Dynamic): JQuery { return untyped this.data(name, value); }
	public inline function RemoveData(name: String): JQuery { return untyped this.removeData(name); }
	
	public inline function Queue(name: String): Array < Void -> Void > { return untyped this.queue(name); }
	public inline function QueueCall(name: String, call: Void -> Void): JQuery { return untyped this.queue(name, call); }
	public inline function QueueReplace(name: String, q: Array < Void -> Void > ): JQuery { return untyped this.queue(name, q); }
	public inline function DeQueue(name: String): JQuery { return untyped this.dequeue(name); }
	
	public inline function Attr(name: String): Dynamic { return untyped this.attr(name); }
	public inline function SetAttr(prop: Dynamic): JQuery { return untyped this.attr(prop); }
	public inline function SetAttrValue(name: String, value: Dynamic): JQuery { return untyped this.attr(name, value); }
	public inline function SetAttrCall(name: String, fn: Int->Void): JQuery { return untyped this.attr(name, fn); }
	public inline function RemoveAttr(name: String): JQuery { return untyped this.removeAttr(name); }
	
	public inline function AddClass(cl: String): JQuery { return untyped this.addClass(cl); }
	public inline function HasClass(cl: String): Bool { return untyped this.hasClass(cl); }
	public inline function RemoveClass(cl: String): JQuery { return untyped this.removeClass(cl); }
	public inline function ToggleClass(cl: String): JQuery { return untyped this.toggleClass(cl); }
	public inline function SwitchClass(cl: String, _switch: Bool): JQuery { return untyped this.toggleClass(cl, _switch); }

	public inline function Html(): String { return untyped this.html(); }
	public inline function SetHtml(value: String): JQuery { return untyped this.html(value); }
	public inline function Text(): String { return untyped this.text(); }
	public inline function SetText(value: String): JQuery { return untyped this.text(value); }
	
	public inline function Val(): String { return untyped this.val(); }
	public inline function ValArray(): Array<String> { return untyped this.val(); }
	public inline function SetVal(value: String): JQuery { return untyped this.val(value); }
	public inline function SetValArray(value: Array<String>): JQuery { return untyped this.val(value); }
	
	public inline function Filter(expr: String): JQuery { return untyped this.filter(expr); }
	public inline function FilterCall(fn: Int -> Bool): JQuery { return untyped this.filter(fn); }
	
	public inline function Is(expr: String): Bool { return untyped this.is(expr); }
	public inline function Map(call: Void->Void ): JQuery { return untyped this.map(call); }
	public inline function Not(expr: String): JQuery { return untyped this.not(expr); }
	public inline function Slice(start: Int, ? end: Int): JQuery { return untyped this.slice(start, end); }

	public inline function Add(expr: String): JQuery { return untyped this.add(expr); }
	public inline function Children(?expr: String): JQuery { return untyped this.children(expr); }
	
	public inline function Closest(expr: String): JQuery { return untyped this.closest(expr); }
	public inline function Contents(expr: String): JQuery { return untyped this.contents(expr); }
	public inline function Find(expr: String): JQuery { return untyped this.find(expr); }
	public inline function Next(?expr: String): JQuery { return untyped this.next(expr); }
	public inline function NextAll(?expr: String): JQuery { return untyped this.nextAll(expr); }
	public inline function OffsetParent(expr: String): JQuery { return untyped this.offsetParent(expr); }
	public inline function Parent(?expr: String): JQuery { return untyped this.parent(expr); }
	public inline function Parents(?expr: String): JQuery { return untyped this.parents(expr); }
	public inline function Prev(?expr: String): JQuery { return untyped this.prev(expr); }
	public inline function PrevAll(?expr: String): JQuery { return untyped this.prevAll(expr); }
	public inline function Siblings(?expr: String): JQuery { return untyped this.siblings(expr); }
	
	public inline function AndSelf(): JQuery { return untyped this.andSelf(); }
	public inline function End(): JQuery { return untyped this.end(); }

	public inline function Append(content: String): JQuery { return untyped this.append(content); }
	public inline function AppendTo(selector: String): JQuery { return untyped this.appendTo(selector); }
	public inline function Prepend(content: String): JQuery { return untyped this.prepend(content); }
	public inline function PrependTo(selector: String): JQuery { return untyped this.prependTo(selector); }

	public inline function After(content: String): JQuery { return untyped this.after(content); }
	public inline function Before(content: String): JQuery { return untyped this.before(content); }
	public inline function InsertAfter(selector: String): JQuery { return untyped this.insertAfter(selector); }
	public inline function InsertBefore(selector: String): JQuery { return untyped this.insertbefore(selector); }
	
	public inline function Wrap(content: String): JQuery { return untyped this.wrap(content); }	
	public inline function WrapElement(el: HtmlDom): JQuery { return untyped this.wrap(el); }	
	public inline function WrapAll(content: String): JQuery { return untyped this.wrapAll(content); }	
	public inline function WrapAllElement(el: HtmlDom): JQuery { return untyped this.wrapAll(el); }	
	public inline function WrapInner(content: String): JQuery { return untyped this.wrapInner(content); }	
	public inline function WrapInnerElement(el: HtmlDom): JQuery { return untyped this.wrapInner(el); }	

	public inline function ReplaceWith(content: String): JQuery { return untyped this.replaceWith(content); }	
	public inline function ReplaceAll(selector: String): JQuery { return untyped this.replaceAll(selector); }	
	
	public inline function Empty(): JQuery { return untyped this.empty(); }	
	public inline function Remove(?expr: String): JQuery { return untyped this.remove(expr); }	
	
	public inline function Clone(?AndElements: Bool): JQuery { return untyped this.clone(AndElements); }	
	
	public inline function Css(name: String): String { return untyped this.css(name); }
	public inline function SetCss(prop: Dynamic): JQuery { return untyped this.css(prop); }
	public inline function SetCssValue(name: String, value: Dynamic): JQuery { return untyped this.css(name, value); }
	public inline function SetCssCall(name: String, call: Void->Void): JQuery { return untyped this.css(name, call); }
	
	public inline function Offset(): OffsetPos { return untyped this.offset(); }
	//public inline function OffsetParent(): JQuery { return untyped this.offsetParent(); }
	public inline function Position(): OffsetPos { return untyped this.position(); }

	public inline function ScrollTop(): Int { return untyped this.scrollTop(); }
	public inline function SetscrollTop(value: Int): JQuery { return untyped this.scrollTop(value); }
	public inline function ScrollLeft(): Int { return untyped this.scrollLeft(); }
	public inline function SetScrollLeft(value: Int): JQuery { return untyped this.scrollLeft(value); }
	public inline function Height(): Int { return untyped this.height(); }
	public inline function SetHeight(value: Int): JQuery { return untyped this.height(value); }
	public inline function Width(): Int { return untyped this.width(); }
	public inline function SetWidth(value: Int): JQuery { return untyped this.width(value); }
	public inline function InnerHeight(): Int { return untyped this.innerHeight(); }
	public inline function InnerWidth(): Int { return untyped this.innerWidth(); }
	public inline function OuterHeight(?margin: Int): Int { return untyped this.outerHeight(margin); }
	public inline function OuterWidth(?margin: Int): Int { return untyped this.outerWidth(margin); }

	public inline function Bind<T>(type: String, fn: T->Void): JQuery { return untyped this.bind(type, fn); }
	public inline function BindWithData<T>(type: String, data: Dynamic, fn: T->Void): JQuery { return untyped this.bind(type, data, fn); }
	
	public inline function One<T>(type: String, fn: T->Void): JQuery { return untyped this.one(type, fn); }
	public inline function OneWithData < T > (type: String, data: Dynamic, fn: T -> Void): JQuery { return untyped this.one(type, data, fn); }
	
	public inline function Trigger(event: String, data: Dynamic): JQuery { return untyped this.trigger(event, data); }
	public inline function TriggerHandler(event: String, data: Dynamic): Dynamic { return untyped this.triggerHandler(event, data); }
	public inline function Unbind <T> (?type: String, ?fn: T -> Void): JQuery { return untyped this.unbind(type, fn); }
	
	public inline function Live<T>(type: String, fn: T->Void): JQuery { return untyped this.live(type, fn); }
	public inline function Die<T>(?type: String, ?fn: T->Void): JQuery { return untyped this.die(type, fn); }
	public inline function Hover<T>(over: T->Void, out: T->Void): JQuery { return untyped this.hover(over, out); }

	
	public inline function Blur(): JQuery { return untyped this.blur(); }
	public inline function BlurCall<T>(fn: T->Void): JQuery { return untyped this.blur(fn); }
	public inline function Change(): JQuery { return untyped this.change(); }
	public inline function ChangeCall<T>(fn: T->Void): JQuery { return untyped this.change(fn); }
	public inline function Click(): JQuery { return untyped this.click(); }
	public inline function ClickCall<T>(fn: T->Void): JQuery { return untyped this.click(fn); }
	public inline function Dblclick(): JQuery { return untyped this.dblclick(); }
	public inline function DblclickCall<T>(fn: T->Void): JQuery { return untyped this.dblclick(fn); }
	public inline function Error(): JQuery { return untyped this.error(); }
	public inline function ErrorCall<T>(fn: T->Void): JQuery { return untyped this.error(fn); }
	public inline function Focus(): JQuery { return untyped this.focus(); }
	public inline function FocusCall<T>(fn: T->Void): JQuery { return untyped this.focus(fn); }
	public inline function Keydown(): JQuery { return untyped this.keydown(); }
	public inline function KeydownCall<T>(fn: T->Void): JQuery { return untyped this.keydown(fn); }
	public inline function Keypress(): JQuery { return untyped this.keypress(); }
	public inline function KeypressCall<T>(fn: T->Void): JQuery { return untyped this.keypress(fn); }
	public inline function Keypup(): JQuery { return untyped this.keyup(); }
	public inline function KeyupCall<T>(fn: T->Void): JQuery { return untyped this.keyup(fn); }
	public inline function Load<T>(fn: T->Void): JQuery { return untyped this.load(fn); }
	public inline function Mousedown < T > (fn: T -> Void): JQuery { return untyped this.mousedown(fn); }
	public inline function Mouseenter<T>(fn: T->Void): JQuery { return untyped this.mouseenter(fn); }
	public inline function Mouseleave < T > (fn: T -> Void): JQuery { return untyped this.mouseleave(fn); }
	public inline function Mousemove<T>(fn: T->Void): JQuery { return untyped this.mousemove(fn); }
	public inline function Mouseout<T>(fn: T->Void): JQuery { return untyped this.mouseout(fn); }
	public inline function Mouseover<T>(fn: T->Void): JQuery { return untyped this.mouseover(fn); }
	public inline function Mouseup<T>(fn: T->Void): JQuery { return untyped this.mouseup(fn); }
	public inline function Resize<T>(fn: T->Void): JQuery { return untyped this.resize(fn); }
	public inline function Scroll<T>(fn: T->Void): JQuery { return untyped this.scroll(fn); }
	public inline function Select(): JQuery { return untyped this.select(); }
	public inline function SelectCall<T>(fn: T->Void): JQuery { return untyped this.select(fn); }
	public inline function Submit(): JQuery { return untyped this.submit(); }
	public inline function SubmitCall<T>(fn: T->Void): JQuery { return untyped this.submit(fn); }
	public inline function Unload<T>(fn: T->Void): JQuery { return untyped this.unload(fn); }

	public inline function DisableSelection(): JQuery { return untyped this.disableSelection(); }
	public inline function EnableSelection(): JQuery { return untyped this.enableSelection(); }
	
	public inline function Show(?speed: Int, ?call: Void->Void): JQuery { return untyped this.show(speed, call); }
	public inline function Hide(?speed: Int, ?call: Void -> Void): JQuery { return untyped this.hide(speed, call); }
	public inline function Toggle(?speed: Int, ?call: Void -> Void): JQuery { return untyped this.toggle(speed, call); }
	public inline function ToggleTo(to: Bool): JQuery { return untyped this.toggle(to); }
	
	public inline function ToggleCall < T > (fn1: T-> Void, fn2: T-> Void, ?fn3: T-> Void, ?fn4: T-> Void): JQuery { return untyped this.toggle(fn1, fn2, fn3, fn4); }
	
	public inline function SlideDown(speed: Int, ?call: Void -> Void): JQuery { return untyped this.slideDown(speed, call); }
	public inline function SlideUp(speed: Int, ?call: Void -> Void): JQuery { return untyped this.slideUp(speed, call); }
	public inline function SlideToggle(speed: Int, ?call: Void -> Void): JQuery { return untyped this.slideToggle(speed, call); }
	public inline function FadeIn(speed: Int, ?call: Void -> Void): JQuery { return untyped this.fadeIn(speed, call); }
	public inline function FadeOut(speed: Int, ?call: Void -> Void): JQuery { return untyped this.fadeOut(speed, call); }
	public inline function FadeTo(speed: Int, opacity: Float, ?call: Void -> Void): JQuery { return untyped this.fadeTo(speed, opacity, call); }
	
	public inline function Animate(params: Dynamic, options: Dynamic, ?easing: String, ?call: Void -> Void): JQuery { return untyped this.animate(params, options, easing, call); }
	public inline function Stop(?clearQueue: Bool, ?gotoEnd: Bool): JQuery { return untyped this.stop(clearQueue, gotoEnd); }

	private static inline function getFX(): Bool { return untyped jQuery.fx.off; }
	private static inline function setFX(value: Bool): Bool { return untyped jQuery.fx.off = value; }
	public static var Effects(getFX, setFX): Bool;
	
	// AJAX
	
	public static inline function Ajax(options: Dynamic): XMLHttpRequest { return untyped jQuery.ajax(options); }
	public static inline function AjaxSetup(options: Dynamic): Void { untyped jQuery.ajaxSetup(options); }
	public inline function LoadUrl(url: String, ? data: Dynamic, ?call: Void -> Void): JQuery { return untyped this.load(url, data, call); }
	public static inline function GetUrl(url: String, ? data: Dynamic, ?call: Void -> Void, ?type: String): XMLHttpRequest { return untyped jQuery.get(url, data, call, type); }
	public static inline function GetJSON(url: String, ? data: Dynamic, ?call: Void -> Void): XMLHttpRequest { return untyped jQuery.getJSON(url, data, call); }
	public static inline function GetScript(url: String, ?call: Void -> Void): XMLHttpRequest { return untyped jQuery.getScript(url, call); }
	public static inline function PostUrl(url: String, ? data: Dynamic, ?call: Void -> Void, ?type: String): XMLHttpRequest { return untyped jQuery.post(url, data, call, type); }

	public inline function AjaxComplete(call: Dynamic): JQuery { return untyped this.ajaxComplete(call); }
	public inline function AjaxError(call: Dynamic): JQuery { return untyped this.ajaxError(call); }
	public inline function AjaxSend(call: Dynamic): JQuery { return untyped this.ajaxSend(call); }
	public inline function AjaxStart(call: Dynamic): JQuery { return untyped this.ajaxStart(call); }
	public inline function AjaxStop(call: Dynamic): JQuery { return untyped this.ajaxStop(call); }
	public inline function AjaxSuccess(call: Dynamic): JQuery { return untyped this.ajaxSuccess(call); }
	
	public inline function Serialize(): String { return untyped this.serialize(); }
	public inline function SerializeArray(): Array<Dynamic> { return untyped this.serializeArray(); }
	
	// Utilities
	public static inline function Support(): Dynamic { return untyped jQuery.support(); }
	public static inline function ForEach(object: Dynamic, call: Void->Void): Dynamic { return untyped jQuery.each(object, call); }
	public static inline function Grep<T>(arr: Array<T>, call: T->Int->Void, ? invert: Bool): Array<T> { return untyped jQuery.grep(arr, call, invert); }
	public static inline function InArray<T>(value: T, arr: Array<T>): Int{ return untyped jQuery.inArray(value, arr); }
	public static inline function Merge<T>(first: Array<T>, second: Array<T>): Array<T>{ return untyped jQuery.merge(first, second); }
	public static inline function Unique<T>(arr: Array<T>): Array<T>{ return untyped jQuery.unique(arr); }
	public static inline function IsArray(o: Dynamic): Bool { return untyped jQuery.isArray(o); }
	public static inline function IsFunction(o: Dynamic): Bool { return untyped jQuery.isFunction(o); }
	public static inline function Param(o: Dynamic): String { return untyped jQuery.param(o); }
	
	// Drag and Drop
	public inline function Draggable(?param: Dynamic): JQuery { return untyped this.draggable(param); }
	public inline function DraggableOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.draggable('option', name, value); }
	public inline function Droppable(?param: Dynamic): JQuery { return untyped this.droppable(param); }
	public inline function DroppableOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.droppable('option', name, value); }
	public inline function Resizable(?param: Dynamic): JQuery { return untyped this.resizable(param); }
	public inline function ResizableOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.resizable('option', name, value); }
	public inline function Selectable(?param: Dynamic): JQuery { return untyped this.selectable(param); }
	public inline function SelectableOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.selectable('option', name, value); }
	public inline function Sortable(?param: Dynamic): JQuery { return untyped this.sortable(param); }
	public inline function SortableOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.sortable('option', name, value); }

	// Widgets
	public inline function Accordion(?param: Dynamic): JQuery { return untyped this.accordion(param); }
	public inline function AccordionOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.accordion('option', name, value); }
	public inline function Datepicker(?param: Dynamic): JQuery { return untyped this.datepicker(param); }
	public inline function DatepickerOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.datepicker('option', name, value); }
	public inline function DPGetDate(): Date { return untyped this.datepicker('getDate'); }
	public inline function DPSetDate(value: Date): Date { return untyped this.datepicker('setDate', value); }

	public inline function Dialog(?param: Dynamic): JQuery { return untyped this.dialog(param); }
	public inline function DialogOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.dialog('option', name, value); }
	
	public inline function Progressbar(?param: Dynamic): JQuery { return untyped this.progressbar(param); }
	public inline function ProgressbarOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.progressbar('option', name, value); }
	
	public inline function Slider(?param: Dynamic): JQuery { return untyped this.slider(param); }
	public inline function SliderOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.slider('option', name, value); }

	public inline function Tabs(?param: Dynamic): JQuery { return untyped this.tabs(param); }
	public inline function TabsOption(name: String, ?value: Dynamic ): Dynamic { return untyped this.tabs('option', name, value); }

}
