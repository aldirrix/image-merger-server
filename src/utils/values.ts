export const getNumericValue = (value: any): number | undefined => {
  const parsedArgumet = parseInt(value);

  return isFinite(parsedArgumet) ? parsedArgumet : undefined;
}
