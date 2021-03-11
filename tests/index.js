const assert = require("assert");
const {JWT} = require("../src/index.js");
const {default: generateKeyPair } = require("jose/util/generate_key_pair");


describe("Index", function() {
  it("Sign and Verify", async () => {
    //const {publicKey, privateKey} = await generateKeyPair("RS256");
    //console.log(publicKey);
    //console.log(privateKey);
    //return;
    
    const jwt = new JWT({
      issuer: "https://idp.example",
      subject: "user@email.example",
      audience: "https://rp.example",
    });
    
    const token = jwt.sign({
      "name": "Joe Doe",
      "given_name": "Joe",
      "family_name": "Doe",
      "email": "user@email.example",
      "email_verified": true,
      "locale": "en",
      "picture": "https://idp.example/1234.jpg",
    });

    const decoded = jwt.decode(token);
    // console.log(decoded);
    
    const result = jwt.verify(token);
  });
});
