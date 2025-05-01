import 'dotenv/config';
import * as fs from 'fs'

import FigmaApi from './api';
import { generateTokenJsonfromVariable } from './export';


const main = async () => {
    const fileId = process.env.FILEID;
    const figmaApi = new FigmaApi(process.env.ACCESS_TOKEN!);

    const localVariables = await figmaApi.getAllVariables(fileId!);
    const tokenFiles = generateTokenJsonfromVariable(localVariables);

    if (!fs.existsSync('output')) {
        fs.mkdirSync('output')
    }

    Object.entries(tokenFiles).forEach(([fileName, fileContent]) => {
        fs.writeFileSync(`output/${fileName}`, JSON.stringify(fileContent, null, 2))
        console.log(`${fileName} Done`)
    })

}


main()