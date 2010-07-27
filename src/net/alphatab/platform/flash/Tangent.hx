/**
 * ...
 * @author Zenas
 */

package net.alphatab.platform.flash;
import flash.geom.Point;

class Tangent {
        public var p:Point;
        public var l:Line;

        public function new(pt:Point,line:Line){
                this.p = pt;
                this.l = line;
        }
}