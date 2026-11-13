import type { RenderType } from '@openmrs/esm-form-engine-lib';
import type { NidanRenderType } from '@types';

export const questionTypes = [
  'control',
  'encounterDatetime',
  'encounterLocation',
  'encounterProvider',
  'encounterRole',
  'obs',
  'obsGroup',
  'patientIdentifier',
  'personAttribute',
  'testOrder',
  'programState',
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const renderingTypes: Array<RenderType> = [
  'checkbox',
  'checkbox-searchable',
  'content-switcher',
  'date',
  'datetime',
  'drug',
  'encounter-location',
  'encounter-provider',
  'encounter-role',
  'fixed-value',
  'file',
  'group',
  'number',
  'problem',
  'radio',
  'repeating',
  'select',
  'text',
  'textarea',
  'toggle',
  'ui-select-extended',
  'workspace-launcher',
  'markdown',
  'extension-widget',
  'select-concept-answers',
];

// Render types that are ONLY valid for obs questions — must not appear under
// encounter or any other question type's rendering picker.
export const obsOnlyRenderingTypes: Array<RenderType> = ['bed-select', 'multi-provider-select', 'appointment'];

// Bikram Sambat (Nepali) date render types registered by nidan-esm-nepali-calendar.
// Only date/datetime variants exist — there is no BS "time" type.
export const bsRenderingTypes: Array<NidanRenderType> = [
  'bs-date',
  'bs-datetime',
  'bs-date-with-ad',
  'bs-datetime-with-ad',
];

export const renderTypeOptions: Record<QuestionType, Array<NidanRenderType>> = {
  control: ['text', 'markdown'],
  encounterDatetime: ['date', 'datetime', ...bsRenderingTypes],
  encounterLocation: ['ui-select-extended'],
  encounterProvider: ['ui-select-extended'],
  encounterRole: ['ui-select-extended'],
  obs: [...renderingTypes, ...obsOnlyRenderingTypes, ...bsRenderingTypes],
  obsGroup: ['group', 'repeating'],
  personAttribute: ['text', 'select', 'date', 'radio', 'checkbox', 'textarea', 'toggle', 'ui-select-extended'],
  testOrder: ['group', 'repeating'],
  patientIdentifier: ['text'],
  programState: ['select'],
};
