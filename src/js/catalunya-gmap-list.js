(function(window) {
    var List = (function() {

        //Constructor function
        function List(params) {
            this.items = [];
        }
        List.prototype = {
            length: function() {
                return this.items.length;
            },

            add: function(item) {
                this.items.push(item);

            },

            remove: function(item) {
                var indexOf = this.items.indexOf(item);
                if (indexOf !== -1) {
                    this.items.splice(indexOf, 1);
                    item.setMap(null);
                }
            },

            exist: function(item) {
                var toReturn = false;
                var indexOf = this.items.indexOf(item);
                if (indexOf !== -1) {
                    toReturn = true;
                }
                return toReturn;
            },

            find: function(callback, action) {
                var callbackReturn,
                    items = this.items,
                    length = items.length,
                    matches = [],
                    i = 0;
                for (; i < length; i++) {
                    callbackReturn = callback(items[i], i);
                    if (callbackReturn) {
                        matches.push(items[i]);
                    }
                }

                if (action) {
                    action.call(this, matches);
                }

                return matches;
            }

        };
        return List;
    }());

    //Factory Method
    List.create = function(params) {
        return new List(params);
    };

    window.List = List;

}(window));
