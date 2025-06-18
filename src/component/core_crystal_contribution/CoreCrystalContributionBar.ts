import { AxiosInstance, AxiosResponse } from "axios";

import { Composable } from "../Composable";
import {
    GetUsersCoreCrystalContributionResponseBody
} from "../../http/response/GetUsersCoreCrystalContributionResponseBody";


export class CoreCrystalContributionBar implements Composable {
    private readonly ociteAccountServiceApi: AxiosInstance;
    private readonly ociteAccountIdentifier: string;

    public constructor(ociteAccountServiceApi: AxiosInstance, ociteAccountIdentifier: string) {
        this.ociteAccountServiceApi = ociteAccountServiceApi;
        this.ociteAccountIdentifier = ociteAccountIdentifier;
    }

    public async print(): Promise<string> {
        const response: AxiosResponse<GetUsersCoreCrystalContributionResponseBody> = await this.ociteAccountServiceApi.get(
            `/users/${this.ociteAccountIdentifier}/core-crystal-contribution`
        );

        const redShardString = `§4♦ ${response.data.redShard}§r`;
        const blueShardString = `§1♦ ${response.data.blueShard}§r`;
        const greenShardString = `§2♦ ${response.data.greenShard}§r`;
        const yellowShardString = `§e♦ ${response.data.yellowShard}§r`;
        const coreEnergyString = `§f◆ ${response.data.syntheticEnergy + response.data.paidEnergy}§r`;

        return `${redShardString} ${blueShardString} ${greenShardString} ${yellowShardString} | ${coreEnergyString}`;
    }
}
