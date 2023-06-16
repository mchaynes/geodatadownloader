/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type DownloadScheduleCreateFormInputValues = {
    layer_url?: string;
    format?: string;
    access_key_id?: string;
    secret_key?: string;
    destination?: string;
    frequency?: string;
    column_mapping?: string;
};
export declare type DownloadScheduleCreateFormValidationValues = {
    layer_url?: ValidationFunction<string>;
    format?: ValidationFunction<string>;
    access_key_id?: ValidationFunction<string>;
    secret_key?: ValidationFunction<string>;
    destination?: ValidationFunction<string>;
    frequency?: ValidationFunction<string>;
    column_mapping?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DownloadScheduleCreateFormOverridesProps = {
    DownloadScheduleCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    layer_url?: PrimitiveOverrideProps<TextFieldProps>;
    format?: PrimitiveOverrideProps<SelectFieldProps>;
    access_key_id?: PrimitiveOverrideProps<TextFieldProps>;
    secret_key?: PrimitiveOverrideProps<TextFieldProps>;
    destination?: PrimitiveOverrideProps<TextFieldProps>;
    frequency?: PrimitiveOverrideProps<TextFieldProps>;
    column_mapping?: PrimitiveOverrideProps<TextAreaFieldProps>;
} & EscapeHatchProps;
export declare type DownloadScheduleCreateFormProps = React.PropsWithChildren<{
    overrides?: DownloadScheduleCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: DownloadScheduleCreateFormInputValues) => DownloadScheduleCreateFormInputValues;
    onSuccess?: (fields: DownloadScheduleCreateFormInputValues) => void;
    onError?: (fields: DownloadScheduleCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: DownloadScheduleCreateFormInputValues) => DownloadScheduleCreateFormInputValues;
    onValidate?: DownloadScheduleCreateFormValidationValues;
} & React.CSSProperties>;
export default function DownloadScheduleCreateForm(props: DownloadScheduleCreateFormProps): React.ReactElement;
