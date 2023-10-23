const {encode} = require('gpt-3-encoder')

module.exports = (messages) => {
  let nbre = 0;

  for (let index in messages) {
    nbre += encode(JSON.stringify(messages[index])).length;
  } 

  return nbre;
} 