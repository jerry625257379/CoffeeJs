﻿var RenderJs = RenderJs || {};
RenderJs.Canvas = RenderJs.Canvas || {};

RenderJs.Canvas.Layer = function (container, width, height, active) {
    "use strict";
    /*
     * Dependencies
     */
    var EventManager = EventManager || {};
    var Utils = Utils || {};

    /*
     * Locals
     */
    var _self = this;
    var _initialized = false;
    var _eventManager = new EventManager();
    var _time = 0;
    var _imaginaryCtx = null;

    //
    //Click internal event handler 
    var _clickHandler = function (event, position) {
        position = position || Utils.getMousePos(event.target, event);
        _eventManager.trigger(RenderJs.Canvas.Events.click, [event, position]);
        for (var i = this.objects.length - 1; i >= 0; i--) {
            if (RenderJs.Physics.Collisions.pointInObject(position, this.objects[i])) {
                this.objects[i].trigger(RenderJs.Canvas.Events.click, event)
                return true;
            }
        }
        if (this.prev) {
            $(this.prev.canvas).trigger("click", position);
        }
    };

    //
    //Mousemove internal event handler 
    var _mousemoveHandler = function (event, position) {
        position = position || Utils.getMousePos(event.target, event);
        _eventManager.trigger(RenderJs.Canvas.Events.mousemove, [event, position]);
        for (var i = this.objects.length - 1; i >= 0; i--) {
            if (RenderJs.Physics.Collisions.pointInObject(position, this.objects[i])) {
                this.objects[i].trigger(RenderJs.Canvas.Events.mousemove, [event, position])
                return true;
            }
        }
        if (this.prev) {
            $(this.prev.canvas).trigger("mousemove", position);
        }
    };

    //
    //Mouseenter internal event handler 
    var _mouseenterHandler = function (event, position) {
        position = position || Utils.getMousePos(event.target, event);
        _eventManager.trigger(RenderJs.Canvas.Events.mouseenter, [event, position]);
        for (var i = this.objects.length - 1; i >= 0; i--) {
            if (RenderJs.Physics.Collisions.pointInObject(position, this.objects[i])) {
                this.objects[i].trigger(RenderJs.Canvas.Events.mouseenter, [event, position])
                return true;
            }
        }
        if (this.prev) {
            $(this.prev.canvas).trigger("mouseenter", position);
        }
    };

    //
    //Mouseleave internal event handler 
    var _mouseleaveHandler = function (event, position) {
        position = position || Utils.getMousePos(event.target, event);
        _eventManager.trigger(RenderJs.Canvas.Events.mouseleave, [event, position]);
        for (var i = this.objects.length - 1; i >= 0; i--) {
            if (RenderJs.Physics.Collisions.pointInObject(position, this.objects[i])) {
                this.objects[i].trigger(RenderJs.Canvas.Events.mouseleave, [event, position]);
                return true;
            }
        }
        if (this.prev) {
            $(this.prev.canvas).trigger("mouseleave", position);
        }
    };

    //
    //Constructor
    var _init = function (container, width, height, active) {
        _imaginaryCtx = Utils.getCanvas(width, height).getContext("2d");
        document.getElementById(container).appendChild(this.canvas);
        this.canvas.width = width;
        this.canvas.height = height;
        this.active = active;
        //
        //Event wireups
        $(this.canvas).on("click", function (event, position) {
            _clickHandler.call(_self, event, position);
        });

        $(this.canvas).on("mousemove", function (event, position) {
            _mousemoveHandler.call(_self, event, position);
        });

        $(this.canvas).on("mouseenter", function (event, position) {
            _mouseenterHandler.call(_self, event, position);
        });

        $(this.canvas).on("mouseleave", function (event, position) {
            _mouseleaveHandler.call(_self, event, position);
        });
    };

    //
    //For the linked list
    this.prev = null;
    this.next = null;

    //
    //Array of objects on the layer
    this.objects = [];
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.active = false;
    //
    //Subscribe to an event like animate, click, mousemove, mouseenter, mouseleave
    this.on = function (type, handler) {
        if (!RenderJs.Canvas.Events[type]) {
            return;
        }
        return _eventManager.subscribe(type, handler);
    };

    //
    //Unsubscribe from an event like animate, click, mousemove, mouseenter, mouseleave
    this.off = function (type, id) {
        if (!RenderJs.Canvas.Events[type]) {
            return;
        }
        _eventManager.unsubscribe(type, id);
    };

    //
    //Add an object to the layer, it will be rendered on this layer
    this.addObject = function (object) {
        if (!(object instanceof RenderJs.Canvas.Object)) {
            console.log("An object on the canvas should be inherited from CanvasObject!");
            return;
        }
        object.layer = this;
        this.objects.push(object);
    };

    //
    //Returns true if the layer has sprite objects otherwise false
    var hasSprites = function () {
        for (var i = 0, length = this.objects.length; i < length; i++) {
            if (this.objects[i] instanceof RenderJs.Canvas.Shapes.Sprite) {
                return true;
            }
        }
        return false;
    };

    //
    //Redraw objects on tha layer if it's neccessary
    this.drawObjects = function (frame) {
        if ((_initialized && !_eventManager.hasSubscribers('animate') && !hasSprites.call(this) && !this.active) || this.objects.length == 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        _eventManager.trigger("animate", frame);
        var objectsLoaded = true;
        for (var i = 0, length = this.objects.length; i < length; i++) {
            if (!this.objects[i].loaded) {
                objectsLoaded = false;
            }
            this.objects[i].draw(this.ctx, {
                frameRate: frame,
                lastTime: _time,
                time: _time + 1000 / frame
            });
            //
            //Collision detection
            var collisionObjects = [];
            for (var j = 0, jl = this.objects.length; j < jl; j++) {
                if (this.objects[j].collision && i !== j) {
                    collisionObjects.push(this.objects[j]);
                }
            }

            if (this.objects[i].collision) {
                for (var k = 0, kl = collisionObjects.length; k < kl; k++) {
                    if (RenderJs.Physics.Collisions.checkCollision(this.objects[i], collisionObjects[k])) {
                        this.objects[i]._eventManager.trigger(RenderJs.Canvas.Events.collision, collisionObjects[k]);
                        collisionObjects[k]._eventManager.trigger(RenderJs.Canvas.Events.collision, this.objects[i]);
                    }
                }
            }
        }
        if (objectsLoaded)
            _initialized = true;
        _time += 1000 / frame;
    };

    _init.call(this, container, width, height, active);
};

