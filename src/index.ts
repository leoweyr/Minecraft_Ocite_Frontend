import { OciteService } from "./application/ocite_account/OciteService";
import { PlaceIntroducerService } from "./application/place_introducer/PlaceIntroducerService";


(async (): Promise<void> => {
    new OciteService();

    new PlaceIntroducerService();
})();
