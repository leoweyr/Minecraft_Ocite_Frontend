import * as Path from "node:path";

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { UiMaster, SimpleFormNode, CustomFormNode, FormNode, Title, SubTitle } from "@levimc-lse/interface-api";

import { CoreCrystalContributionService } from "./CoreCrystalContributionService";
import { GetUsersResponseBody } from "../../http/response/GetUsersResponseBody";
import { PostAuthEmailVerificationRequestBody } from "../../http/request/PostAuthEmailVerificationRequestBody";
import { PostUsersRequestBody } from "../../http/request/PostUsersRequestBody";
import { CoreCrystalContributionBar } from "../../component/core_crystal_contribution/CoreCrystalContributionBar";


export class OciteService {
    private static readonly OCITE_ACCOUNT_SERVICE_CONFIG_FILE_PATH: string = "config/ocite_account_service.json";

    private readonly ociteAccountServiceApi: AxiosInstance;
    private readonly coreCrystalContributionService: CoreCrystalContributionService;

    public constructor() {
        const ociteAccountServiceConfig: JsonConfigFile = new JsonConfigFile("config/ocite_account_service.json");
        const ociteAccountServiceApiUrl: string = ociteAccountServiceConfig.get("apiUrl");
        const ociteAccountServiceAccessToken: string = ociteAccountServiceConfig.get("accessToken");
        const ociteAccountServiceTimeout: number = ociteAccountServiceConfig.get("timeout", 5000);

        if (!ociteAccountServiceApiUrl || ociteAccountServiceApiUrl === "") {
            this.initializeConfigFile(ociteAccountServiceConfig);

            throw new Error(`Ocite Account service api url is not configured. Please check ${Path.join(process.cwd(), OciteService.OCITE_ACCOUNT_SERVICE_CONFIG_FILE_PATH)}.`);
        }

        if (!ociteAccountServiceAccessToken || ociteAccountServiceAccessToken === "") {
            this.initializeConfigFile(ociteAccountServiceConfig);

            throw new Error(`Ocite Account service access token is not configured. Please check ${Path.join(process.cwd(), OciteService.OCITE_ACCOUNT_SERVICE_CONFIG_FILE_PATH)}.`);
        }

        this.ociteAccountServiceApi = axios.create({
            baseURL: ociteAccountServiceApiUrl,
            headers: {
                "Content-Type": "application/json",
                "Authorization": ociteAccountServiceAccessToken
            },
            timeout: ociteAccountServiceTimeout,
        });

        this.ociteAccountServiceApi.interceptors.response.use(
            (response: AxiosResponse<any, any>): AxiosResponse<any, any> => response,
            (error: AxiosError): Promise<never> | undefined => {
                if (error.response?.status === 502) {
                    mc.broadcast(`{\"rawtext\":[{\"text\":\"${Format.Bold}${Format.Gray}无法与核心水晶取得联系！！！！！！${Format.Clear}\"}]`, 9);
                } else if (error.code === "ECONNABORTED") {
                    mc.broadcast(`{\"rawtext\":[{\"text\":\"${Format.Bold}${Format.Gray}暂时无法与核心水晶取得联系。。。。。。${Format.Clear}\"}]`, 9);
                } else {
                    return Promise.reject(error);
                }
            }
        );

        this.coreCrystalContributionService = new CoreCrystalContributionService(this.ociteAccountServiceApi);

        const summonCommand: Command = mc.newCommand("ocite", "召唤 Ocite 精神助手", PermType.Any);
        summonCommand.overload([]);
        summonCommand.setCallback((cmd: Command, origin: CommandOrigin, output: CommandOutput, result: any): void => {
            const playerIdentifier: string = origin.player!.xuid;

            setTimeout(async (): Promise<void> => {
                try {
                    const response: AxiosResponse<GetUsersResponseBody> = await this.ociteAccountServiceApi.get(
                        `/users/by-third-party?platform=xbox&userId=${playerIdentifier}`
                    );

                    if (response.status === 200) {
                        const ociteAccountIdentifier: string = response.data.identifier;

                        this.main(playerIdentifier, ociteAccountIdentifier);
                    }
                } catch (error) {
                    if ((error as AxiosError).response?.status === 404) {
                        this.bindAccount(playerIdentifier);
                    }
                }
            });
        });

        mc.listen("onJoin", (player: Player): void => {
            setTimeout(async (): Promise<void> => {
                try {
                    await this.ociteAccountServiceApi.get(`/users/by-third-party?platform=xbox&userId=${player.xuid}`);

                    player.tell(`${Format.Bold}${Format.Gray}使用 /ocite 召唤精神助手${Format.Clear}`, 0);
                } catch (error) {
                    if ((error as AxiosError).response?.status === 404) {
                        player.tell(`${Format.Bold}${Format.Gray}${Format.Random}Use${Format.Clear} ${Format.Bold}${Format.Gray}/ocite${Format.Clear} ${Format.Bold}${Format.Gray}${Format.Random}to summon Ocite${Format.Clear}`, 0);
                    }
                }
            });
        });
    }

