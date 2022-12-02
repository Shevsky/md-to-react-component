const htmlEntitiesMap: Array<[string, string]> = [
  ['&nbsp;', '\xA0'],
  ['&quot;', '"'],
  ['&#39;', "'"]
];

export function decodeHtmlEntities(text: string): string {
  return htmlEntitiesMap.reduce(
    (currentText: string, [htmlEntity, decodedEntity]: [string, string]): string =>
      currentText.replaceAll(htmlEntity, decodedEntity),
    text
  );
}
