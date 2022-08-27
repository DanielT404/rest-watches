/**
 * Strip string for any unwanted characters that are not specified in the whitelisted character list.
 *
 * The order of whitelisted characters in the list matters, as they will be appended to form a RegExp.
 *
 * Whitelisted characters must be specified either as RegExp character ranges or individual characters.
 *
 * e.g. character ranges: 'a-z', 'A-Z', '0-9'
 *
 * e.g. individual characters: '(', ')', '}', '-'
 * @param value
 * @param whitelistedChars
 * @returns string
 */
export function stripUnwantedCharacters(
  value: string,
  whitelistedCharList: string[]
) {
  let expression = '[^';
  for (const entry of whitelistedCharList) {
    expression += entry;
  }
  expression += ']';
  const searchByRegex = new RegExp(expression, 'g');
  const result = value.replace(searchByRegex, '');
  return result;
}
