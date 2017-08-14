(function(window) {
    var Icons = (function() {

        //Constructor function
        function Icons(controlDiv, map, edifici) {
            this.items = [];
        }
        Icons.prototype = {

            add: function(item) {

            },

            remove: function(item) {}

        };
        return Icons;
    }());

    //Factory Method
    Icons.create = function(controlDiv, map, edifici) {
        return new Icons(controlDiv, map, edifici);
    };

    window.Icons = Icons;

}(window));
