var Util = require('../util');

function Timeline(key, session, options) {
  this.key = key;
  this.session = session;
  this.events = [];
  this.options = options || {};
  this.sent = 0;
  this.uniqueID = 0;
}
var prototype = Timeline.prototype;

// Log levels
Timeline.ERROR = 3;
Timeline.INFO = 6;
Timeline.DEBUG = 7;

prototype.log = function(level, event) {
  if (level <= this.options.level) {
    this.events.push(
      Util.extend({}, event, { timestamp: Util.now() })
    );
    if (this.options.limit && this.events.length > this.options.limit) {
      this.events.shift();
    }
  }
};

prototype.error = function(event) {
  this.log(Timeline.ERROR, event);
};

prototype.info = function(event) {
  this.log(Timeline.INFO, event);
};

prototype.debug = function(event) {
  this.log(Timeline.DEBUG, event);
};

prototype.isEmpty = function() {
  return this.events.length === 0;
};

prototype.send = function(sendXHR, callback) {
  var self = this;

  var data = Util.extend({
    session: self.session,
    bundle: self.sent + 1,
    key: self.key,
    lib: "js",
    version: self.options.version,
    cluster: self.options.cluster,
    features: self.options.features,
    timeline: self.events
  }, self.options.params);

  self.events = [];
  sendXHR(data, function(error, result) {
    if (!error) {
      self.sent++;
    }
    if (callback) {
      callback(error, result);
    }
  });

  return true;
};

prototype.generateUniqueID = function() {
  this.uniqueID++;
  return this.uniqueID;
};

module.exports = Timeline;
