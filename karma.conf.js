const resolve = require('./rollup.resolve');
const commonjs = require('@rollup/plugin-commonjs');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'test-results/',
    filename: function (req, file, cb) {
        try {
            cb(null, file.originalname);
        } catch (e) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix);
        }
    }
});
const upload = multer({ storage: storage });
const cors = require('cors');
const fs = require('fs');
const path = require('path');

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine', 'express-http-server'],
        files: [
            { pattern: 'dist/lib.test/test/index.js', watched: false },
            {
                pattern: 'test-data/**/*',
                type: 'html',
                watched: false,
                included: false,
                served: true,
                nocache: true
            },
            {
                pattern: 'font/**/*',
                type: 'html',
                watched: false,
                included: false,
                served: true,
                nocache: true
            }
        ],
        preprocessors: {
            'dist/lib.test/test/index.js': ['rollup']
        },

        client: {
            clearContext: false,
            jasmine: {
                random: false,
                stopSpecOnExpectationFailure: false
            }
        },

        expressHttpServer: {
            port: 8090,
            appVisitor: function (app, log) {
                app.use(cors());
                app.get(
                    '/list-files',
                    function (req, res) {
                        log.info(`loading files from ${req.query.dir}`);

                        const directoryPath = path.join(__dirname, req.query.dir);
                        fs.readdir(directoryPath, (err, files) => {
                            //handling error
                            if (err) {
                                res.status(400);
                                res.send(JSON.stringify(`Error: ${err.message}`));
                            } else {
                                res.send(JSON.stringify(files.filter(f => 
                                    fs.statSync(path.join(directoryPath, f)).isFile()
                                )));
                            }
                        });
                    }
                );
                app.post(
                    '/save-file',
                    upload.fields([
                        {
                            name: 'file',
                            maxCount: 1
                        }
                    ]),
                    function (req, res) {
                        log.info(`save file ${req.file}`);
                        res.send(JSON.stringify('OK'));
                    }
                );
                app.post(
                    '/save-visual-error',
                    upload.fields([
                        {
                            name: 'expected',
                            maxCount: 1
                        },
                        {
                            name: 'actual',
                            maxCount: 1
                        },
                        {
                            name: 'diff',
                            maxCount: 1
                        }
                    ]),
                    function (req, res) {
                        log.info(`save visual error ${req.file}`);
                        res.send(JSON.stringify('OK'));
                    }
                );
                app.post(
                    '/list-files',
                    upload.fields([
                        {
                            name: 'expected',
                            maxCount: 1
                        },
                        {
                            name: 'actual',
                            maxCount: 1
                        },
                        {
                            name: 'diff',
                            maxCount: 1
                        }
                    ]),
                    function (req, res) {
                        log.info(`save visual error ${req.file}`);
                        res.send(JSON.stringify('OK'));
                    }
                );
            }
        },

        rollupPreprocessor: {
            plugins: [
                resolve({
                    mappings: {
                        '@src': 'dist/lib.test/src',
                        '@test': 'dist/lib.test/test'
                    }
                }),
                commonjs()
            ],
            output: {
                format: 'iife',
                name: 'alphaTab',
                sourcemap: false
            }
        }
    });
};
