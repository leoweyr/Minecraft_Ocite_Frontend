import { Composable } from "../Composable";
import { PlaceType } from "./PlaceType";


export class PlaceIntroducer implements Composable {
    private static getPlaceTypeColor(placeType: PlaceType): string {
        let colorString: string;

        if (placeType === PlaceType.NATURE) {
            colorString = "§a";
        } else if (placeType === PlaceType.CULTURE){
            colorString = "§6";
        }

        return colorString!;
    }

    private readonly mainPlaceString: string;
    private readonly affiliatedPlaceString: string | null = null;

    public constructor(
        mainPlaceName: string,
        mainPlaceType: PlaceType,
        AffiliatedPlaceName?: string,
        AffiliatedPlaceType?: PlaceType
    ) {
        this.mainPlaceString = `${PlaceIntroducer.getPlaceTypeColor(mainPlaceType)}\n${mainPlaceName}§r`;

        if (AffiliatedPlaceName && AffiliatedPlaceType) {
            this.affiliatedPlaceString = `${PlaceIntroducer.getPlaceTypeColor(AffiliatedPlaceType!)}\n${AffiliatedPlaceName}§r`;
        }
    }

    public async print(): Promise<string> {
        const decorativeLine: string = "———————————————";

        return `${decorativeLine}${this.affiliatedPlaceString ? this.affiliatedPlaceString + "§f\n※" : ""}§l${this.mainPlaceString}§f\n${decorativeLine}`;
    }
}
