/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { AutocompleteProps, GridProps, SelectFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type DownloadsCreateFormInputValues = {
    downloadscheduleID?: string;
    status?: string;
    started_at?: string;
    finished_at?: string;
    messages?: string[];
};
export declare type DownloadsCreateFormValidationValues = {
    downloadscheduleID?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    started_at?: ValidationFunction<string>;
    finished_at?: ValidationFunction<string>;
    messages?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DownloadsCreateFormOverridesProps = {
    DownloadsCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    downloadscheduleID?: PrimitiveOverrideProps<AutocompleteProps>;
    status?: PrimitiveOverrideProps<SelectFieldProps>;
    started_at?: PrimitiveOverrideProps<TextFieldProps>;
    finished_at?: PrimitiveOverrideProps<TextFieldProps>;
    messages?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type DownloadsCreateFormProps = React.PropsWithChildren<{
    overrides?: DownloadsCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: DownloadsCreateFormInputValues) => DownloadsCreateFormInputValues;
    onSuccess?: (fields: DownloadsCreateFormInputValues) => void;
    onError?: (fields: DownloadsCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: DownloadsCreateFormInputValues) => DownloadsCreateFormInputValues;
    onValidate?: DownloadsCreateFormValidationValues;
} & React.CSSProperties>;
export default function DownloadsCreateForm(props: DownloadsCreateFormProps): React.ReactElement;
