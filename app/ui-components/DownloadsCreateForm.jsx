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
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import {
  getOverrideProps,
  useDataStoreBinding,
} from "@aws-amplify/ui-react/internal";
import { Downloads, DownloadSchedule } from "../models";
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
export default function DownloadsCreateForm(props) {
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
    downloadscheduleID: undefined,
    status: "",
    started_at: "",
    finished_at: "",
    messages: [],
  };
  const [downloadscheduleID, setDownloadscheduleID] = React.useState(
    initialValues.downloadscheduleID
  );
  const [status, setStatus] = React.useState(initialValues.status);
  const [started_at, setStarted_at] = React.useState(initialValues.started_at);
  const [finished_at, setFinished_at] = React.useState(
    initialValues.finished_at
  );
  const [messages, setMessages] = React.useState(initialValues.messages);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setDownloadscheduleID(initialValues.downloadscheduleID);
    setCurrentDownloadscheduleIDValue(undefined);
    setCurrentDownloadscheduleIDDisplayValue("");
    setStatus(initialValues.status);
    setStarted_at(initialValues.started_at);
    setFinished_at(initialValues.finished_at);
    setMessages(initialValues.messages);
    setCurrentMessagesValue("");
    setErrors({});
  };
  const [
    currentDownloadscheduleIDDisplayValue,
    setCurrentDownloadscheduleIDDisplayValue,
  ] = React.useState("");
  const [currentDownloadscheduleIDValue, setCurrentDownloadscheduleIDValue] =
    React.useState(undefined);
  const downloadscheduleIDRef = React.createRef();
  const [currentMessagesValue, setCurrentMessagesValue] = React.useState("");
  const messagesRef = React.createRef();
  const downloadScheduleRecords = useDataStoreBinding({
    type: "collection",
    model: DownloadSchedule,
  }).items;
  const getDisplayValue = {
    downloadscheduleID: (r) =>
      `${r?.layer_url ? r?.layer_url + " - " : ""}${r?.id}`,
  };
  const validations = {
    downloadscheduleID: [{ type: "Required" }],
    status: [],
    started_at: [],
    finished_at: [],
    messages: [],
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
  const convertToLocal = (date) => {
    const df = new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "iso8601",
      numberingSystem: "latn",
      hourCycle: "h23",
    });
    const parts = df.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
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
          downloadscheduleID,
          status,
          started_at,
          finished_at,
          messages,
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
          await DataStore.save(new Downloads(modelFields));
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
      {...getOverrideProps(overrides, "DownloadsCreateForm")}
      {...rest}
    >
      <ArrayField
        lengthLimit={1}
        onChange={async (items) => {
          let value = items[0];
          if (onChange) {
            const modelFields = {
              downloadscheduleID: value,
              status,
              started_at,
              finished_at,
              messages,
            };
            const result = onChange(modelFields);
            value = result?.downloadscheduleID ?? value;
          }
          setDownloadscheduleID(value);
          setCurrentDownloadscheduleIDValue(undefined);
        }}
        currentFieldValue={currentDownloadscheduleIDValue}
        label={"Downloadschedule id"}
        items={downloadscheduleID ? [downloadscheduleID] : []}
        hasError={errors?.downloadscheduleID?.hasError}
        errorMessage={errors?.downloadscheduleID?.errorMessage}
        getBadgeText={(value) =>
          value
            ? getDisplayValue.downloadscheduleID(
                downloadScheduleRecords.find((r) => r.id === value)
              )
            : ""
        }
        setFieldValue={(value) => {
          setCurrentDownloadscheduleIDDisplayValue(
            value
              ? getDisplayValue.downloadscheduleID(
                  downloadScheduleRecords.find((r) => r.id === value)
                )
              : ""
          );
          setCurrentDownloadscheduleIDValue(value);
        }}
        inputFieldRef={downloadscheduleIDRef}
        defaultFieldValue={""}
      >
        <Autocomplete
          label="Downloadschedule id"
          isRequired={true}
          isReadOnly={false}
          placeholder="Search DownloadSchedule"
          value={currentDownloadscheduleIDDisplayValue}
          options={downloadScheduleRecords
            .filter(
              (r, i, arr) =>
                arr.findIndex((member) => member?.id === r?.id) === i
            )
            .map((r) => ({
              id: r?.id,
              label: getDisplayValue.downloadscheduleID?.(r),
            }))}
          onSelect={({ id, label }) => {
            setCurrentDownloadscheduleIDValue(id);
            setCurrentDownloadscheduleIDDisplayValue(label);
            runValidationTasks("downloadscheduleID", label);
          }}
          onClear={() => {
            setCurrentDownloadscheduleIDDisplayValue("");
          }}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.downloadscheduleID?.hasError) {
              runValidationTasks("downloadscheduleID", value);
            }
            setCurrentDownloadscheduleIDDisplayValue(value);
            setCurrentDownloadscheduleIDValue(undefined);
          }}
          onBlur={() =>
            runValidationTasks(
              "downloadscheduleID",
              currentDownloadscheduleIDValue
            )
          }
          errorMessage={errors.downloadscheduleID?.errorMessage}
          hasError={errors.downloadscheduleID?.hasError}
          ref={downloadscheduleIDRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "downloadscheduleID")}
        ></Autocomplete>
      </ArrayField>
      <SelectField
        label="Status"
        placeholder="Please select an option"
        isDisabled={false}
        value={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              downloadscheduleID,
              status: value,
              started_at,
              finished_at,
              messages,
            };
            const result = onChange(modelFields);
            value = result?.status ?? value;
          }
          if (errors.status?.hasError) {
            runValidationTasks("status", value);
          }
          setStatus(value);
        }}
        onBlur={() => runValidationTasks("status", status)}
        errorMessage={errors.status?.errorMessage}
        hasError={errors.status?.hasError}
        {...getOverrideProps(overrides, "status")}
      >
        <option
          children="Started"
          value="STARTED"
          {...getOverrideProps(overrides, "statusoption0")}
        ></option>
        <option
          children="Pending"
          value="PENDING"
          {...getOverrideProps(overrides, "statusoption1")}
        ></option>
        <option
          children="Successful"
          value="SUCCESSFUL"
          {...getOverrideProps(overrides, "statusoption2")}
        ></option>
        <option
          children="Failed"
          value="FAILED"
          {...getOverrideProps(overrides, "statusoption3")}
        ></option>
      </SelectField>
      <TextField
        label="Started at"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={started_at && convertToLocal(new Date(started_at))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              downloadscheduleID,
              status,
              started_at: value,
              finished_at,
              messages,
            };
            const result = onChange(modelFields);
            value = result?.started_at ?? value;
          }
          if (errors.started_at?.hasError) {
            runValidationTasks("started_at", value);
          }
          setStarted_at(value);
        }}
        onBlur={() => runValidationTasks("started_at", started_at)}
        errorMessage={errors.started_at?.errorMessage}
        hasError={errors.started_at?.hasError}
        {...getOverrideProps(overrides, "started_at")}
      ></TextField>
      <TextField
        label="Finished at"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={finished_at && convertToLocal(new Date(finished_at))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              downloadscheduleID,
              status,
              started_at,
              finished_at: value,
              messages,
            };
            const result = onChange(modelFields);
            value = result?.finished_at ?? value;
          }
          if (errors.finished_at?.hasError) {
            runValidationTasks("finished_at", value);
          }
          setFinished_at(value);
        }}
        onBlur={() => runValidationTasks("finished_at", finished_at)}
        errorMessage={errors.finished_at?.errorMessage}
        hasError={errors.finished_at?.hasError}
        {...getOverrideProps(overrides, "finished_at")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              downloadscheduleID,
              status,
              started_at,
              finished_at,
              messages: values,
            };
            const result = onChange(modelFields);
            values = result?.messages ?? values;
          }
          setMessages(values);
          setCurrentMessagesValue("");
        }}
        currentFieldValue={currentMessagesValue}
        label={"Messages"}
        items={messages}
        hasError={errors?.messages?.hasError}
        errorMessage={errors?.messages?.errorMessage}
        setFieldValue={setCurrentMessagesValue}
        inputFieldRef={messagesRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Messages"
          isRequired={false}
          isReadOnly={false}
          value={currentMessagesValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.messages?.hasError) {
              runValidationTasks("messages", value);
            }
            setCurrentMessagesValue(value);
          }}
          onBlur={() => runValidationTasks("messages", currentMessagesValue)}
          errorMessage={errors.messages?.errorMessage}
          hasError={errors.messages?.hasError}
          ref={messagesRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "messages")}
        ></TextField>
      </ArrayField>
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
