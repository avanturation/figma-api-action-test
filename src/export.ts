import { GetLocalVariablesResponse, LocalVariable } from "@figma/rest-api-spec";
import { FigmaVariable, FigmaVariableAsFile } from "./interface";
import { rgbToHex } from "./util";

const getTokenTypeFromVariable = (variable: LocalVariable) => {
    switch (variable.resolvedType) {
        case 'BOOLEAN':
          return 'boolean';
        case 'COLOR':
          return 'color';
        case 'FLOAT':
          return 'number';
        case 'STRING':
          return 'string';
      }
};

const getTokenValueFromVariable = (variable: LocalVariable, modeId: string, localVariables: { [id: string]: LocalVariable }) => {
    const rawValue = variable.valuesByMode[modeId];
    if (typeof rawValue === 'object') {
        if ('type' in rawValue && rawValue.type === 'VARIABLE_ALIAS') {
            // Background/Root/Strong -> Color/Theme/Solid ... 참조하는 경우
            const aliasedVariable = localVariables[rawValue.id];
            return `{${aliasedVariable.name.replace(/\//g, '.')}}`;
        } else if ('r' in rawValue) {
            return rgbToHex(rawValue);
        }

        throw new Error(`지 얼굴같이 생긴 값 던졌네 ${rawValue}`);
    } else {
        return rawValue;
    }
};

 
export const generateTokenJsonfromVariable = (figmaFileResp: GetLocalVariablesResponse) => {
    const tokenFiles: { [fileName: string]: FigmaVariableAsFile } = {};
    const variableCollections = figmaFileResp.meta.variableCollections;
    const variables = figmaFileResp.meta.variables;

    Object.values(variables).forEach((singleVariable) => {
        if (singleVariable.remote) return;

        const collection = variableCollections[singleVariable.variableCollectionId];

        collection.modes.forEach((mode) => {
            const fileName = `${collection.name}.${mode.name}.json`;

            if (!tokenFiles[fileName]) {
                tokenFiles[fileName] = {};
            }

            let obj: any = tokenFiles[fileName];

            singleVariable.name.split('/').forEach((groupName) => { // Color/Background/Root/Strong -> Color, Background, Root, Strong
                obj[groupName] = obj[groupName] || {};
                obj = obj[groupName];
            })

            const token: FigmaVariable = {
                $type: getTokenTypeFromVariable(singleVariable),
                $value: getTokenValueFromVariable(singleVariable, mode.modeId, variables),
                $description: singleVariable.description,
                $extensions: {
                    'com.figma': {
                        hiddenFromPublishing: singleVariable.hiddenFromPublishing,
                        scopes: singleVariable.scopes,
                        codeSyntax: singleVariable.codeSyntax,
                    },
                },
            };

            Object.assign(obj, token);
        })
    })
    return tokenFiles;
}