/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { AutocompleteProps, GridProps, SelectFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Downloads } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type DownloadsUpdateFormInputValues = {
    downloadscheduleID?: string;
    status?: string;
    started_at?: string;
    finished_at?: string;
    messages?: string[];
};
export declare type DownloadsUpdateFormValidationValues = {
    downloadscheduleID?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    started_at?: ValidationFunction<string>;
    finished_at?: ValidationFunction<string>;
    messages?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DownloadsUpdateFormOverridesProps = {
    DownloadsUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    downloadscheduleID?: PrimitiveOverrideProps<AutocompleteProps>;
    status?: PrimitiveOverrideProps<SelectFieldProps>;
    started_at?: PrimitiveOverrideProps<TextFieldProps>;
    finished_at?: PrimitiveOverrideProps<TextFieldProps>;
    messages?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type DownloadsUpdateFormProps = React.PropsWithChildren<{
    overrides?: DownloadsUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    downloads?: Downloads;
    onSubmit?: (fields: DownloadsUpdateFormInputValues) => DownloadsUpdateFormInputValues;
    onSuccess?: (fields: DownloadsUpdateFormInputValues) => void;
    onError?: (fields: DownloadsUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: DownloadsUpdateFormInputValues) => DownloadsUpdateFormInputValues;
    onValidate?: DownloadsUpdateFormValidationValues;
} & React.CSSProperties>;
export default function DownloadsUpdateForm(props: DownloadsUpdateFormProps): React.ReactElement;
