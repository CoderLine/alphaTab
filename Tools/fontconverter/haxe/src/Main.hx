/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
import alphatab.model.Bar;
import alphatab.Settings;
import haxe.ds.StringMap.StringMap;
import js.Browser;

import alphatab.platform.js.Html5Canvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.rendering.BarRendererFactory;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.DiamondNoteHeadGlyph;
import alphatab.rendering.glyphs.SvgGlyph;
import alphatab.rendering.ScoreBarRenderer;
import alphatab.rendering.ScoreBarRendererFactory;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.Stave;
import alphatab.rendering.staves.StaveGroup;
import alphatab.rendering.utils.SvgPathParser;
import haxe.Resource;
import haxe.xml.Fast;
import js.JQuery;
import js.Lib;

/**
 * This small utiltiy application allows the rendering of single glyphs
 */
@:expose()
class Main 
{
    public static var glyphs:Array<NamedSvgGlyph>;
    
    public static var currentGlyph:NamedSvgGlyph;
    
    public static function main() 
    {
        new JQuery(untyped Browser.document).ready(function (_) {
            
            glyphs = new Array<NamedSvgGlyph>();
            
            // a zoom level for more detailed positioning 
            var zoom = 2; 
            // this point will be our "zero point". we need this because we dont want to align the glyphs outside the canvas 
            var zeroX = 150;
            var zeroY = 150;
            
            // load the controls
            var glyphCanvas = new JQuery("#glyphCanvas");
            var list = new JQuery("#glyphList");
            var button = new JQuery('#render');
            var preview = new JQuery('#preview');
            var glyphName = new JQuery('#glyphName');
            var generateFontButton = new JQuery('#generateFontButton');
            var generateClassButton = new JQuery('#generateClassButton');
            var classCode = new JQuery('#class');
            var fontCode = new JQuery('#font');
            
            // create the structure for rendering
            var renderer = new ScoreRenderer(Settings.defaults(), Browser.document.getElementById("glyphCanvas"));
                        
            var staveGroup = new StaveGroup();
            staveGroup.layout = renderer.layout;
            
            var stave = new Stave(new ScoreBarRendererFactory());
            stave.staveGroup = staveGroup;
            
            var barRenderer = new ScoreBarRenderer(new Bar());
            barRenderer.stave = stave;
            
            loadGlyphs(zoom);
            
            var repaint = function() {
                renderer.canvas.clear();
                
                // zero line
                renderer.canvas.setColor(new Color(0, 0, 250));
                
                renderer.canvas.beginPath();
                renderer.canvas.moveTo(zeroX, 0);
                renderer.canvas.lineTo(zeroX, renderer.canvas.getHeight());
                
                renderer.canvas.moveTo(0, zeroY);
                renderer.canvas.lineTo(renderer.canvas.getWidth(), zeroY);
                
                renderer.canvas.stroke();
                
                //glyph lines
                var glx:Float;
                var gly:Float;
                if (untyped(preview.is(":checked")))
                {
                    glx = zeroX;
                    gly = zeroY;
                }
                else
                {
                    glx = currentGlyph.x;
                    gly = currentGlyph.y;
                }
                renderer.canvas.setColor(new Color(0, 250, 0));
                
                renderer.canvas.beginPath();
                renderer.canvas.moveTo(glx, 0);
                renderer.canvas.lineTo(glx, renderer.canvas.getHeight());
                
                renderer.canvas.moveTo(0, gly);
                renderer.canvas.lineTo(renderer.canvas.getWidth(), gly);
                
                renderer.canvas.stroke();

                // info text that we know the translation we will apply
                var s = "x: " + calculateTranslation(currentGlyph.x, zoom, zeroX) + " y: " + calculateTranslation(currentGlyph.y, zoom, zeroY);
                renderer.canvas.setFont(new Font("Arial", 12));
                                
                var renderGlyph:Glyph;
                if (untyped(preview.is(":checked")))
                {
                    renderGlyph = new SvgGlyph(zeroX, zeroY, rewritePathData(currentGlyph, zeroX, zeroY, zoom), zoom, zoom);
                    renderer.canvas.fillText(s, Math.max(10, currentGlyph.x) + zeroX - 50, Math.max(20, currentGlyph.y) + zeroY - 50);
                }
                else
                {
                    renderGlyph = currentGlyph;
                    renderer.canvas.fillText(s, Math.max(10, currentGlyph.x), Math.max(20, currentGlyph.y));
                }
                renderGlyph.renderer = barRenderer;
                renderGlyph.doLayout();
                renderGlyph.paint(0, 0, renderer.canvas);
            };
            
            // initialize UI 
            
            var i = 0;
            for (g in glyphs)
            {
                var option = new JQuery("<option></option>");
                option.val(Std.string(i++));
                option.text(g.name);
                list.append(option);
            }
            
            var dragging = false;
            var startX:Float;
            var startY:Float;
            
            glyphCanvas.mousedown(function(e) {
                dragging = true;
                startX = e.pageX;
                startY = e.pageY;
                untyped __js__("return false;");
            });            
            glyphCanvas.mousemove(function(e) {
                if (dragging)
                {
                    var dx = e.pageX - startX;
                    var dy = e.pageY - startY;
                    startX = e.pageX;
                    startY = e.pageY;

                    currentGlyph.x += Std.int(dx);
                    currentGlyph.y += Std.int(dy);
                    repaint();
                }
            });
            
            new JQuery(untyped Browser.document).bind('mouseup', function(_) {
                dragging = false;
            });
            
            list.change(function(_) {
                var index = Std.parseInt(list.val());
                currentGlyph = glyphs[index];
                
                glyphName.val(currentGlyph.name);

                repaint();
            });
            
            glyphName.keyup(function(_) {
                currentGlyph.name = glyphName.val();
                new JQuery("#glyphList option:selected").text(glyphName.val());
            });
            
            generateClassButton.click(function(_) {
                classCode.text(generateClass(zeroX, zeroY, zoom));
            });
            
            generateFontButton.click(function(_) {
                fontCode.text(generateSvgFont(zeroX, zeroY, zoom));
            });
            
            preview.change(function(_) {
                repaint();
            });
            
            // render first glyph            
            list.val("0");
            list.change();
        });
    }
    
