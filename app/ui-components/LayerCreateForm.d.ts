/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type LayerCreateFormInputValues = {};
export declare type LayerCreateFormValidationValues = {};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type LayerCreateFormOverridesProps = {
    LayerCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
} & EscapeHatchProps;
export declare type LayerCreateFormProps = React.PropsWithChildren<{
    overrides?: LayerCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: LayerCreateFormInputValues) => LayerCreateFormInputValues;
    onSuccess?: (fields: LayerCreateFormInputValues) => void;
    onError?: (fields: LayerCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: LayerCreateFormInputValues) => LayerCreateFormInputValues;
    onValidate?: LayerCreateFormValidationValues;
} & React.CSSProperties>;
export default function LayerCreateForm(props: LayerCreateFormProps): React.ReactElement;
