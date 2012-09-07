var bignum = require('bignum');
var _ = require('underscore');

var BufferMaker = function(){
  this.plan = [];
};
BufferMaker.prototype.UInt8 = function(val){
  this.plan.push({ type : "UInt8", value : val});
  return this;
};
BufferMaker.prototype.UInt16BE = function(val){
  this.plan.push({ type : "UInt16BE", value : val});
  return this;
};

BufferMaker.prototype.UInt32BE = function(val){
  this.plan.push({ type : "UInt32BE", value : val});
  return this;
};

BufferMaker.prototype.UInt64BE = function(val){
  this.plan.push({ type : "UInt64BE", value : bignum(val)});
  return this;
};

BufferMaker.prototype.string = function(val){
  this.plan.push({ type : "string", value : val});
  return this;
};

BufferMaker.prototype.make = function(){
  var bytecount = 0;
  var offset = 0;
  _.each(this.plan, function(item){
    switch(item.type){
      case "UInt8": bytecount += 1; break;
      case "UInt16BE": bytecount += 2; break;
      case "UInt32BE": bytecount += 4; break;
      case "UInt64BE": bytecount += 8; break;
      case "string": bytecount += item.value.length; break;
    }
  });
  var buffer = new Buffer(bytecount);
  _.each(this.plan, function(item){
    switch(item.type){
      case "UInt8": buffer.writeUInt8(item.value, offset); offset += 1; break;
      case "UInt16BE": buffer.writeUInt16BE(item.value, offset); offset += 2; break;
      case "UInt32BE": buffer.writeUInt32BE(item.value, offset); offset += 4; break;
      case "UInt64BE":
        var bit64Buffer = item.value.toBuffer({endian : "big", size : 8});
        for(var i = 0; i < bit64Buffer.length; i++){
          buffer[offset + i] = bit64Buffer[i];
        }
        offset += 8;
        break;
      case "string": 
        if (typeof item.value === 'string'){
          buffer.write(item.value, offset);
        } else {
          item.value.copy(buffer, 0, offset);
        }
        offset += item.value.length;

        break;
    }
  });
  return buffer;

};

module.exports = BufferMaker;