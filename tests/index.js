const assert = require("assert");
const {default: SignJWT} = require("jose/jwt/sign");
const {default: parseJwk} = require("jose/jwk/parse");

describe("Index", function() {
  it("Basic", async () => {
    assert.equal([1, 2, 3].indexOf(4), -1);

    const privateKey = await parseJwk({
      alg: 'ES256',
      crv: 'P-256',
      kty: 'EC',
      d: 'VhsfgSRKcvHCGpLyygMbO_YpXc7bVKwi12KQTE4yOR4',
      x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
      y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
    });

    const jwt = await new SignJWT({ 'urn:example:claim': true })
	  .setProtectedHeader({ alg: 'ES256' })
	  .setIssuedAt()
	  .setIssuer('urn:example:issuer')
	  .setAudience('urn:example:audience')
	  .setExpirationTime('2h')
	  .sign(privateKey);

    console.log(jwt);
    
  });
});
