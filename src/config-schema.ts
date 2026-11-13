import { Type, validators } from '@openmrs/esm-framework';
import type { NidanRenderType, QuestionType } from '@types';

const allowedQuestionTypes: Array<QuestionType> = [
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
];

const allowedFieldTypes: Array<NidanRenderType> = [
  'checkbox',
  'bed-select',
  'checkbox-searchable',
  'content-switcher',
  'date',
  'datetime',
  'bs-date',
  'bs-datetime',
  'bs-date-with-ad',
  'bs-datetime-with-ad',
  'drug',
  'encounter-location',
  'encounter-provider',
  'multi-provider-select',
  'appointment',
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

export const configSchema = {
  questionTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _description: 'Provides information that the processor uses to render a field',
    _default: allowedQuestionTypes,
    _validators: [validators.oneOf(allowedQuestionTypes)],
  },
  fieldTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _description:
      'An array of available field types. A question can have only one field type, and the field type determines how the question is rendered.',
    _default: allowedFieldTypes,
    _validators: [validators.oneOf(allowedFieldTypes)],
  },
  showSchemaSaveWarning: {
    _type: Type.Boolean,
    _description: 'Whether to show a warning about possibly losing data in the forms dashboard',
    _default: true,
  },
  dataTypeToRenderingMap: {
    Numeric: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['number', 'fixed-value'],
    },
    Coded: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: [
        'select',
        'checkbox',
        'checkbox-searchable',
        'radio',
        'content-switcher',
        'fixed-value',
        'markdown',
        'ui-select-extended',
        'drug',
        'problem',
        'encounter-provider',
        'appointment',
        'multi-provider-select',
        'encounter-location',
        'bed-select',
        'select-concept-answers',
        'encounter-role',
        'multiCheckbox',
      ],
    },
    Text: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['text', 'textarea', 'fixed-value'],
    },
    Date: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['date', 'bs-date', 'bs-date-with-ad', 'fixed-value'],
    },
    Datetime: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['datetime', 'bs-datetime', 'bs-datetime-with-ad', 'fixed-value'],
    },
    Boolean: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['toggle', 'select', 'radio', 'content-switcher', 'fixed-value'],
    },
    Rule: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['repeating', 'group'],
    },
    'N/A': {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: [],
    },
    Complex: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['file'],
    },
  },
  enableFormValidation: {
    _type: Type.Boolean,
    _description: 'Whether to enable form validation',
    _default: false,
  },
  blockRenderingWithErrors: {
    _type: Type.Boolean,
    _description: 'Whether to block form rendering when there are validation errors',
    _default: false,
  },
};

export interface ConfigObject {
  questionTypes: Array<QuestionType>;
  fieldTypes: Array<NidanRenderType>;
  showSchemaSaveWarning: boolean;
  dataTypeToRenderingMap: Record<string, Array<string>>;
  enableFormValidation: boolean;
  blockRenderingWithErrors: boolean;
}
