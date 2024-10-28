import test from "ava";
import uc from "uc-integration-api";

test("Check if driver_url is not defined, so it can be overwritten", (t) => {
  uc.init("src/light-driver.json");

  const driver_url = uc.getDriverUrl();

  t.is(driver_url, undefined);
});
