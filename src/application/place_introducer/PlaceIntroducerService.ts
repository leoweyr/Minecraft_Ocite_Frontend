import { Title, UiMaster } from "@levimc-lse/interface-api";

import { PlaceIntroducer } from "../../component/place_introducer/PlaceIntroducer";
import { PlaceType } from "../../component/place_introducer/PlaceType";


export class PlaceIntroducerService {
    public constructor() {
        mc.listen("onJoin", (player: Player): void => {
            const playerIdentifier: string = player.xuid;

            setTimeout(async () : Promise<void> => {
                const title: Title = new Title(await new PlaceIntroducer("奥德赛社区", PlaceType.NATURE).print());

                UiMaster.getInstance().pend(playerIdentifier, title);
            });
        });
    }
}
