const assert = require("assert");
const {JWT} = require("../src/index.js");

describe("Index", function() {
  it("Sign and Verify", async () => {
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

    const result = jwt.verify(token);
  });
});
