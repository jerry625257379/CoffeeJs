﻿var Linq = function (arr) {
    "use strict";

    var args = arguments;
    var array = [];

    _init();
    function _init() {
        if (args.length === 0) {
            return;
        }
        if (args.length === 1 && args[0] instanceof Array) {
            array = array.concat(args[0]);
        }
        if (args.length > 1) {
            for (var i = 0, len = args.length; i < len; i++) {
                array.push(args[i]);
            }
        }
    }

    //
    //Creates a new collection, executes the given function and push the result into the new array
    this.map = function (f) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            result.push(f(array[i], i));
        }
        return result;
    };

    //
    //Iterates throught on the array, and executes the parameter function on each element
    this.forEach = function (f) {
        for (var i = 0; i < array.length; i++) {
            f(array[i], i);
        }
    };

    //
    //Returns with the first selected element according to the param function, otherwise throws an exception
    this.first = function (f) {
        if (!f) {
            if (array.length === 0) {
                throw "No elements in the sequence!";
            }
            else {
                return array[0];
            }
        }

        var match = array.filter(f);
        if (match.length === 0) {
            throw "Didn't match any element with the conditions!";
        }
        else {
            return match[0];
        }
    };
    //
    //Returns with the first selected element according to the param function, otherwise null
    this.firstOrDefault = function (f) {
        if (!f) {
            if (array.length === 0) {
                return null;
            }
            else {
                return array[0];
            }
        }
        return array.filter(f)[0];
    };

    //
    //Returns with the last selected element according to the param function, otherwise throws an exception
    this.last = function (f) {
        if (!f) {
            if (array.length === 0) {
                throw "No elements in the sequence!";
            }
            else {
                return array[array.length - 1];
            }
        }
        var match = array.filter(f);
        if (match.length === 0) {
            throw "Didn't match any element with the conditions!";
        }
        else {
            return match[match.length - 1];
        }
    };
    //
    //Returns with the last selected element according to the param function, otherwise null
    this.lastOrDefault = function (f) {
        if (!f) {
            if (this.length === 0) {
                return;
            }
            else {
                return array[array.length - 1];
            }
        }
        var match = array.filter(f);
        return match[match.length - 1];
    };
    //
    //Iterates throught on the array, and returns true if any items matches with the condition
    this.any = function (item) {
        return array.indexOf(item) !== -1;
    };
};
