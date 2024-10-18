import test from "ava";
import uc from "uc-integration-api";



test("Example test case", (t) => {

    uc.init("src/light-driver.json");
    let driverVersion = uc.getDriverVersion().version.driver;

    return t.is(driverVersion, "1.0.0");
});