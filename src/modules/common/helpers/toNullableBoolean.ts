export function toNullableBoolean(value: boolean | null): boolean | null {
  return value === null ? null : !!value;
}
