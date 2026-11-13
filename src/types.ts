import type { OpenmrsResource } from '@openmrs/esm-framework';
import type { FormSchema, ProgramState, RenderType } from '@openmrs/esm-form-engine-lib';
import type { AuditInfo } from './components/audit-details/audit-details.component';
import type { questionTypes } from '@constants';

/**
 * Bikram Sambat (Nepali) date render types. These are custom form-engine controls
 * registered at runtime by `nidan-esm-nepali-calendar`, so they are not part of the
 * upstream `RenderType` union — we widen it locally for the builder's pickers and config.
 */
export type BsRenderType = 'bs-date' | 'bs-datetime' | 'bs-date-with-ad' | 'bs-datetime-with-ad';

/** `RenderType` widened with the nidan custom controls the builder must be able to author. */
export type NidanRenderType = RenderType | BsRenderType;

// Extend FormSchema to include description property
export interface FormBuilderSchema extends FormSchema {
  description?: string;
  /** Optional visibility/context rules stored via nidancore REST (`formRules`), not used by the form engine. */
  formRules?: Record<string, unknown> | unknown[];
}

export interface Form {
  uuid: string;
  name: string;
  encounterType: EncounterType;
  version: string;
  resources: Array<Resource>;
  description: string;
  published?: boolean;
  retired?: boolean;
  formFields?: Array<string>;
  display?: string;
  auditInfo: AuditInfo;
  /** nidancore extension — parsed JSON when present on full representation */
  formRules?: Record<string, unknown> | unknown[];
}

export interface FilterProps {
  rowIds: Array<string>;
  headers: Array<Record<string, string>>;
  cellsById: Record<string, Record<string, boolean | string | null | Record<string, unknown>>>;
  inputValue: string;
  getCellId: (row, key) => string;
}

export interface EncounterType {
  uuid: string;
  name: string;
  display: string;
}

export interface Resource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

export type QuestionType = (typeof questionTypes)[number];

export type DatePickerType = 'both' | 'calendar' | 'timer';

// Using extended FormBuilderSchema instead of FormSchema
export type Schema = FormBuilderSchema;

export interface SchemaContextType {
  schema: Schema;
  setSchema: (schema: Schema) => void;
}

export interface Answer {
  concept: string;
  label: string;
}

export type ConceptMapping = Record<string, string>;

export interface Concept {
  uuid: string;
  display: string;
  mappings: Array<Mapping>;
  datatype: OpenmrsResource;
  conceptClass?: { display?: string };
  answers?: Array<ConceptAnswer>;
  allowDecimal?: boolean;
  /**
   * Complex-obs handler string (e.g. `NidanBedHandler`, `NidanProviderHandler`) exposed by the
   * REST concept representation for ConceptComplex. Used to restrict the backing-concept search
   * for handler-specific rendering types (bed-select, multi-provider-select).
   */
  handler?: string;
}

export interface ConceptAnswer {
  uuid: string;
  display: string;
}

export interface Mapping {
  display: string;
  conceptMapType: {
    display: string;
  };
}

export interface PatientIdentifierType {
  display: string;
  name: string;
  description: string;
  uuid: string;
}

export interface PersonAttributeType {
  display: string;
  format: string;
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    answers: Array<ConceptAnswer>;
  };
}

export interface Program {
  uuid: string;
  name: string;
  allWorkflows: Array<ProgramWorkflow>;
}

export interface ProgramWorkflow {
  uuid: string;
  states: Array<ProgramState>;
  concept: {
    display: string;
    uuid: string;
  };
}

export interface DatePickerTypeOption {
  value: DatePickerType;
  label: string;
  defaultChecked: boolean;
}

/**
 * Builder-side augmentation: the form engine does not model appointment authoring config on the
 * question itself (it only consumes the generated `AppointmentSubmissionAction`), so we extend
 * `FormQuestionOptions` locally to carry the selected service UUID while a question is being
 * authored. On save this is synced into the schema's `postSubmissionActions` by
 * `syncAppointmentPostSubmissionAction` (see `src/utils/appointment-actions.utils.ts`).
 */
declare module '@openmrs/esm-form-engine-lib' {
  interface FormQuestionOptions {
    appointmentConfig?: {
      serviceUuid: string;
      appointmentKind?: string;
    };
  }
}
