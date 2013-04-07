YUI.add('childtask', function(Y) {
    var path = require('path'),
        spawn = require('child_process').spawn,
        shifter;

    Y.Childtask = function(options) {
        var localOptions = {
                // By default in Moodle we want to try and walk the repository.
                walk:           true,

                // We also tend to run recursively.
                recursive:      true,

                // Use our .jshintrc.
                lint:           'config',

                // Warn with full detail for lint.
                'lint-stderr':  false,

                // We want to always clean the build directory.
                clean:          true
            },
            childOptions = Y.Array(options),
            cwd = process.cwd(),
            key;

        if ((path.basename(cwd) === 'src') || path.basename(path.dirname(cwd)) === 'src') {
            // If we're in a src directory, we don't want to run
            // recursively but we do want to run with walk.
            localOptions.recursive = false;
            localOptions.walk = true;
        }

        // Check the childOptions for things which may require us to make
        // changes to our default options.
        for (key in childOptions) {
            switch(childOptions[key]) {
                case '--watch':
                    localOptions.watch = true;
                    break;
                case '--lint':
                    delete localOptions.lint;
                    break;
                case '-v':
                case '--verbose':
                    // Override the -v option to shifter to give verbosity
                    localOptions['lint-stderr'] = true;
                    delete childOptions[key];
                    break;
            }
        }

        // When watching we cannot run recursively as the watch will pick
        // up the built changes and trigger further builds.
        if (localOptions.watch) {
            localOptions.recursive = false;
        }

        // Convert our local options to CLI arguments.
        for (key in localOptions) {
            switch (key) {
                case 'walk':
                    if (childOptions.indexOf('--walk') === -1 &&
                            childOptions.indexOf('--no-walk') === -1) {
                        if (localOptions[key]) {
                            childOptions.unshift('--walk');
                        } else {
                            childOptions.unshift('--no-walk');
                        }
                    }
                    break;
                case 'recursive':
                    if (childOptions.indexOf('--recursive') === -1 &&
                            childOptions.indexOf('--no-recursive') === -1) {
                        if (localOptions[key]) {
                            childOptions.unshift('--recursive');
                        } else {
                            childOptions.unshift('--no-recursive');
                        }
                    }
                    break;
                case 'lint':
                    if (childOptions.indexOf('--lint') === -1 &&
                            childOptions.indexOf('--no-lint') === -1) {
                        // Sorry - options have to be reversed because we
                        // unshift just to be sure.
                        childOptions.unshift('config');
                        childOptions.unshift('--lint');
                    }
                    break;
                case 'lint-stderr':
                    if (childOptions.indexOf('--lint-stderr') === -1 &&
                            childOptions.indexOf('--no-lint-stderr') === -1) {
                        if (localOptions[key]) {
                            childOptions.unshift('--lint-stderr');
                        }
                    }
                    break;
            }
        }

        var shiftermetaPath = path.dirname(path.dirname(process.mainModule.filename)) +
                '/node_modules/shifter/package.json',
            shiftermeta = Y.Files.getJSON(shiftermetaPath);

        Y.log('Running shifter@' + shiftermeta.version +
                ' with arguments: ' + childOptions.join(' '), 'info', Y.packageInfo.name);

        // We run everything against node.
        // Add the path to shifter to the start of the arguments.
        shifter = path.dirname(path.dirname(process.mainModule.filename)) +
                '/node_modules/shifter/bin/shifter';
        childOptions.unshift(shifter);

        // Run Shifter with our arguments:
        child = spawn(process.execPath, childOptions, {
            cwd: cwd,
            stdio: [process.stdin, process.stdout, process.stderr]
        });
    };
}, '@VERSION@', {requires: ['files']});
