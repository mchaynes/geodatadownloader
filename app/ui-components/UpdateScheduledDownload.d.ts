/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, PasswordFieldProps, SelectFieldProps, SwitchFieldProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { DownloadSchedule } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type UpdateScheduledDownloadInputValues = {
    layer_url?: string;
    format?: string;
    access_key_id?: string;
    secret_key?: string;
    destination?: string;
    frequency?: string;
    start_at?: string;
    column_mapping?: string;
    job_name?: string;
    where?: string;
    boundary?: string;
    active?: boolean;
    days_of_the_week?: string[];
    day_of_the_month?: number;
    time_of_day?: string;
};
export declare type UpdateScheduledDownloadValidationValues = {
    layer_url?: ValidationFunction<string>;
    format?: ValidationFunction<string>;
    access_key_id?: ValidationFunction<string>;
    secret_key?: ValidationFunction<string>;
    destination?: ValidationFunction<string>;
    frequency?: ValidationFunction<string>;
    start_at?: ValidationFunction<string>;
    column_mapping?: ValidationFunction<string>;
    job_name?: ValidationFunction<string>;
    where?: ValidationFunction<string>;
    boundary?: ValidationFunction<string>;
    active?: ValidationFunction<boolean>;
    days_of_the_week?: ValidationFunction<string>;
    day_of_the_month?: ValidationFunction<number>;
    time_of_day?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UpdateScheduledDownloadOverridesProps = {
    UpdateScheduledDownloadGrid?: PrimitiveOverrideProps<GridProps>;
    layer_url?: PrimitiveOverrideProps<TextFieldProps>;
    format?: PrimitiveOverrideProps<SelectFieldProps>;
    access_key_id?: PrimitiveOverrideProps<PasswordFieldProps>;
    secret_key?: PrimitiveOverrideProps<PasswordFieldProps>;
    destination?: PrimitiveOverrideProps<TextFieldProps>;
    frequency?: PrimitiveOverrideProps<SelectFieldProps>;
    start_at?: PrimitiveOverrideProps<TextFieldProps>;
    column_mapping?: PrimitiveOverrideProps<TextAreaFieldProps>;
    job_name?: PrimitiveOverrideProps<TextFieldProps>;
    where?: PrimitiveOverrideProps<TextFieldProps>;
    boundary?: PrimitiveOverrideProps<TextFieldProps>;
    active?: PrimitiveOverrideProps<SwitchFieldProps>;
    days_of_the_week?: PrimitiveOverrideProps<SelectFieldProps>;
    day_of_the_month?: PrimitiveOverrideProps<TextFieldProps>;
    time_of_day?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type UpdateScheduledDownloadProps = React.PropsWithChildren<{
    overrides?: UpdateScheduledDownloadOverridesProps | undefined | null;
} & {
    id?: string;
    downloadSchedule?: DownloadSchedule;
    onSubmit?: (fields: UpdateScheduledDownloadInputValues) => UpdateScheduledDownloadInputValues;
    onSuccess?: (fields: UpdateScheduledDownloadInputValues) => void;
    onError?: (fields: UpdateScheduledDownloadInputValues, errorMessage: string) => void;
    onChange?: (fields: UpdateScheduledDownloadInputValues) => UpdateScheduledDownloadInputValues;
    onValidate?: UpdateScheduledDownloadValidationValues;
} & React.CSSProperties>;
export default function UpdateScheduledDownload(props: UpdateScheduledDownloadProps): React.ReactElement;
