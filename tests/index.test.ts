import { main } from "../src/index";

describe("Index", () => {
  it("should return 0", async () => {
    const result = await main();
    expect(result).toBe(0);
  });
});
