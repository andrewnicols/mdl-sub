var fs = require("fs"),
    path = require("path"),
    spawn = require('child_process').spawn;

YUI.add('mdl', function(Y) {
    Y.MDL = function(config){
        // Handle default configuration stuff here.
        this.options = config;
    };

    Y.MDL.prototype = {
        run: function() {
            var submodule;
            var self = this;
            this.starttime = new Date().getTime();

            // Time to run this stuff.
            if (options.shifter) {
                Y.applyConfig({
                    modules: {
                        childtask: {
                            fullpath: __dirname + '/tasks/shifter.js'
                        }
                    }
                });
                Y.use('childtask', function(Y) {
                    returnvalue = Y.Childtask(options.args);
                });
            }

            if (options.help) {
                Y.help.show();
            }


            this.endtime = new Date().getTime();
        }
    };
});
