/*jshint node:true */
'use strict';
var Buffer = require('buffer').Buffer; // browserify
var SlowBuffer = require('buffer').SlowBuffer || Buffer; // ✅ fallback for modern Node

module.exports = bufferEq;

function bufferEq(a, b) {
  // shortcutting on type is necessary for correctness
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    return false;
  }

  // buffer sizes should be well-known information, so despite this
  // shortcutting, it doesn't leak any information about the *contents* of the
  // buffers.
  if (a.length !== b.length) {
    return false;
  }

  var c = 0;
  for (var i = 0; i < a.length; i++) {
    /*jshint bitwise:false */
    c |= a[i] ^ b[i]; // XOR
  }
  return c === 0;
}

bufferEq.install = function() {
  Buffer.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };
};

// ✅ handle cases where SlowBuffer might not exist
var origBufEqual = Buffer.prototype.equal;
var origSlowBufEqual =
  (SlowBuffer && SlowBuffer.prototype && SlowBuffer.prototype.equal)
    ? SlowBuffer.prototype.equal
    : Buffer.prototype.equals;

bufferEq.restore = function() {
  Buffer.prototype.equal = origBufEqual;
  if (SlowBuffer && SlowBuffer.prototype) {
    SlowBuffer.prototype.equal = origSlowBufEqual;
  }
};
