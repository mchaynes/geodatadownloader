/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SelectField,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { DownloadSchedule } from "../models";
import { fetchByPath, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function DownloadScheduleCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    layer_url: "",
    format: "",
    access_key_id: "",
    secret_key: "",
    destination: "",
    frequency: "",
    column_mapping: "",
  };
  const [layer_url, setLayer_url] = React.useState(initialValues.layer_url);
  const [format, setFormat] = React.useState(initialValues.format);
  const [access_key_id, setAccess_key_id] = React.useState(
    initialValues.access_key_id
  );
  const [secret_key, setSecret_key] = React.useState(initialValues.secret_key);
  const [destination, setDestination] = React.useState(
    initialValues.destination
  );
  const [frequency, setFrequency] = React.useState(initialValues.frequency);
  const [column_mapping, setColumn_mapping] = React.useState(
    initialValues.column_mapping
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setLayer_url(initialValues.layer_url);
    setFormat(initialValues.format);
    setAccess_key_id(initialValues.access_key_id);
    setSecret_key(initialValues.secret_key);
    setDestination(initialValues.destination);
    setFrequency(initialValues.frequency);
    setColumn_mapping(initialValues.column_mapping);
    setErrors({});
  };
  const validations = {
    layer_url: [],
    format: [],
    access_key_id: [],
    secret_key: [],
    destination: [],
    frequency: [],
    column_mapping: [{ type: "JSON" }],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          layer_url,
          format,
          access_key_id,
          secret_key,
          destination,
          frequency,
          column_mapping,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value.trim() === "") {
              modelFields[key] = undefined;
            }
          });
          await DataStore.save(new DownloadSchedule(modelFields));
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "DownloadScheduleCreateForm")}
      {...rest}
    >
      <TextField
        label="Layer url"
        isRequired={false}
        isReadOnly={false}
        value={layer_url}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              layer_url: value,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency,
              column_mapping,
            };
            const result = onChange(modelFields);
            value = result?.layer_url ?? value;
          }
          if (errors.layer_url?.hasError) {
            runValidationTasks("layer_url", value);
          }
          setLayer_url(value);
        }}
        onBlur={() => runValidationTasks("layer_url", layer_url)}
        errorMessage={errors.layer_url?.errorMessage}
        hasError={errors.layer_url?.hasError}
        {...getOverrideProps(overrides, "layer_url")}
      ></TextField>
      <SelectField
        label="Format"
        placeholder="Please select an option"
        isDisabled={false}
        value={format}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              layer_url,
              format: value,
              access_key_id,
              secret_key,
              destination,
              frequency,
              column_mapping,
            };
            const result = onChange(modelFields);
            value = result?.format ?? value;
          }
          if (errors.format?.hasError) {
            runValidationTasks("format", value);
          }
          setFormat(value);
        }}
        onBlur={() => runValidationTasks("format", format)}
        errorMessage={errors.format?.errorMessage}
        hasError={errors.format?.hasError}
        {...getOverrideProps(overrides, "format")}
      >
        <option
          children="Pmtiles"
          value="PMTILES"
          {...getOverrideProps(overrides, "formatoption0")}
        ></option>
        <option
          children="Gpkg"
          value="GPKG"
          {...getOverrideProps(overrides, "formatoption1")}
        ></option>
        <option
          children="Geojson"
          value="GEOJSON"
          {...getOverrideProps(overrides, "formatoption2")}
        ></option>
        <option
          children="Shp"
          value="SHP"
          {...getOverrideProps(overrides, "formatoption3")}
        ></option>
      </SelectField>
      <TextField
        label="Access key id"
        isRequired={false}
        isReadOnly={false}
        value={access_key_id}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              layer_url,
              format,
              access_key_id: value,
              secret_key,
              destination,
              frequency,
              column_mapping,
            };
            const result = onChange(modelFields);
            value = result?.access_key_id ?? value;
          }
          if (errors.access_key_id?.hasError) {
            runValidationTasks("access_key_id", value);
          }
          setAccess_key_id(value);
        }}
        onBlur={() => runValidationTasks("access_key_id", access_key_id)}
        errorMessage={errors.access_key_id?.errorMessage}
        hasError={errors.access_key_id?.hasError}
        {...getOverrideProps(overrides, "access_key_id")}
      ></TextField>
      <TextField
        label="Secret key"
        isRequired={false}
        isReadOnly={false}
        value={secret_key}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              layer_url,
              format,
              access_key_id,
              secret_key: value,
              destination,
              frequency,
              column_mapping,
            };
            const result = onChange(modelFields);
            value = result?.secret_key ?? value;
          }
          if (errors.secret_key?.hasError) {
            runValidationTasks("secret_key", value);
          }
          setSecret_key(value);
        }}
        onBlur={() => runValidationTasks("secret_key", secret_key)}
        errorMessage={errors.secret_key?.errorMessage}
        hasError={errors.secret_key?.hasError}
        {...getOverrideProps(overrides, "secret_key")}
      ></TextField>
      <TextField
        label="Destination"
        isRequired={false}
        isReadOnly={false}
        value={destination}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination: value,
              frequency,
              column_mapping,
            };
            const result = onChange(modelFields);
            value = result?.destination ?? value;
          }
          if (errors.destination?.hasError) {
            runValidationTasks("destination", value);
          }
          setDestination(value);
        }}
        onBlur={() => runValidationTasks("destination", destination)}
        errorMessage={errors.destination?.errorMessage}
        hasError={errors.destination?.hasError}
        {...getOverrideProps(overrides, "destination")}
      ></TextField>
      <TextField
        label="Frequency"
        isRequired={false}
        isReadOnly={false}
        value={frequency}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency: value,
              column_mapping,
            };
            const result = onChange(modelFields);
            value = result?.frequency ?? value;
          }
          if (errors.frequency?.hasError) {
            runValidationTasks("frequency", value);
          }
          setFrequency(value);
        }}
        onBlur={() => runValidationTasks("frequency", frequency)}
        errorMessage={errors.frequency?.errorMessage}
        hasError={errors.frequency?.hasError}
        {...getOverrideProps(overrides, "frequency")}
      ></TextField>
      <TextAreaField
        label="Column mapping"
        isRequired={false}
        isReadOnly={false}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency,
              column_mapping: value,
            };
            const result = onChange(modelFields);
            value = result?.column_mapping ?? value;
          }
          if (errors.column_mapping?.hasError) {
            runValidationTasks("column_mapping", value);
          }
          setColumn_mapping(value);
        }}
        onBlur={() => runValidationTasks("column_mapping", column_mapping)}
        errorMessage={errors.column_mapping?.errorMessage}
        hasError={errors.column_mapping?.hasError}
        {...getOverrideProps(overrides, "column_mapping")}
      ></TextAreaField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
