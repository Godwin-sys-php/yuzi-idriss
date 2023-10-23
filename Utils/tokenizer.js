const {encode} = require('gpt-3-encoder')

function tokenizer(str) {
  return encode(str).length;  
}

module.exports = tokenizer;