import {AxiosInstance, AxiosResponse} from "axios";

import { Composable } from "../Composable";
import { CoreCrystalContributionType } from "./enums/CoreCrystalContributionType";
import {
    GetUsersCoreCrystalContributionResponseBody
} from "../../http/response/GetUsersCoreCrystalContributionResponseBody";


export class CoreCrystalContributionText implements Composable {
    private readonly ociteAccountServiceApi: AxiosInstance;
    private readonly ociteAccountIdentifier: string;
    private coreCrystalContributionType: CoreCrystalContributionType;

    public constructor(ociteAccountServiceApi: AxiosInstance, ociteAccountIdentifier: string) {
        this.ociteAccountServiceApi = ociteAccountServiceApi;
        this.ociteAccountIdentifier = ociteAccountIdentifier;
        this.coreCrystalContributionType = CoreCrystalContributionType.CORE_ENERGY;
    }

    public switch(type: CoreCrystalContributionType): void {
        this.coreCrystalContributionType = type;
    }

    public async print(): Promise<string> {
        let coreCrystalContributionString: string;

        const response: AxiosResponse<GetUsersCoreCrystalContributionResponseBody> = await this.ociteAccountServiceApi.get(`/users/${this.ociteAccountIdentifier}/core-crystal-contribution`);

        switch (this.coreCrystalContributionType) {
            case CoreCrystalContributionType.CORE_ENERGY:
                coreCrystalContributionString = `§f◆ 核心水晶能量：${response?.data?.paidEnergy + response?.data?.syntheticEnergy}§r`;
                break;
            case CoreCrystalContributionType.RED_SHARD:
                coreCrystalContributionString = `§4◆ 智慧碎片：${response?.data?.redShard}§r`;
                break;
            case CoreCrystalContributionType.BLUE_SHARD:
                coreCrystalContributionString = `§1◆ 勇气碎片：${response?.data?.blueShard}§r`;
                break;
            case CoreCrystalContributionType.GREEN_SHARD:
                coreCrystalContributionString = `§2◆ 幸运碎片：${response?.data?.greenShard}§r`;
                break;
            case CoreCrystalContributionType.YELLOW_SHARD:
                coreCrystalContributionString = `§e◆ 权力碎片：${response?.data?.yellowShard}§r`;
                break;
        }

        return coreCrystalContributionString;
    }
}
