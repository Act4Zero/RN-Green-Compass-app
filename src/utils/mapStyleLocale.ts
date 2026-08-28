import type { AppLocale } from '../context/AppLocaleContext';

export type MapStyleDocument = {
  layers?: Array<{
    id?: string;
    type?: string;
    layout?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

export function getLocalizedMapNameExpression(locale: AppLocale): unknown[] {
  return locale === 'bg'
    ? ['coalesce', ['get', 'name:bg'], ['get', 'name'], ['get', 'name:nonlatin'], ['get', 'name:latin'], ['get', 'name_en']]
    : ['coalesce', ['get', 'name_en'], ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];
}

export function isMapNameTextField(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  return JSON.stringify(value).includes('name');
}

export function localizeMapStyle(style: MapStyleDocument, locale: AppLocale): MapStyleDocument {
  const expression = getLocalizedMapNameExpression(locale);
  return {
    ...style,
    layers: style.layers?.map((layer) => {
      const textField = layer.layout?.['text-field'] ?? layer.layout?.textField;
      if (layer.type !== 'symbol' || !isMapNameTextField(textField)) return layer;
      return {
        ...layer,
        layout: {
          ...layer.layout,
          'text-field': expression,
        },
      };
    }),
  };
}
