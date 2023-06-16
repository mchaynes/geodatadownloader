/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Layer } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type LayerUpdateFormInputValues = {};
export declare type LayerUpdateFormValidationValues = {};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type LayerUpdateFormOverridesProps = {
    LayerUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
} & EscapeHatchProps;
export declare type LayerUpdateFormProps = React.PropsWithChildren<{
    overrides?: LayerUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    layer?: Layer;
    onSubmit?: (fields: LayerUpdateFormInputValues) => LayerUpdateFormInputValues;
    onSuccess?: (fields: LayerUpdateFormInputValues) => void;
    onError?: (fields: LayerUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: LayerUpdateFormInputValues) => LayerUpdateFormInputValues;
    onValidate?: LayerUpdateFormValidationValues;
} & React.CSSProperties>;
export default function LayerUpdateForm(props: LayerUpdateFormProps): React.ReactElement;
