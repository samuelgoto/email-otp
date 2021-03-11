const keypair = require("keypair");
const jwt  = require("jsonwebtoken");
const jws = require("jws");

class JWT {
  constructor({issuer, audience, subject}) {
    this.keypair = keypair({bits: 512});
    this.issuer = issuer;
    this.audience = audience;
    this.subject = subject;
  }

  sign(payload) {
    return jwt.sign(payload, this.keypair["private"], {
      issuer:  this.issuer,
      subject:  this.subject,
      audience:  this.audience,
      expiresIn:  "12h",
      algorithm:  "RS256"
    });
  }

  decode(token) {
    return jws.decode(token, {});
  }
      
  verify(token) {
    return jwt.verify(token, this.keypair["public"], {
      issuer:  this.issuer,
      subject:  this.subject,
      audience:  this.audience,
      expiresIn:  "12h",
      algorithm:  ["RS256"]
    });
  }
  
}

module.exports = {
  JWT: JWT,
};