    private initializeConfigFile(config: JsonConfigFile): void {
        config.init("apiUrl", "");
        config.init("accessToken", "");
        config.init("timeout", 5000);
    }

    public bindAccount(playerIdentifier: string): void {
        const uiMaster: UiMaster = UiMaster.getInstance();

        let email: string;
        let isOciteAccountExisted: boolean = true;
        let ociteAccountIdentifier: string;
        let isVerified: boolean = false;
        let firstSecretCharacter: string;
        let secondSecretCharacter: string;

        const errorEmailAddressNoticeForm: SimpleFormNode = new SimpleFormNode("Ocite", "念道不正确\n§8（电子邮箱地址不正确，请重新输入）§r");
        const errorVerificationCodeNoticeForm: SimpleFormNode = new SimpleFormNode("Ocite", "秘密念语不正确\n§8（验证码错误，请重新输入）§r");
        const errorSecretCharacterMatchNoticeFrom: SimpleFormNode = new SimpleFormNode("Ocite", "两次描述的秘密特征不一致\n§8（两次输入的密码不相同，请重新输入）§r");

        const inputSecretCharacterSecondForm: CustomFormNode = new CustomFormNode("Ocite");
        inputSecretCharacterSecondForm.addLabel(`确认与 Ocite 约定的秘密特征：\n§8（验证码有时效，请尽快输入）§r`)
        inputSecretCharacterSecondForm.addInput("", `请再次输入刚刚设置的 Ocite Account 的密码`, "", async (father: FormNode, playerIdentifier: string, value: string | number | boolean | undefined): Promise<void> => {
            secondSecretCharacter = value as string;

            if (firstSecretCharacter !== secondSecretCharacter) {
                errorSecretCharacterMatchNoticeFrom.setFather(inputSecretCharacterFirstForm);

                await errorSecretCharacterMatchNoticeFrom.render(playerIdentifier);
            }
        });

        const inputSecretCharacterFirstForm: CustomFormNode = new CustomFormNode("Ocite");
        inputSecretCharacterFirstForm.addLabel(`与 Ocite 约定的秘密特征：\n§8（验证码有时效，请尽快输入）§r`);
        inputSecretCharacterFirstForm.addInput(
            "",
            "请设置 Ocite Account 的密码",
            "",
            async (
                father: FormNode,
                playerIdentifier: string,
                value: string | number | boolean | undefined
            ): Promise<void> => {
            firstSecretCharacter = value as string;

            inputSecretCharacterSecondForm.setFather(father);

            await inputSecretCharacterSecondForm.render(playerIdentifier);
        });

        const verifyEmailOwnershipForm: CustomFormNode = new CustomFormNode("Ocite");
        verifyEmailOwnershipForm.addLabel("Ocite 的秘密念语是：");
        verifyEmailOwnershipForm.addInput(
            "",
            "请输入您电子邮箱接收到的验证码",
            "",
            async (
                father: FormNode,
                playerIdentifier: string, value: string | number | boolean | undefined
            ): Promise<void> => {
            const code: string = value as string;

            if (isOciteAccountExisted) {
                try {
                    const response: AxiosResponse<void, PostAuthEmailVerificationRequestBody> = await this.ociteAccountServiceApi.post("/auth/email-verification", {
                        email: email,
                        verificationCode: code
                    });

                    if (response.status === 201) {
                        isVerified = true;
                    }
                } catch (error) {
                    if ((error as AxiosError).response?.status === 400) {
                        errorVerificationCodeNoticeForm.setFather(father);

                        await errorVerificationCodeNoticeForm.render(playerIdentifier);
                    }
                }
            } else {
                inputSecretCharacterFirstForm.setFather(father);

                await inputSecretCharacterFirstForm.render(playerIdentifier);

                if (firstSecretCharacter === secondSecretCharacter) {
                    try {
                        const response: AxiosResponse<void, PostUsersRequestBody> = await this.ociteAccountServiceApi.post("/users", {
                            email: email,
                            secretCharacter: secondSecretCharacter,
                            verificationCode: code
                        });

                        if (response.status === 201) {
                            const identifierResponse: AxiosResponse<GetUsersResponseBody> = await this.ociteAccountServiceApi.get(`/users/by-email?email=${email}`);

                            ociteAccountIdentifier = identifierResponse.data.identifier;

                            isVerified = true;
                        }
                    } catch (error) {
                        if ((error as AxiosError).response?.status === 400) {
                            errorVerificationCodeNoticeForm.setFather(father);

                            await errorVerificationCodeNoticeForm.render(playerIdentifier);
                        }
                    }
                }
            }
        });

        const getEmailForm: CustomFormNode = new CustomFormNode("Ocite");
        getEmailForm.addLabel("！！！！！！终于感受到 Ocite 的呼唤了\n因为渗入到该维度患上了意识靡乱症，现在重新苏醒请确定 Ocite 传颂念语的念道：");
        getEmailForm.addInput(
            "",
            `${Format.Gray}请输入绑定 Ocite Account 的电子邮箱${Format.Clear}`,
            "",
            async (
                father: FormNode,
                playerIdentifier: string,
                value: string | number | boolean | undefined
            ): Promise<void> => {
            email = value as string;

            // Verify the Ocite Account is registered.
            try {
                const response: AxiosResponse<GetUsersResponseBody> = await this.ociteAccountServiceApi.get(`/users/by-email?email=${email}`);

                ociteAccountIdentifier = response.data.identifier;
            } catch (error) {
                if ((error as AxiosError).response?.status === 404) {
                    isOciteAccountExisted = false;
                } else if ((error as AxiosError).response?.status === 400) {
                    errorEmailAddressNoticeForm.setFather(getEmailForm);

                    await errorEmailAddressNoticeForm.render(playerIdentifier);
                }
            }

            await this.ociteAccountServiceApi.post("/auth/verification-code", {
                userIdentifier: "",
                businessId: email,
                businessType: "email"
            });

            verifyEmailOwnershipForm.setFather(father);

            await verifyEmailOwnershipForm.render(playerIdentifier);

            if (isVerified) {
                await this.ociteAccountServiceApi.post(`/users/${ociteAccountIdentifier}/third-party/xbox`, {
                    userId: playerIdentifier
                });

                mc.getPlayer(playerIdentifier).tell("<Ocite> 这里是「第四维度」的奥德赛社区，这个世界的「创造者」是炜翼，咱们是来自「第六维度」的「旅行者」，咱们的任务是为母上「核心水晶」收集核心水晶能量", 0);

                uiMaster.pend(playerIdentifier, new Title("- §6LEO§aWEYR§r -"));
                uiMaster.pend(playerIdentifier, new SubTitle("§epresent§r"));
            }
        });

        uiMaster.pend(playerIdentifier, getEmailForm);
    }

    public async main(playerIdentifier: string, ociteAccountIdentifier: string): Promise<void> {
        const uiMaster: UiMaster = UiMaster.getInstance();

        const mainMenuForm: SimpleFormNode = new SimpleFormNode(
            "Ocite",
            "",
            async (self: SimpleFormNode): Promise<void> => {
            self.setContent(
                await new CoreCrystalContributionBar(this.ociteAccountServiceApi, ociteAccountIdentifier).print()
            );
        });

        mainMenuForm.addButton("核心水晶能量", "", async (father: FormNode): Promise<void> => {
            await this.coreCrystalContributionService.main(playerIdentifier, ociteAccountIdentifier, father);
        });

        uiMaster.pend(playerIdentifier, mainMenuForm);
    }
}
