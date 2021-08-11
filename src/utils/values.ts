export const getNumericValue = (value: unknown): number | undefined => {
  // @ts-expect-error parseInt expects string but we're actually looking for numeric value or NaN
  const parsedArgumet = parseInt(value);

  return isFinite(parsedArgumet) ? parsedArgumet : undefined;
};
