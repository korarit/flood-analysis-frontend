import { LocalizedString, SituationStatus } from './basin';

export type AlertType = 'rapid_rise' | 'heavy_rain' | 'bank_overflow' | 'warning_level' | 'data_gap';

export interface WaterAlertEvent {
  id: string;
  type: AlertType;
  stationId: string;
  stationCode: string;
  stationName: LocalizedString;
  basinId: string;
  basinName: LocalizedString;
  severity: SituationStatus;
  title: LocalizedString;
  description: LocalizedString;
  ruleTriggered: LocalizedString;
  value: string;
  threshold: string;
  timestamp: string;
  relativeTime: string;
  isRead?: boolean;
}

export interface SituationBulletin {
  id: string;
  basinId: string;
  basinName: LocalizedString;
  issuedDate: string;
  issuedTime: string;
  overallSituation: LocalizedString;
  overallSeverity: SituationStatus;
  keyHighlights: LocalizedString[];
  highRiskAreas: LocalizedString[];
  upstreamStatus: LocalizedString;
  midstreamStatus: LocalizedString;
  downstreamStatus: LocalizedString;
  forecastNext24h: LocalizedString;
  officerInCharge: LocalizedString;
}
