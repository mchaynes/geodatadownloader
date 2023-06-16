/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Autocomplete,
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Icon,
  ScrollView,
  SelectField,
  Text,
  TextAreaField,
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import {
  getOverrideProps,
  useDataStoreBinding,
} from "@aws-amplify/ui-react/internal";
import { DownloadSchedule, Downloads as Downloads0 } from "../models";
import { fetchByPath, validateField } from "./utils";
import { DataStore } from "aws-amplify";
function ArrayField({
  items = [],
  onChange,
  label,
  inputFieldRef,
  children,
  hasError,
  setFieldValue,
  currentFieldValue,
  defaultFieldValue,
  lengthLimit,
  getBadgeText,
  errorMessage,
}) {
  const labelElement = <Text>{label}</Text>;
  const {
    tokens: {
      components: {
        fieldmessages: { error: errorStyles },
      },
    },
  } = useTheme();
  const [selectedBadgeIndex, setSelectedBadgeIndex] = React.useState();
  const [isEditing, setIsEditing] = React.useState();
  React.useEffect(() => {
    if (isEditing) {
      inputFieldRef?.current?.focus();
    }
  }, [isEditing]);
  const removeItem = async (removeIndex) => {
    const newItems = items.filter((value, index) => index !== removeIndex);
    await onChange(newItems);
    setSelectedBadgeIndex(undefined);
  };
  const addItem = async () => {
    if (
      currentFieldValue !== undefined &&
      currentFieldValue !== null &&
      currentFieldValue !== "" &&
      !hasError
    ) {
      const newItems = [...items];
      if (selectedBadgeIndex !== undefined) {
        newItems[selectedBadgeIndex] = currentFieldValue;
        setSelectedBadgeIndex(undefined);
      } else {
        newItems.push(currentFieldValue);
      }
      await onChange(newItems);
      setIsEditing(false);
    }
  };
  const arraySection = (
    <React.Fragment>
      {!!items?.length && (
        <ScrollView height="inherit" width="inherit" maxHeight={"7rem"}>
          {items.map((value, index) => {
            return (
              <Badge
                key={index}
                style={{
                  cursor: "pointer",
                  alignItems: "center",
                  marginRight: 3,
                  marginTop: 3,
                  backgroundColor:
                    index === selectedBadgeIndex ? "#B8CEF9" : "",
                }}
                onClick={() => {
                  setSelectedBadgeIndex(index);
                  setFieldValue(items[index]);
                  setIsEditing(true);
                }}
              >
                {getBadgeText ? getBadgeText(value) : value.toString()}
                <Icon
                  style={{
                    cursor: "pointer",
                    paddingLeft: 3,
                    width: 20,
                    height: 20,
                  }}
                  viewBox={{ width: 20, height: 20 }}
                  paths={[
                    {
                      d: "M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z",
                      stroke: "black",
                    },
                  ]}
                  ariaLabel="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(index);
                  }}
                />
              </Badge>
            );
          })}
        </ScrollView>
      )}
      <Divider orientation="horizontal" marginTop={5} />
    </React.Fragment>
  );
  if (lengthLimit !== undefined && items.length >= lengthLimit && !isEditing) {
    return (
      <React.Fragment>
        {labelElement}
        {arraySection}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {labelElement}
      {isEditing && children}
      {!isEditing ? (
        <>
          <Button
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Add item
          </Button>
          {errorMessage && hasError && (
            <Text color={errorStyles.color} fontSize={errorStyles.fontSize}>
              {errorMessage}
            </Text>
          )}
        </>
      ) : (
        <Flex justifyContent="flex-end">
          {(currentFieldValue || isEditing) && (
            <Button
              children="Cancel"
              type="button"
              size="small"
              onClick={() => {
                setFieldValue(defaultFieldValue);
                setIsEditing(false);
                setSelectedBadgeIndex(undefined);
              }}
            ></Button>
          )}
          <Button
            size="small"
            variation="link"
            isDisabled={hasError}
            onClick={addItem}
          >
            {selectedBadgeIndex !== undefined ? "Save" : "Add"}
          </Button>
        </Flex>
      )}
      {arraySection}
    </React.Fragment>
  );
}
export default function DownloadScheduleUpdateForm(props) {
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
    job_name: "",
    layer_url: "",
    format: "",
    access_key_id: "",
    secret_key: "",
    destination: "",
    frequency: "",
    Downloads: [],
    start_at: "",
    column_mapping: "",
  };
  const [job_name, setJob_name] = React.useState(initialValues.job_name);
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
  const [Downloads, setDownloads] = React.useState(initialValues.Downloads);
  const [start_at, setStart_at] = React.useState(initialValues.start_at);
  const [column_mapping, setColumn_mapping] = React.useState(
    initialValues.column_mapping
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = downloadScheduleRecord
      ? {
          ...initialValues,
          ...downloadScheduleRecord,
          Downloads: linkedDownloads,
        }
      : initialValues;
    setJob_name(cleanValues.job_name);
    setLayer_url(cleanValues.layer_url);
    setFormat(cleanValues.format);
    setAccess_key_id(cleanValues.access_key_id);
    setSecret_key(cleanValues.secret_key);
    setDestination(cleanValues.destination);
    setFrequency(cleanValues.frequency);
    setDownloads(cleanValues.Downloads ?? []);
    setCurrentDownloadsValue(undefined);
    setCurrentDownloadsDisplayValue("");
    setStart_at(cleanValues.start_at);
    setColumn_mapping(
      typeof cleanValues.column_mapping === "string"
        ? cleanValues.column_mapping
        : JSON.stringify(cleanValues.column_mapping)
    );
    setErrors({});
  };
  const [downloadScheduleRecord, setDownloadScheduleRecord] = React.useState(
    downloadScheduleModelProp
  );
  const [linkedDownloads, setLinkedDownloads] = React.useState([]);
  const canUnlinkDownloads = false;
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? await DataStore.query(DownloadSchedule, idProp)
        : downloadScheduleModelProp;
      setDownloadScheduleRecord(record);
      const linkedDownloads = record ? await record.Downloads.toArray() : [];
      setLinkedDownloads(linkedDownloads);
    };
    queryData();
  }, [idProp, downloadScheduleModelProp]);
  React.useEffect(resetStateValues, [downloadScheduleRecord, linkedDownloads]);
  const [currentDownloadsDisplayValue, setCurrentDownloadsDisplayValue] =
    React.useState("");
  const [currentDownloadsValue, setCurrentDownloadsValue] =
    React.useState(undefined);
  const DownloadsRef = React.createRef();
  const getIDValue = {
    Downloads: (r) => JSON.stringify({ id: r?.id }),
  };
  const DownloadsIdSet = new Set(
    Array.isArray(Downloads)
      ? Downloads.map((r) => getIDValue.Downloads?.(r))
      : getIDValue.Downloads?.(Downloads)
  );
  const downloadsRecords = useDataStoreBinding({
    type: "collection",
    model: Downloads0,
  }).items;
  const getDisplayValue = {
    Downloads: (r) => `${r?.status ? r?.status + " - " : ""}${r?.id}`,
  };
  const validations = {
    job_name: [{ type: "Required" }],
    layer_url: [],
    format: [],
    access_key_id: [],
    secret_key: [],
    destination: [],
    frequency: [],
    Downloads: [],
    start_at: [],
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
          job_name,
          layer_url,
          format,
          access_key_id,
          secret_key,
          destination,
          frequency,
          Downloads,
          start_at,
          column_mapping,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(
                    fieldName,
                    item,
                    getDisplayValue[fieldName]
                  )
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(
                fieldName,
                modelFields[fieldName],
                getDisplayValue[fieldName]
              )
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
          const promises = [];
          const downloadsToLink = [];
          const downloadsToUnLink = [];
          const downloadsSet = new Set();
          const linkedDownloadsSet = new Set();
          Downloads.forEach((r) => downloadsSet.add(getIDValue.Downloads?.(r)));
          linkedDownloads.forEach((r) =>
            linkedDownloadsSet.add(getIDValue.Downloads?.(r))
          );
          linkedDownloads.forEach((r) => {
            if (!downloadsSet.has(getIDValue.Downloads?.(r))) {
              downloadsToUnLink.push(r);
            }
          });
          Downloads.forEach((r) => {
            if (!linkedDownloadsSet.has(getIDValue.Downloads?.(r))) {
              downloadsToLink.push(r);
            }
          });
          downloadsToUnLink.forEach((original) => {
            if (!canUnlinkDownloads) {
              throw Error(
                `Downloads ${original.id} cannot be unlinked from DownloadSchedule because downloadscheduleID is a required field.`
              );
            }
            promises.push(
              DataStore.save(
                Downloads.copyOf(original, (updated) => {
                  updated.downloadscheduleID = null;
                })
              )
            );
          });
          downloadsToLink.forEach((original) => {
            promises.push(
              DataStore.save(
                Downloads.copyOf(original, (updated) => {
                  updated.downloadscheduleID = downloadScheduleRecord.id;
                })
              )
            );
          });
          const modelFieldsToSave = {
            job_name: modelFields.job_name,
            layer_url: modelFields.layer_url,
            format: modelFields.format,
            access_key_id: modelFields.access_key_id,
            secret_key: modelFields.secret_key,
            destination: modelFields.destination,
            frequency: modelFields.frequency,
            start_at: modelFields.start_at,
            column_mapping: modelFields.column_mapping,
          };
          promises.push(
            DataStore.save(
              DownloadSchedule.copyOf(downloadScheduleRecord, (updated) => {
                Object.assign(updated, modelFieldsToSave);
              })
            )
          );
          await Promise.all(promises);
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "DownloadScheduleUpdateForm")}
      {...rest}
    >
      <TextField
        label="Job name"
        isRequired={true}
        isReadOnly={false}
        value={job_name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              job_name: value,
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency,
              Downloads,
              start_at,
              column_mapping,
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
      <TextField
        label="Layer url"
        isRequired={false}
        isReadOnly={false}
        value={layer_url}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              job_name,
              layer_url: value,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency,
              Downloads,
              start_at,
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
              job_name,
              layer_url,
              format: value,
              access_key_id,
              secret_key,
              destination,
              frequency,
              Downloads,
              start_at,
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
              job_name,
              layer_url,
              format,
              access_key_id: value,
              secret_key,
              destination,
              frequency,
              Downloads,
              start_at,
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
              job_name,
              layer_url,
              format,
              access_key_id,
              secret_key: value,
              destination,
              frequency,
              Downloads,
              start_at,
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
              job_name,
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination: value,
              frequency,
              Downloads,
              start_at,
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
      <SelectField
        label="Frequency"
        placeholder="Please select an option"
        isDisabled={false}
        value={frequency}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              job_name,
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency: value,
              Downloads,
              start_at,
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
        <option
          children="Hourly"
          value="HOURLY"
          {...getOverrideProps(overrides, "frequencyoption3")}
        ></option>
      </SelectField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              job_name,
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency,
              Downloads: values,
              start_at,
              column_mapping,
            };
            const result = onChange(modelFields);
            values = result?.Downloads ?? values;
          }
          setDownloads(values);
          setCurrentDownloadsValue(undefined);
          setCurrentDownloadsDisplayValue("");
        }}
        currentFieldValue={currentDownloadsValue}
        label={"Downloads"}
        items={Downloads}
        hasError={errors?.Downloads?.hasError}
        errorMessage={errors?.Downloads?.errorMessage}
        getBadgeText={getDisplayValue.Downloads}
        setFieldValue={(model) => {
          setCurrentDownloadsDisplayValue(
            model ? getDisplayValue.Downloads(model) : ""
          );
          setCurrentDownloadsValue(model);
        }}
        inputFieldRef={DownloadsRef}
        defaultFieldValue={""}
      >
        <Autocomplete
          label="Downloads"
          isRequired={false}
          isReadOnly={false}
          placeholder="Search Downloads"
          value={currentDownloadsDisplayValue}
          options={downloadsRecords
            .filter((r) => !DownloadsIdSet.has(getIDValue.Downloads?.(r)))
            .map((r) => ({
              id: getIDValue.Downloads?.(r),
              label: getDisplayValue.Downloads?.(r),
            }))}
          onSelect={({ id, label }) => {
            setCurrentDownloadsValue(
              downloadsRecords.find((r) =>
                Object.entries(JSON.parse(id)).every(
                  ([key, value]) => r[key] === value
                )
              )
            );
            setCurrentDownloadsDisplayValue(label);
            runValidationTasks("Downloads", label);
          }}
          onClear={() => {
            setCurrentDownloadsDisplayValue("");
          }}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.Downloads?.hasError) {
              runValidationTasks("Downloads", value);
            }
            setCurrentDownloadsDisplayValue(value);
            setCurrentDownloadsValue(undefined);
          }}
          onBlur={() =>
            runValidationTasks("Downloads", currentDownloadsDisplayValue)
          }
          errorMessage={errors.Downloads?.errorMessage}
          hasError={errors.Downloads?.hasError}
          ref={DownloadsRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "Downloads")}
        ></Autocomplete>
      </ArrayField>
      <TextField
        label="Start at"
        isRequired={false}
        isReadOnly={false}
        value={start_at}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              job_name,
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency,
              Downloads,
              start_at: value,
              column_mapping,
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
        value={column_mapping}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              job_name,
              layer_url,
              format,
              access_key_id,
              secret_key,
              destination,
              frequency,
              Downloads,
              start_at,
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
