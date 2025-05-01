import { VariableCodeSyntax, VariableScope } from '@figma/rest-api-spec'

export interface FigmaVariable {
    $type: 'color' | 'string' | 'number' | 'boolean';
    $value: string | number | boolean;
    $description?: string;
    $extensions?: {
        'com.figma'?: {
            hiddenFromPublishing?: boolean;
            codeSyntax?: VariableCodeSyntax;
            scopes?: VariableScope[];
        }
    }
}

export type FigmaVariableNested = FigmaVariable | ({ // 계층 구조
    [tokenName: string]: FigmaVariable
  } & { $type?: never; $value?: never })

export type FigmaVariableAsFile = {[key: string]: FigmaVariable | FigmaVariableNested};