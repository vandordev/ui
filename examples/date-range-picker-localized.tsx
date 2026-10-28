"use client";

import {
  DateRangePicker,
  dateRangeIndonesianLocale,
} from "@/registry/new-york/date-range-picker";

export const DateRangePickerLocalized = () => (
  <DateRangePicker
    label="Periode laporan"
    placeholder="Pilih tanggal"
    locale={dateRangeIndonesianLocale}
    applyLabel="Terapkan"
    cancelLabel="Batal"
    clearLabel="Hapus"
    clearable
    defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 7) }}
  />
);
