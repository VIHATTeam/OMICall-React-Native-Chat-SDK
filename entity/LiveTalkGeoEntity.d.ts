export interface LiveTalkGeoEntity {
    geopluginRequest?: string;
    geopluginStatus?: number;
    geopluginDelay?: string;
    geopluginCredit?: string;
    geopluginCity?: string;
    geopluginRegion?: string;
    geopluginRegionCode?: string;
    geopluginRegionName?: string;
    geopluginAreaCode?: string;
    geopluginDmaCode?: string;
    geopluginCountryCode?: string;
    geopluginCountryName?: string;
    geopluginInEU?: number;
    geopluginEuVATrate?: boolean;
    geopluginContinentCode?: string;
    geopluginContinentName?: string;
    geopluginLatitude?: string;
    geopluginLongitude?: string;
    geopluginLocationAccuracyRadius?: string;
    geopluginTimezone?: string;
    geopluginCurrencyCode?: string;
    geopluginCurrencySymbol?: string;
    geopluginCurrencySymbolUTF8?: string;
    geopluginCurrencyConverter?: string;
}
export declare function parseLiveTalkGeo(json: Record<string, unknown>): LiveTalkGeoEntity;
