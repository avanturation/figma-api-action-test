// Figma Plugin Code

const rgbToHex = (rgb: { r: number; g: number; b: number }) => {
  const to255 = (v: number) => Math.round(v * 255);
  return (
    '#' +
    [rgb.r, rgb.g, rgb.b]
      .map(to255)
      .map((val) => val.toString(16).padStart(2, '0'))
      .join('')
  );
};

const getTokenTypeFromVariable = (variable: Variable) => {
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

const getTokenValueFromVariable = (
  variable: Variable,
  modeId: string,
  localVariables: { [id: string]: Variable }
) => {
  const rawValue = variable.valuesByMode[modeId];
  if (typeof rawValue === 'object') {
    if ('type' in rawValue && rawValue.type === 'VARIABLE_ALIAS') {
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

const generateTokenJsonfromVariable = async () => {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();

  const tokenFiles: { [fileName: string]: any } = {};
  const variableMap = Object.fromEntries(
    variables.map((v) => [v.id, v])
  );

  for (const variable of variables) {
    if (variable.remote) continue;

    const collection = collections.find(
      (c) => c.id === variable.variableCollectionId
    );
    if (!collection) continue;

    for (const mode of collection.modes) {
      const fileName = `${collection.name}.${mode.name}.json`;

      if (!tokenFiles[fileName]) {
        tokenFiles[fileName] = {};
      }

      let obj = tokenFiles[fileName];
      const path = variable.name.split('/');
      for (const part of path) {
        obj[part] = obj[part] || {};
        obj = obj[part];
      }

      const token = {
        $type: getTokenTypeFromVariable(variable),
        $value: getTokenValueFromVariable(variable, mode.modeId, variableMap),
        $description: variable.description,
        $extensions: {
          'com.figma': {
            hiddenFromPublishing: variable.hiddenFromPublishing,
            scopes: variable.scopes,
            codeSyntax: variable.codeSyntax,
          },
        },
      };

      Object.assign(obj, token);
    }
  }

  return tokenFiles;
};

(async () => {
  const tokens = await generateTokenJsonfromVariable();
  console.log("🎨 Generated Tokens:", tokens);

  // 예: 첫 번째 결과를 JSON로 저장 (선택)
  const fileNames = Object.keys(tokens);
  if (fileNames.length > 0) {
    const name = fileNames[0];
    const content = JSON.stringify(tokens[name], null, 2);
    figma.showUI(`<script></script>`, { visible: false });
    figma.ui.postMessage({ type: 'save', name, content });
    
  }

  figma.showUI(`<pre>${JSON.stringify(object, null, 2)}</pre>`, {
    width: 500,
    height: 700,
  });

  figma.closePlugin("토큰 추출 완료 ✨");
})();