    private static function generateClass(zeroX:Float, zeroY:Float, zoom:Float) 
    {
        var buf = new StringBuf();
        
        buf.add("package alphatab.rendering.glyphs;\r\n");
        buf.add("\r\n");
        buf.add("/**\r\n");
        buf.add(" * This class contains SVG path data for musical symbols\r\n");
        buf.add(" * which can be rendered using the SvgPainter\r\n");
        buf.add(" */\r\n");
        buf.add("class MusicFont\r\n");
        buf.add("{\r\n");
            
        var i = 0;
        for (g in glyphs)
        {
            buf.add("    public static var ");
            buf.add(g.name);
            buf.add(" = new LazySvg(\"");
            buf.add(rewritePathData(g, zeroX, zeroY, zoom));
            buf.add("\");\r\n");
        }
        
        buf.add("}");
        
        return buf.toString();
    }
        
    
    private static function generateSvgFont(zeroX:Float, zeroY:Float, zoom:Float) 
    {
        var buf = new StringBuf();
        
        buf.add("<?xml version=\"1.0\"?>\r\n");
        buf.add("<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\r\n");
        buf.add("<svg viewBox=\"0 0 200 200\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\r\n");
        buf.add("  <defs>\r\n");
        buf.add("    <font id=\"f\" horiz-adv-x=\"1000\">\r\n");
        buf.add("      <font-face font-family=\"AlphaTab\" units-per-em=\"1000\" cap-height=\"600\" x-height=\"400\" ascent=\"-1000\" descent=\"1000\" alphabetic=\"0\" mathematical=\"350\" ideographic=\"400\" hanging=\"500\" />\r\n");
            
        var code = "0".code;
        for (g in glyphs)
        {
            buf.add("        <glyph transform=\"scale(1,-1)\" unicode=\"");
            var s = String.fromCharCode(code++);
            if (s == "<") 
            {
                buf.add("&lt;");
            }
            else if (s == ">") 
            {
                buf.add("&gt;");
            }
            else 
            {
                buf.add(s);
            }
            buf.add("\" glyph-name=\"");
            buf.add(g.name);
            buf.add("\"><path d=\"");
            buf.add(rewritePathData(g, zeroX, zeroY, zoom));            
            buf.add("\" /></glyph>\r\n");
        }
        
        buf.add("    </font>\r\n");
        buf.add("  </defs>\r\n");
        buf.add("</svg>");
        
        return buf.toString();
    }
    
    private static function rewritePathData(g:NamedSvgGlyph, zeroX:Float, zeroY:Float, zoom:Float) : String
    {
        var buf = new StringBuf();
        var p = new SvgPathParser(g.getSvgData());
        p.reset();
        var isX:Bool = true;
        var isFirst = true;
        while (!p.eof())
        {
            if (isFirst) 
            {
                isFirst = false;
            }
            else
            {
                p.nextToken();                
            }
            
            if (!p.currentTokenIsNumber())
            {
                buf.add(p.currentToken);
                isX = true;
            }
            else
            {
                buf.add(" ");
                var newValue = Std.int(Std.parseFloat(p.currentToken));
                switch(p.lastCommand)
                {
                    case "m", "z", "l", "v", "h", "c", "s", "q", "t": // relative paths can remain
                        buf.add(newValue); 
                    case "H":
                        buf.add(newValue + calculateTranslation(g.x, zoom, zeroX));
                    case "V":
                        buf.add(newValue + calculateTranslation(g.y, zoom, zeroY));
                    case "M", "Z", "L", "C", "S", "Q", "T":
                        if (isX) 
                        {
                            buf.add(newValue + calculateTranslation(g.x, zoom, zeroX));
                        }
                        else
                        {
                            buf.add(newValue + calculateTranslation(g.y, zoom, zeroY));
                        }
                }
                isX = !isX;
            }
        }
        
        return buf.toString();
    }
    
    private static function calculateTranslation(glyph:Float, zoom:Float, zero:Float) : Int
    {
        return Std.int(glyph / (zoom/100));
    }
    
    public static function loadGlyphs(zoom:Float)
    {
        var svg = Resource.getString("glyphs");
        var dom = Xml.parse(svg);
        
        processNode(dom.firstElement(), zoom);
    }   
    
    public static function processNode(node:Xml, zoom:Float)
    {
        if (node.nodeType == Xml.Element)
        {
            if (node.nodeName == "path") 
            {
                var f = new Fast(node);
                glyphs.push(new NamedSvgGlyph(f.att.id, f.att.d, zoom));
            }
            else
            {
                for (e in node)
                {
                    processNode(e, zoom);
                }
            }
        }
    }
}