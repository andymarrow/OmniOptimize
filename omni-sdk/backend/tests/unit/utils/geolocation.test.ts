import { expect, test, describe } from "bun:test";
import { getCountryFromIP } from "../../../src/utils/geolocation";

describe("Geolocation Utils", () => {
  describe("getCountryFromIP", () => {
    test("returns 'ET' for localhost (127.0.0.1)", async () => {
      const result = await getCountryFromIP("127.0.0.1");
      expect(result).toBe("ET");
    });

    test("returns 'ET' for private network (192.168.x.x)", async () => {
      const result = await getCountryFromIP("192.168.1.50");
      expect(result).toBe("ET");
    });

    test("returns 'ET' for private network (10.x.x.x)", async () => {
      const result = await getCountryFromIP("10.0.0.5");
      expect(result).toBe("ET");
    });

    test("returns 'ET' for empty or invalid input", async () => {
      const result = await getCountryFromIP("");
      expect(result).toBe("ET");
    });
  });
});
