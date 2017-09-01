(function(window) {
    var Icons = (function() {

        //Constructor function
        function Icons() {
            this.items = [];
        }
        Icons.prototype = {

            add: function(item) {
                this.items.push(item);
            },
            getItems: function() {
                return this.items;
            }

        };
        return Icons;
    }());

    //Factory Method
    Icons.create = function() {
        return new Icons();
    };

    window.Icons = Icons;

}(window));
