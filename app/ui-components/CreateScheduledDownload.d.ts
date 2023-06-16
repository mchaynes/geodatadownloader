/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, PasswordFieldProps, SelectFieldProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type CreateScheduledDownloadInputValues = {
    job_name?: string;
    layer_url?: string;
    format?: string;
    access_key_id?: string;
    secret_key?: string;
    destination?: string;
    frequency?: string;
    column_mapping?: string;
    start_at?: string;
};
export declare type CreateScheduledDownloadValidationValues = {
    job_name?: ValidationFunction<string>;
    layer_url?: ValidationFunction<string>;
    format?: ValidationFunction<string>;
    access_key_id?: ValidationFunction<string>;
    secret_key?: ValidationFunction<string>;
    destination?: ValidationFunction<string>;
    frequency?: ValidationFunction<string>;
    column_mapping?: ValidationFunction<string>;
    start_at?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type CreateScheduledDownloadOverridesProps = {
    CreateScheduledDownloadGrid?: PrimitiveOverrideProps<GridProps>;
    job_name?: PrimitiveOverrideProps<TextFieldProps>;
    layer_url?: PrimitiveOverrideProps<TextFieldProps>;
    format?: PrimitiveOverrideProps<SelectFieldProps>;
    access_key_id?: PrimitiveOverrideProps<PasswordFieldProps>;
    secret_key?: PrimitiveOverrideProps<PasswordFieldProps>;
    destination?: PrimitiveOverrideProps<TextFieldProps>;
    frequency?: PrimitiveOverrideProps<SelectFieldProps>;
    column_mapping?: PrimitiveOverrideProps<TextAreaFieldProps>;
    start_at?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type CreateScheduledDownloadProps = React.PropsWithChildren<{
    overrides?: CreateScheduledDownloadOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: CreateScheduledDownloadInputValues) => CreateScheduledDownloadInputValues;
    onSuccess?: (fields: CreateScheduledDownloadInputValues) => void;
    onError?: (fields: CreateScheduledDownloadInputValues, errorMessage: string) => void;
    onChange?: (fields: CreateScheduledDownloadInputValues) => CreateScheduledDownloadInputValues;
    onValidate?: CreateScheduledDownloadValidationValues;
} & React.CSSProperties>;
export default function CreateScheduledDownload(props: CreateScheduledDownloadProps): React.ReactElement;
