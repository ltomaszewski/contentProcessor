module.exports = {
    apps: [
        {
            "name": "CONTENT_PROCESSOR",
            "script": "dist/index.js",
            "args": "--runmode=producation",
            "exp_backoff_restart_delay": 10000
        }
    ]
};
