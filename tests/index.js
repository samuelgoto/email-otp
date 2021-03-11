const assert = require("assert");

describe("Index", function() {
  it("Basic", () => {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });
});
