"use client";

import { cn } from "cn";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parseIncompletePhoneNumber,
} from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import type { InputProps } from "./input";
import { InputGroup, InputGroupInput } from "./input-group";
import { Select } from "./select";

export type InputPhoneProps = Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "type" | "icon" | "name"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  defaultCountry?: CountryCode;
  locale?: string;
  countrySelectLabel?: string;
};

const countries = getCountries();

const parseDraft = (draft: string, country: CountryCode) => {
  let compact = parseIncompletePhoneNumber(draft);
  if (country === "ID" && !compact.startsWith("+")) {
    compact = compact.replace(/^62/, "").replace(/^0+/, "");
  }
  const formatter = new AsYouType(country);
  formatter.input(compact);
  const callingCode = formatter.getCallingCode();
  const nextCountry = compact.startsWith("+")
    ? (formatter.getCountry() ??
      countries.find((item) => getCountryCallingCode(item) === callingCode) ??
      country)
    : country;
  const prefix = `+${getCountryCallingCode(nextCountry)}`;
  const national =
    formatter.getNumber()?.nationalNumber ??
    (compact.startsWith(prefix) ? compact.slice(prefix.length) : compact);
  const international = new AsYouType();
  const formatted = national ? international.input(`${prefix}${national}`) : "";
  return {
    country: nextCountry,
    draft: formatted.slice(prefix.length).trimStart(),
    value: international.getNumberValue()?.slice(1),
  };
};

const stateFromValue = (value: string | undefined, country: CountryCode) => {
  const normalized =
    value && !value.startsWith("+") && !value.startsWith("0")
      ? `+${value}`
      : value;
  const parsed = parseDraft(normalized ?? "", country);
  return { ...parsed, controlledValue: value };
};

export const InputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
  function InputPhone(
    {
      value,
      defaultValue,
      onValueChange,
      defaultCountry = "ID",
      locale = "en",
      countrySelectLabel = "Country calling code",
      label,
      labelStyle = "floating",
      labelClassName,
      containerClassName,
      className,
      id,
      disabled,
      readOnly,
      ...props
    },
    forwardedRef
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement
    );
    const pendingCaret = React.useRef<number | null>(null);
    const [state, setState] = React.useState(() => ({
      ...stateFromValue(value ?? defaultValue, defaultCountry),
      controlledValue: value,
    }));
    if (value !== state.controlledValue) {
      setState(
        value === state.value
          ? { ...state, controlledValue: value }
          : { ...stateFromValue(value, state.country), controlledValue: value }
      );
    }
    React.useLayoutEffect(() => {
      const input = inputRef.current;
      if (
        input &&
        document.activeElement === input &&
        pendingCaret.current !== null
      ) {
        input.setSelectionRange(pendingCaret.current, pendingCaret.current);
      }
      pendingCaret.current = null;
    }, [state]);

    const options = React.useMemo(() => {
      const names = new Intl.DisplayNames([locale], { type: "region" });
      return countries
        .map((country) => ({
          country,
          label: `${names.of(country) ?? country} (+${getCountryCallingCode(country)})`,
        }))
        .toSorted((left, right) =>
          left.label.localeCompare(right.label, locale)
        );
    }, [locale]);

    const update = (draft: string, country: CountryCode) => {
      const parsed = parseDraft(draft, country);
      const caretPosition = inputRef.current?.selectionStart;
      if (caretPosition !== null && caretPosition !== undefined) {
        const digitCount = draft
          .slice(0, caretPosition)
          .replaceAll(/\D/g, "").length;
        let seen = 0;
        let nextCaret = parsed.draft.length;
        for (let index = 0; index < parsed.draft.length; index += 1) {
          if (/\d/.test(parsed.draft[index])) {
            seen += 1;
          }
          if (seen >= digitCount) {
            nextCaret = index + 1;
            break;
          }
        }
        pendingCaret.current = nextCaret;
      }
      setState({ ...parsed, controlledValue: value });
      onValueChange?.(parsed.value);
    };

    const selectedOption = options.find(
      (option) => option.country === state.country
    );

    return (
      <div
        data-slot="phone-input"
        className={cn("grid min-w-0 gap-1.5", containerClassName)}
      >
        <InputGroup className="flex-nowrap">
          <Select
            data={options.map((option) => ({
              label: option.label,
              value: option.country,
            }))}
            value={state.country}
            disabled={disabled || readOnly}
            aria-label={`${countrySelectLabel}: ${selectedOption?.label ?? state.country}`}
            className="flex w-20 shrink-0 items-center justify-center gap-1 self-end rounded-l-md px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
            trigger={
              <button
                type="button"
                className={label && labelStyle === "floating" ? "h-12" : "h-9"}
              >
                +{getCountryCallingCode(state.country)}
                <ChevronDown aria-hidden="true" className="size-4" />
              </button>
            }
            onValueChange={(country) => {
              if (country) {
                update(state.draft, country);
              }
            }}
          />
          <InputGroupInput
            {...props}
            ref={inputRef}
            id={inputId}
            label={label}
            labelStyle={labelStyle}
            labelClassName={labelClassName}
            type="tel"
            inputMode="tel"
            autoComplete={props.autoComplete ?? "tel-national"}
            value={state.draft}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={props["aria-invalid"]}
            onChange={(event) =>
              update(event.currentTarget.value, state.country)
            }
            className={cn("border-l border-input", className)}
          />
        </InputGroup>
      </div>
    );
  }
);
