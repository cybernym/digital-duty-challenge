// SCORM 1.2 API Wrapper — Cybernym Digital Duty Challenge
var SCORM = (function () {
  var api = null, initialized = false, finished = false;

  function scan(w) {
    var n = 0;
    while (!w.API && w.parent && w.parent !== w && n++ < 10) w = w.parent;
    return w.API || null;
  }

  function getAPI() {
    var a = scan(window);
    if (!a && window.opener) a = scan(window.opener);
    return a;
  }

  return {
    init: function () {
      api = getAPI();
      if (api) {
        initialized = api.LMSInitialize("") + "" === "true";
        if (initialized) {
          var s = api.LMSGetValue("cmi.core.lesson_status");
          if (!s || s === "not attempted") {
            api.LMSSetValue("cmi.core.lesson_status", "incomplete");
            api.LMSCommit("");
          }
        }
      } else {
        console.log("[SCORM] API not found – standalone mode");
      }
      return initialized;
    },
    set: function (k, v) {
      if (api && initialized) { api.LMSSetValue(k, "" + v); api.LMSCommit(""); }
    },
    get: function (k) {
      return api && initialized ? api.LMSGetValue(k) : "";
    },
    score: function (raw) {
      this.set("cmi.core.score.raw", raw);
      this.set("cmi.core.score.min", 0);
      this.set("cmi.core.score.max", 100);
    },
    complete: function (raw) {
      this.score(raw);
      this.set("cmi.core.lesson_status", raw >= 70 ? "passed" : "completed");
    },
    bookmark: function (v) {
      if (v !== undefined) this.set("cmi.core.lesson_location", v);
      else return this.get("cmi.core.lesson_location");
    },
    finish: function () {
      if (api && initialized && !finished) { finished = true; api.LMSFinish(""); }
    }
  };
})();
