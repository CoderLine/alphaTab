using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Event")]
    public class Event
    {
        public static readonly HaxeInt NONE;
        public static readonly HaxeInt CAPTURING_PHASE;
        public static readonly HaxeInt AT_TARGET;
        public static readonly HaxeInt BUBBLING_PHASE;
        public static readonly HaxeInt ALT_MASK;
        public static readonly HaxeInt CONTROL_MASK;
        public static readonly HaxeInt SHIFT_MASK;
        public static readonly HaxeInt META_MASK;

        [Name("type")]
        public extern HaxeString Type { get; }

        [Name("target")]
        public extern global::Haxe.Js.Html.EventTarget Target { get; }

        [Name("currentTarget")]
        public extern global::Haxe.Js.Html.EventTarget CurrentTarget { get; }

        [Name("eventPhase")]
        public extern HaxeInt EventPhase { get; }

        [Name("bubbles")]
        public extern HaxeBool Bubbles { get; }

        [Name("cancelable")]
        public extern HaxeBool Cancelable { get; }

        [Name("defaultPrevented")]
        public extern HaxeBool DefaultPrevented { get; }

        [Name("isTrusted")]
        public extern HaxeBool IsTrusted { get; }

        [Name("timeStamp")]
        public extern HaxeFloat TimeStamp { get; }

        [Name("originalTarget")]
        public extern global::Haxe.Js.Html.EventTarget OriginalTarget { get; }

        [Name("explicitOriginalTarget")]
        public extern global::Haxe.Js.Html.EventTarget ExplicitOriginalTarget { get; }

        public extern Event(HaxeString type, dynamic eventInitDict);

        [Name("stopPropagation")]
        public extern void StopPropagation();

        [Name("stopImmediatePropagation")]
        public extern void StopImmediatePropagation();

        [Name("preventDefault")]
        public extern void PreventDefault();

        [Name("initEvent")]
        public extern void InitEvent(HaxeString type, HaxeBool bubbles, HaxeBool cancelable);

        [Name("getPreventDefault")]
        public extern HaxeBool GetPreventDefault();
    }
}
