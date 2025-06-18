import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { FormNode, SimpleFormNode, CustomFormNode } from "@levimc-lse/interface-api";

import {
    PostRedemptionCodesCoreCrystalPaidEnergyRedeemRequestBody
} from "../../http/request/PostRedemptionCodesCoreCrystalPaidEnergyRedeemRequestBody";
import { TextBlock } from "../../component/paragraph/TextBlock";
import { CoreCrystalContributionText } from "../../component/core_crystal_contribution/CoreCrystalContributionText";
import { CoreCrystalContributionType } from "../../component/core_crystal_contribution/enums/CoreCrystalContributionType";
import { Statement } from "../../component/paragraph/Statement";
import { Delimiter } from "../../component/paragraph/Delimiter";


export class CoreCrystalContributionService {
    private readonly ociteAccountServiceApi: AxiosInstance;

    public constructor(ociteAccountServiceApi: AxiosInstance) {
        this.ociteAccountServiceApi = ociteAccountServiceApi;
    }

    public async redeem(playerIdentifier: string, ociteAccountIdentifier: string, formNodeFather: FormNode): Promise<void> {
        const errorRedeemFailedNoticeForm: SimpleFormNode = new SimpleFormNode("核心水晶能量 > 兑换", "兑换码不正确");
        const errorRedeemTooManyAttemptsNoticeForm: SimpleFormNode = new SimpleFormNode("核心水晶能量 > 兑换", "频繁兑换失败，请稍后再试");
        const redeemSuccessForm: SimpleFormNode = new SimpleFormNode("核心水晶能量 > 兑换", "兑换成功");

        const mainMenuForm: CustomFormNode = new CustomFormNode("核心水晶能量 > 兑换");
        mainMenuForm.addInput(
            "",
            "请输入兑换码",
            "",
            async (
                father: FormNode,
                playerIdentifier: string,
                value: string | number | boolean | undefined): Promise<void> => {
            const code: string = value as string;

            try {
                const response: AxiosResponse<void, PostRedemptionCodesCoreCrystalPaidEnergyRedeemRequestBody> = await this.ociteAccountServiceApi.post("/redemption-codes/core-crystal-paid-energy/redeem", {
                    userIdentifier: ociteAccountIdentifier,
                    code: code
                });

                if (response.status === 201) {
                    redeemSuccessForm.setFather(father);

                    await redeemSuccessForm.render(playerIdentifier);
                }
            } catch (error) {
                if ((error as AxiosError).response?.status === 400) {
                    errorRedeemFailedNoticeForm.setFather(father);

                    await errorRedeemFailedNoticeForm.render(playerIdentifier);
                } else if ((error as AxiosError).response?.status === 429) {
                    errorRedeemTooManyAttemptsNoticeForm.setFather(father);

                    await errorRedeemTooManyAttemptsNoticeForm.render(playerIdentifier);
                }
            }
        });

        mainMenuForm.setFather(formNodeFather);
        await mainMenuForm.render(playerIdentifier);
    }

    public async main(playerIdentifier: string, ociteAccountIdentifier: string, formNodeFather: FormNode): Promise<void> {
        const mainMenuForm: SimpleFormNode = new SimpleFormNode("核心水晶能量", "", async (self: SimpleFormNode): Promise<void> => {
            const content: TextBlock = new TextBlock();

            const coreCrystalContributionText: CoreCrystalContributionText = new CoreCrystalContributionText(this.ociteAccountServiceApi, ociteAccountIdentifier);

            coreCrystalContributionText.switch(CoreCrystalContributionType.CORE_ENERGY);
            content.addLine(new Statement(await coreCrystalContributionText.print()));

            coreCrystalContributionText.switch(CoreCrystalContributionType.RED_SHARD);
            content.addLine(new Statement(await coreCrystalContributionText.print()));

            coreCrystalContributionText.switch(CoreCrystalContributionType.BLUE_SHARD);
            content.addLine(new Statement(await coreCrystalContributionText.print()));

            coreCrystalContributionText.switch(CoreCrystalContributionType.GREEN_SHARD);
            content.addLine(new Statement(await coreCrystalContributionText.print()));

            coreCrystalContributionText.switch(CoreCrystalContributionType.YELLOW_SHARD);
            content
                .addLine(new Statement(await coreCrystalContributionText.print()))
                .addLine(new Delimiter("─")).addLine(new Statement("4 种碎片各一个汇集可合成一个核心水晶能量"))
                .addLine(new Statement("订阅奥德赛计划可通过实际游玩过程获取碎片"))
                .addLine(new Statement("核心水晶能量用于购买增值附加服务"))
                .addLine(new Statement("通过捐赠可直接获得核心水晶能量"));

            self.setContent(await content.print());
        });

        mainMenuForm.addButton("兑换", "", async (father: FormNode, playerIdentifier: string): Promise<void> => {
            await this.redeem(playerIdentifier, ociteAccountIdentifier, father);
        });

        mainMenuForm.setFather(formNodeFather);

        await mainMenuForm.render(playerIdentifier);
    }
}
