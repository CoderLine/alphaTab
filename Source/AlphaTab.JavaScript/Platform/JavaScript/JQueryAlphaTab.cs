using System;
using AlphaTab.Collections;
using AlphaTab.Haxe.jQuery;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Util;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Platform.JavaScript
{
    public class JQueryAlphaTab
    {
        public object Exec(Element element, string method, string[] args)
        {
            if (Script.Write<bool>("untyped __js__(\"typeof(method) != 'string'\")"))
            {
                args = new[] { method };
                method = "init";
            }

            if (method[0] == '_' || method == "Exec")
            {
                return null;
            }

            var jElement = new JQuery(element);
            JsApi context = (JsApi)jElement.Data("alphaTab");
            if (method == "destroy" && !context.IsTruthy())
            {
                return null;
            }
            if (method != "init" && !context.IsTruthy())
            {
                throw new Error("alphaTab not initialized");
            }

            var apiMethod = Script.Write<object>("untyped __js__(\"this[method]\")");
            if (apiMethod.IsTruthy())
            {
                var realArgs = Script.Write<string[]>("untyped __js__(\"[ jElement, context ].concat(args)\")");
                return Script.Write<object>("untyped apiMethod.apply(this, realArgs)");
            }
            else
            {
                Logger.Error("Api", "Method '" + method + "' does not exist on jQuery.alphaTab");
                return null;
            }
        }

        [Name("init")]
        public void Init(JQuery element, JsApi context, dynamic options)
        {
            if (!context.IsTruthy())
            {
                context = new JsApi(element[0], options);
                element.Data("alphaTab", context);
                foreach (var listener in _initListeners)
                {
                    listener(element, context, options);
                }
            }
        }

        [Name("destroy")]
        public void Destroy(JQuery element, JsApi context)
        {
            element.RemoveData("alphaTab");
            context.Destroy();
        }

        [Name("tex")]
        public void Tex(JQuery element, JsApi context, string tex)
        {
            context.Tex(tex);
        }

        [Name("tracks")]
        public Track[] Tracks(JQuery element, JsApi context, dynamic tracks)
        {
            if (tracks)
            {
                context.SetTracks(tracks, true);
            }
            return context.Tracks;
        }


        [Name("api")]
        public JsApi Api(JQuery element, JsApi context)
        {
            return context;
        }

        [Name("score")]
        public Score Score(JQuery element, JsApi context, Score score)
        {
            if (score.IsTruthy())
            {
                context.ScoreLoaded(score);
            }
            return context.Score;
        }

        [Name("renderer")]
        public IScoreRenderer Renderer(JQuery element, JsApi context)
        {
            return context.Renderer;
        }

        [Name("layout")]
        public LayoutSettings Layout(JQuery element, JsApi context, object layout)
        {
            if (layout.IsTruthy())
            {
                context.UpdateLayout(layout);
            }
            return context.Settings.Layout;
        }

        [Name("print")]
        public void Print(JQuery element, JsApi context, string width)
        {
            context.Print(width);
        }

        private readonly FastList<Action<JQuery, JsApi, dynamic>> _initListeners = new FastList<Action<JQuery, JsApi, dynamic>>();
        [Name("_oninit")]
        public void OnInit(Action<JQuery, JsApi, dynamic> listener)
        {
            _initListeners.Add(listener);
        }

        public static Action<string> Restore = selector =>
        {
            new JQuery(selector).Empty().RemoveData("alphaTab");
        };
    }
}
