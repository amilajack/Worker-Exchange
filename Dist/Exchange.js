"use strict";var _get=function t(e,n,r){var s=Object.getOwnPropertyDescriptor(e,n);if(void 0===s){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in s&&s.writable)return s.value;var o=s.get;return void 0===o?void 0:o.call(r)},_inherits=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(t.__proto__=e)},_createClass=function(){function t(t,e){for(var n in e){var r=e[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(t,e)}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),_classCallCheck=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},EventEmitter=function(){function t(){_classCallCheck(this,t),this.Events={}}return _createClass(t,{on:{value:function(t,e){return this.__validate(t,e),this.Events[t].push(e),this}},once:{value:function(t,e){var n=this;return this.__validate(t,e),this.Events[t].push(function r(){n.off(t,r),e.apply(n,arguments)}),this}},off:{value:function(t,e){if("string"!=typeof t)throw new Error("Invalid Arguments");if(this.Events[t]||(this.Events[t]=[]),"function"==typeof e){var n=this.Events[t].indexOf(e);-1!==n&&this.Events[t].splice(n,1)}else"undefined"==typeof e&&(this.Events[t]=[]);return this}},emit:{value:function(t){var e=this,n=arguments;if("string"!=typeof t)throw new Error("Invalid Arguments");return this.Events[t]||(this.Events[t]=[]),this.Events[t].length&&!function(){var r=Array.prototype.slice.call(n,1),s=e;e.Events[t].forEach(function(t){t.apply(s,r)})}(),this}},__validate:{value:function(t,e){if("string"!=typeof t||"function"!=typeof e)throw new Error("Invalid Arguments");this.Events[t]||(this.Events[t]=[])}}}),t}();"undefined"!=typeof module?module.exports=EventEmitter:"undefined"!=typeof window&&(window.EventEmitter=EventEmitter);var Exchange=function(t){function e(t,n,r,s){_classCallCheck(this,e),_get(Object.getPrototypeOf(e.prototype),"constructor",this).call(this);var i=this;n=n||e.NORMAL,r=r||!1,s=s||!1;var o=n===e.NORMAL;this.Worker=o?new Worker(t):new SharedWorker(t),this.Port=o?this.Worker:this.Worker.port,this.Port.addEventListener("message",function(t){var e=t.data;e&&e.EXCHANGE&&(s&&console.debug(e),"Request"===e.Type?(e.Result=null,i.emit(e.SubType,e.Message,e),i.emit("All",e.Message,e)):"Broadcast"===e.Type?(i.emit(e.SubType,e.Message,e),i.emit("All",e.Message,e)):"Reply"===e.Type&&i.emit("JOB:"+e.ID,e.Message))}),this.Port.start&&this.Port.start(),this.on("error",function(t){console.error(t)}),this.on("debug",function(t){r&&console.debug(t)}),this.Send("Start")}return _inherits(e,t),_createClass(e,{Send:{value:function(t,e){return e=e||"",this.Port.postMessage({Type:"Broadcast",SubType:t,Message:e,EXCHANGE:!0}),this}},Request:{value:function(t,e){e=e||"";var n=this;return new Promise(function(r){var s=(Math.random().toString(36)+"00000000000000000").slice(2,9);n.once("JOB:"+s,r),n.Port.postMessage({Type:"Request",SubType:t,Message:e,ID:s,EXCHANGE:!0})})}},Finished:{value:function(t){this.Port.postMessage({Type:"Reply",ID:t.ID,Message:t.Result,EXCHANGE:!0})}},Terminate:{value:function(){this.Worker.terminate()}}}),e}(EventEmitter);Exchange.SHARED="SHARED",Exchange.NORMAL="NORMAL";