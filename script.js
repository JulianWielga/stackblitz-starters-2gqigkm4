import { initializeMap } from "./sim/map.js";
import { initializeConnection } from "./connection.js";

const sim = initializeMap();
initializeConnection(sim);
