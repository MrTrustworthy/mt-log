var fs = require("fs");
var EOL = require("os").EOL;


/**
 * This logger can be used to log to a filesystem in a node-environment
 *
 * @constructor
 * @param  {string} filePath  Path of the file we want to write the log to. Defaults to "default.log"
 * @param  {Object} logLevels A Object defining the log levels and available log functions. Optional.
 * @return {Logger}           A logger Object
 */
var Logger = function(filePath, logLevels){

    this.filePath = filePath || "default.log";

    // when the log levels are changed, automatically reload the available log functions
    this.__logLevels = null;
    Object.defineProperty(this, "logLevels",{
        set: function(val){
            this.__logLevels = val;
            this._createLogFunctions();
        },
        get: function(){
            return this.__logLevels;
        },
        configurable: false,
        enumerable: true
    });

    this.logLevels = logLevels || {
        0: "debug",
        1: "log",
        2: "info",
        3: "warn",
        4: "error",
        5: "critical"
    };
};


/**
 * Writes a given string to the filepath in this.filePath
 * @param  {string} text text to write
 * @return {None}
 */
Logger.prototype._writeToFile = function(text){
    var handleWriteFunc = function(err){
        if(err) throw new Error("#MT-Log: error while writing log:", err);
    };

    var appendOptions = {
        encoding: "utf8",
        //mode: 438,
        flag: "a"
    };
    fs.appendFile(this.filePath, text, appendOptions, handleWriteFunc);
};

/**
 * Creates a log message based on the given log level
 * @param  {string} level   Must be a valid key for this.logLevels
 * @param  {Array} message array of strings as message
 * @return {None}
 */
Logger.prototype._makeLogMessage = function(level, message){
    var logLevel = this.logLevels[level];
    var date = (new Date()).toGMTString();
    message = message instanceof Array ? message.join(" : ") : message.toString();
    var msg = "["+date+"] " + "[" + logLevel + "] :-> " + message + EOL;
    this._writeToFile(msg);
};

/**
 * Creates a log function for every log level mentioned in this.logLevels
 * @return {[type]} [description]
 */
Logger.prototype._createLogFunctions = function(){
    Object.keys(this.logLevels).forEach(function(key){
        this[this.logLevels[key]] = function(){
            this._makeLogMessage(key, Array.prototype.slice.call(arguments));
        };
    }.bind(this));
};

module.exports = new Logger("main.log");
