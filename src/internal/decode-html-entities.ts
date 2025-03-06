const htmlEntitiesMap: Array<[string, string]> = [
  ['&nbsp;', '\xA0'],
  ['&quot;', '"'],
  ['&#39;', "'"]
];

export function decodeHtmlEntities(text: string): string {
  return htmlEntitiesMap
    .reduce(
      (currentText: string, [htmlEntity, decodedEntity]: [string, string]): string =>
        currentText.replaceAll(htmlEntity, decodedEntity),
      text
    )
    .replaceAll(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replaceAll(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
