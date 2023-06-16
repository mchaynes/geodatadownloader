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
  PasswordField,
  SelectField,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { DownloadSchedule } from "../models";
import { fetchByPath, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function UpdateScheduledDownload(props) {
  const {
    id: idProp,
    downloadSchedule: downloadScheduleModelProp,
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
    access_key_id: undefined,
    secret_key: undefined,
    destination: "",
    frequency: "",
    start_at: "",
    column_mapping: "",
    job_name: "",
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
  const [start_at, setStart_at] = React.useState(initialValues.start_at);
  const [column_mapping, setColumn_mapping] = React.useState(
    initialValues.column_mapping
  );
  const [job_name, setJob_name] = React.useState(initialValues.job_name);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = downloadScheduleRecord
      ? { ...initialValues, ...downloadScheduleRecord }
      : initialValues;
    setLayer_url(cleanValues.layer_url);
    setFormat(cleanValues.format);
    setAccess_key_id(cleanValues.access_key_id);
    setSecret_key(cleanValues.secret_key);
    setDestination(cleanValues.destination);
    setFrequency(cleanValues.frequency);
    setStart_at(cleanValues.start_at);
    setColumn_mapping(
      typeof cleanValues.column_mapping === "string"
        ? cleanValues.column_mapping
        : JSON.stringify(cleanValues.column_mapping)
    );
    setJob_name(cleanValues.job_name);
    setErrors({});
  };
  const [downloadScheduleRecord, setDownloadScheduleRecord] = React.useState(
    downloadScheduleModelProp
  );
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? await DataStore.query(DownloadSchedule, idProp)
        : downloadScheduleModelProp;
      setDownloadScheduleRecord(record);
    };
    queryData();
  }, [idProp, downloadScheduleModelProp]);
  React.useEffect(resetStateValues, [downloadScheduleRecord]);
  const validations = {
    layer_url: [{ type: "Required" }],
    format: [],
    access_key_id: [{ type: "Required" }],
    secret_key: [{ type: "Required" }],
    destination: [{ type: "Required" }],
    frequency: [],
    start_at: [],
    column_mapping: [{ type: "JSON" }],
    job_name: [{ type: "Required" }],
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
          start_at,
          column_mapping,
          job_name,
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
          await DataStore.save(
            DownloadSchedule.copyOf(downloadScheduleRecord, (updated) => {
              Object.assign(updated, modelFields);
            })
          );
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "UpdateScheduledDownload")}
      {...rest}
    >
      <TextField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Layer url</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        isRequired={true}
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
              start_at,
              column_mapping,
              job_name,
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
              start_at,
              column_mapping,
              job_name,
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
          children="PMTILES"
          value="PMTILES"
          {...getOverrideProps(overrides, "formatoption0")}
        ></option>
        <option
          children="GPKG"
          value="GPKG"
          {...getOverrideProps(overrides, "formatoption1")}
        ></option>
        <option
          children="GEOJSON"
          value="GEOJSON"
          {...getOverrideProps(overrides, "formatoption2")}
        ></option>
        <option
          children="SHP"
          value="SHP"
          {...getOverrideProps(overrides, "formatoption3")}
        ></option>
      </SelectField>
      <PasswordField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Access key id</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        isRequired={true}
        isReadOnly={false}
        defaultValue={access_key_id}
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
              start_at,
              column_mapping,
              job_name,
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
      ></PasswordField>
      <PasswordField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Secret key</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        isRequired={true}
        isReadOnly={false}
        defaultValue={secret_key}
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
              start_at,
              column_mapping,
              job_name,
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
      ></PasswordField>
      <TextField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Destination</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        isRequired={true}
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
              start_at,
              column_mapping,
              job_name,
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
      <SelectField
        label="Frequency"
        placeholder="Please select an option"
        isDisabled={false}
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
              start_at,
              column_mapping,
              job_name,
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
      >
        <option
          children="Daily"
          value="DAILY"
          {...getOverrideProps(overrides, "frequencyoption0")}
        ></option>
        <option
          children="Weekly"
          value="WEEKLY"
          {...getOverrideProps(overrides, "frequencyoption1")}
        ></option>
        <option
          children="Monthly"
          value="MONTHLY"
          {...getOverrideProps(overrides, "frequencyoption2")}
        ></option>
      </SelectField>
      <TextField
        label="Start at"
        isRequired={false}
        isReadOnly={false}
        value={start_at}
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
              start_at: value,
              column_mapping,
              job_name,
            };
            const result = onChange(modelFields);
            value = result?.start_at ?? value;
          }
          if (errors.start_at?.hasError) {
            runValidationTasks("start_at", value);
          }
          setStart_at(value);
        }}
        onBlur={() => runValidationTasks("start_at", start_at)}
        errorMessage={errors.start_at?.errorMessage}
        hasError={errors.start_at?.hasError}
        {...getOverrideProps(overrides, "start_at")}
      ></TextField>
      <TextAreaField
        label="Column mapping"
        isRequired={false}
        isReadOnly={false}
        placeholder='{"column1": "new_column_name1", "column2": "new_column_name2" } '
        value={column_mapping}
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
              start_at,
              column_mapping: value,
              job_name,
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
      <TextField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Job name</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        isRequired={true}
        isReadOnly={false}
        value={job_name}
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
              start_at,
              column_mapping,
              job_name: value,
            };
            const result = onChange(modelFields);
            value = result?.job_name ?? value;
          }
          if (errors.job_name?.hasError) {
            runValidationTasks("job_name", value);
          }
          setJob_name(value);
        }}
        onBlur={() => runValidationTasks("job_name", job_name)}
        errorMessage={errors.job_name?.errorMessage}
        hasError={errors.job_name?.hasError}
        {...getOverrideProps(overrides, "job_name")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || downloadScheduleModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || downloadScheduleModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
