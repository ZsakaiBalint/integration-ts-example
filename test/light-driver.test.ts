import test from "ava";
import uc from "uc-integration-api";

//driver_url field, where we had issues before. Check that the field is not set.

test("Check if driver_url is not defined, so it can be overwritten", (t) => {
  uc.init("src/light-driver.json");

  const driver_url = uc.getDriverUrl();

  return t.is(typeof driver_url, "undefined");
});
