import axios, { AxiosInstance } from "axios";

import {
    GetLocalVariablesResponse,
  } from '@figma/rest-api-spec'

export default class FigmaApi {
    private readonly baseUrl = "https://api.figma.com/v1";
    private readonly token: string | undefined;
    private figmaAxios: AxiosInstance;

    constructor(token: string | undefined) {
        this.token = token;
        this.figmaAxios = axios.create({
            baseURL: this.baseUrl,
            headers: {
                "Accept": "*/*",
                "X-Figma-Token": this.token
            }
        })
    }
    
    async getAllVariables(fileId: string) {
        return (await this.figmaAxios.get<GetLocalVariablesResponse>(`/files/${fileId}/variables/local`)).data;
        // 3102나 AFIN DS는 Local Variable 가져오면 Primitive단 값이 많아서 개더러울게 안봐도 뻔하니 /variables/published 호출할 지 고민해봅시다
        // 생각해보니 Primitive에 오타내는 답도 없는 상황도 있으니 냅둡시다
    }
    
}