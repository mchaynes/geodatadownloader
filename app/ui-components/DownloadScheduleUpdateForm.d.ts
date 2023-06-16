/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { AutocompleteProps, GridProps, SelectFieldProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { DownloadSchedule, Downloads as Downloads0 } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type DownloadScheduleUpdateFormInputValues = {
    job_name?: string;
    layer_url?: string;
    format?: string;
    access_key_id?: string;
    secret_key?: string;
    destination?: string;
    frequency?: string;
    Downloads?: Downloads0[];
    start_at?: string;
    column_mapping?: string;
};
export declare type DownloadScheduleUpdateFormValidationValues = {
    job_name?: ValidationFunction<string>;
    layer_url?: ValidationFunction<string>;
    format?: ValidationFunction<string>;
    access_key_id?: ValidationFunction<string>;
    secret_key?: ValidationFunction<string>;
    destination?: ValidationFunction<string>;
    frequency?: ValidationFunction<string>;
    Downloads?: ValidationFunction<Downloads0>;
    start_at?: ValidationFunction<string>;
    column_mapping?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DownloadScheduleUpdateFormOverridesProps = {
    DownloadScheduleUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    job_name?: PrimitiveOverrideProps<TextFieldProps>;
    layer_url?: PrimitiveOverrideProps<TextFieldProps>;
    format?: PrimitiveOverrideProps<SelectFieldProps>;
    access_key_id?: PrimitiveOverrideProps<TextFieldProps>;
    secret_key?: PrimitiveOverrideProps<TextFieldProps>;
    destination?: PrimitiveOverrideProps<TextFieldProps>;
    frequency?: PrimitiveOverrideProps<SelectFieldProps>;
    Downloads?: PrimitiveOverrideProps<AutocompleteProps>;
    start_at?: PrimitiveOverrideProps<TextFieldProps>;
    column_mapping?: PrimitiveOverrideProps<TextAreaFieldProps>;
} & EscapeHatchProps;
export declare type DownloadScheduleUpdateFormProps = React.PropsWithChildren<{
    overrides?: DownloadScheduleUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    downloadSchedule?: DownloadSchedule;
    onSubmit?: (fields: DownloadScheduleUpdateFormInputValues) => DownloadScheduleUpdateFormInputValues;
    onSuccess?: (fields: DownloadScheduleUpdateFormInputValues) => void;
    onError?: (fields: DownloadScheduleUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: DownloadScheduleUpdateFormInputValues) => DownloadScheduleUpdateFormInputValues;
    onValidate?: DownloadScheduleUpdateFormValidationValues;
} & React.CSSProperties>;
export default function DownloadScheduleUpdateForm(props: DownloadScheduleUpdateFormProps): React.ReactElement;
