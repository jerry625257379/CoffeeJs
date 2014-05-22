﻿var RenderJs = RenderJs || {};
RenderJs.Canvas = RenderJs.Canvas || {};
RenderJs.Canvas.Shapes = RenderJs.Canvas.Shapes || {};

RenderJs.Canvas.Events = { animate: "animate", click: "click", mousemove: "mousemove", mousehover: "mousehover", mouseleave: "mouseleave", collision: "collision" };

/*
*Represents a base class for different type of shapes
*/
RenderJs.Canvas.Shape = Class.extend({
    /*
    *Constructor
    */
    init: function (options) {
        options = options || {};
        this._eventManager = new EventManager();
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 0;
        this.height = options.height || 0;
        this.angle = options.angle || 0;
        this.scaleX = options.scaleX;
        this.scaleY = options.scaleY;
        this.blurRadius = options.blurRadius;
        this.selected = options.selected || false;
        this.selectable = options.selectable;
        this.draggable = options.draggable;
        this.collision = options.collision || false;
        this.filters = [];
        this.layer = null;
        this.loaded = true;
    },
    /*
    *Returns with the center point of the shape
    */
    getCenter: function () {
        return RenderJs.Point(this.x + (this.width) / 2, this.y + (this.height) / 2);
    },
    /*
    *Returns with the rect around the shape
    */
    getRect: function () {
        return RenderJs.Rect(this.x, this.y, this.width, this.height);
    },
    /*
    *Check if the shape is intersect the given rect
    *-rect is a Rect object
    */
    rectIntersect: function (r) {
        var tw = this.width;
        var th = this.height;
        var rw = r.width;
        var rh = r.height;
        if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
            return false;
        }
        var tx = this.x;
        var ty = this.y;
        var rx = r.x;
        var ry = r.y;
        rw += rx;
        rh += ry;
        tw += tx;
        th += ty;
        //overflow || intersect
        return ((rw < rx || rw > tx) &&
        (rh < ry || rh > ty) &&
        (tw < tx || tw > rx) &&
        (th < ty || th > ry));
    },
    /*
    *Check if the point is in the rect
    *-point
    */
    pointIntersect: function (point) {
        var rect = this.getRect();
        return (point.x >= rect.left() &&
            point.x <= rect.right() &&
            point.y >= rect.top() &&
            point.y <= rect.bottom());
    },
    /*
     * Pixel collision detection(AABB)
     */
    pixelCollision: function (obj, ictx) {
        ar = this.getRect();
        br = obj.getRect();

        cp = {
            x: ar.left() < br.left() ? br.left() : ar.left(),
            y: ar.top() < br.top() ? br.top() : ar.top(),
            X: ar.right() < br.right() ? ar.right() : br.right(),
            Y: ar.bottom() < br.bottom() ? ar.bottom() : br.bottom(),
        }
        cr = RenderJs.Rect(cp.x, cp.y, cp.X - cp.x, cp.Y - cp.y);
        if (cr.width <= 0 || cr.height <= 0)
            return false;
        //
        //Draw intersection part of this shape
        //ictx.clearRect(cr.x, cr.y, cr.width, cr.height);
        ictx.clearRect(0, 0, 1200, 800);
        this.draw(ictx);
        var ia = ictx.getImageData(cr.x, cr.y, cr.width, cr.height);
        //
        //Draw intersection part of obj
        //ictx.clearRect(cr.x, cr.y, cr.width, cr.height);
        ictx.clearRect(0, 0, 1200, 800);
        obj.draw(ictx);
        var ib = ictx.getImageData(cr.x, cr.y, cr.width, cr.height);
        var resolution = 4 * 5;
        var l = ia.data.length;
        for (var i = 0; i < l; i += resolution) {
            if (ia.data[i + 3] < 100 || ib.data[i + 3] < 100)
                continue;
            //Collision
            return true;
            break;
        }
    },

    /*
     * Filters which will be applied on the object(blur, greyscale etc...)
     */
    setfilters: function (filters) {
        this.filters = filters;
    },
    /*
    *Move the shape with the given distances in pixels, during the time
    *-dX move horizontally
    *-dY move vertically
    *-f move function
    *-t animation time
    */
    moveShape: function (dX, dY) {
        this.x += dX;
        this.y += dY;
    },

    /*
    *Rotate the shape to the given degree, during the time
    *-deg rotation angle
    *-t animation time
    */
    rotateShape: function (deg) {
        this.angle += deg;
        var o = self.getCenter();
        ctx.translate(o.x, o.y);
        ctx.rotate(Utils.convertToRad(this.angle));
        ctx.translate(-o.x, -o.y);
    },

    /*
    *Scale the shape with the given width and height, during the time
    *-width scale horizontally ratio integer 1 is 100%
    *-height scale vertically ratio integer 1 is 100%
    *-t animation time
    */
    scaleShape: function (scaleX, scaleY) {
        var o = self.getCenter();
        ctx.translate(o.x, o.y);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-o.x, -o.y);
    },
    on: function (type, handler) {
        if (!RenderJs.Canvas.Events[type])
            return;
        this._eventManager.subscribe(type, handler);
    },
    off: function (type, handler) {
        if (!RenderJs.Canvas.Events[type])
            return;
        this._eventManager.unsubscribe(type, handler);
    }
});