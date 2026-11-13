import type { FormField, FormSchema } from '@openmrs/esm-form-engine-lib';

/**
 * `actionId` of the inbuilt post-submission action that creates an OpenMRS appointment
 * after the encounter is saved. Registered by `@openmrs/esm-form-engine-lib`.
 */
const APPOINTMENT_ACTION_ID = 'AppointmentSubmissionAction';

/**
 * Default `appointmentKind` written into the generated action config. Matches the
 * example shape documented for `AppointmentSubmissionConfig` and the action's own
 * fallback when the field is omitted.
 */
const DEFAULT_APPOINTMENT_KIND = 'Scheduled';

/** True when a question is configured to drive an appointment post-submission action. */
function isAppointmentQuestion(formField: FormField): boolean {
  return (
    formField.questionOptions?.rendering === 'appointment' &&
    !!formField.questionOptions?.appointmentConfig?.serviceUuid
  );
}

interface AppointmentActionSeed {
  id: string;
  serviceUuid: string;
  appointmentKind?: string;
}

/** Recursively collects appointment-action seeds for every appointment question in the tree. */
function collectAppointmentActions(formField: FormField): Array<AppointmentActionSeed> {
  const actions: Array<AppointmentActionSeed> = [];
  if (isAppointmentQuestion(formField)) {
    actions.push({
      id: formField.id,
      serviceUuid: formField.questionOptions.appointmentConfig.serviceUuid,
      appointmentKind: formField.questionOptions.appointmentConfig.appointmentKind,
    });
  }
  formField.questions?.forEach((subQuestion) => actions.push(...collectAppointmentActions(subQuestion)));
  return actions;
}

/** Recursively collects every question id in the tree (used to know which actions to rewrite). */
function collectQuestionIds(formField: FormField): string[] {
  const ids = formField.id ? [formField.id] : [];
  formField.questions?.forEach((subQuestion) => ids.push(...collectQuestionIds(subQuestion)));
  return ids;
}

/**
 * Keeps the schema's `postSubmissionActions` in sync with the appointment config stored on
 * `formField.questionOptions.appointmentConfig`.
 *
 * - When the question (or a nested sub-question) renders as `appointment` and has a service
 *   selected, an `AppointmentSubmissionAction` entry is injected (or updated) keyed by the
 *   question's `id` (`config.appointmentDateFieldId`).
 * - When the appointment rendering is removed or the service is cleared, the matching entry
 *   is removed.
 * - Pass `previousQuestionId` when a question's id may have changed (e.g. on edit) so a stale
 *   entry bound to the old id is cleaned up.
 *
 * This is safe to call on a freshly-built or top-level question; it walks nested obsGroup
 * sub-questions too.
 */
export function syncAppointmentPostSubmissionAction(
  schema: FormSchema,
  formField: FormField,
  previousQuestionId?: string,
): void {
  if (!schema.postSubmissionActions) {
    schema.postSubmissionActions = [];
  }

  // Every action entry we own is keyed by a question id in this question's tree, plus a
  // possibly-renamed previous id. Drop all of them and re-derive from the current state.
  const idsToClean = new Set<string>(collectQuestionIds(formField));
  if (previousQuestionId && previousQuestionId !== formField.id) {
    idsToClean.add(previousQuestionId);
  }

  schema.postSubmissionActions = schema.postSubmissionActions.filter(
    (action) =>
      !(action.actionId === APPOINTMENT_ACTION_ID && idsToClean.has(action.config?.appointmentDateFieldId)),
  );

  collectAppointmentActions(formField).forEach((seed) => {
    schema.postSubmissionActions.push({
      actionId: APPOINTMENT_ACTION_ID,
      config: {
        appointmentDateFieldId: seed.id,
        serviceUuid: seed.serviceUuid,
        appointmentKind: seed.appointmentKind ?? DEFAULT_APPOINTMENT_KIND,
      },
    });
  });

  // Avoid leaving a dangling empty array behind.
  if (schema.postSubmissionActions.length === 0) {
    delete schema.postSubmissionActions;
  }
}

/**
 * Removes any `AppointmentSubmissionAction` entries generated for the deleted question or any
 * of its nested sub-questions.
 */
export function removeAppointmentPostSubmissionAction(schema: FormSchema, question: FormField): void {
  if (!schema.postSubmissionActions) return;
  const idsToRemove = new Set<string>(collectQuestionIds(question));
  if (idsToRemove.size === 0) return;

  schema.postSubmissionActions = schema.postSubmissionActions.filter(
    (action) =>
      !(action.actionId === APPOINTMENT_ACTION_ID && idsToRemove.has(action.config?.appointmentDateFieldId)),
  );

  if (schema.postSubmissionActions.length === 0) {
    delete schema.postSubmissionActions;
  }
}

/**
 * Pre-populates `questionOptions.appointmentConfig` from an existing `AppointmentSubmissionAction`
 * entry so the service picker is pre-selected when re-opening a question that was authored
 * (or hand-edited) without a builder-side `appointmentConfig`.
 *
 * Returns a shallow-copied formField; never mutates the schema's question in place.
 */
export function hydrateAppointmentConfigFromSchema(formField: FormField, schema: FormSchema): FormField {
  if (formField.questionOptions?.rendering !== 'appointment') return formField;
  if (formField.questionOptions?.appointmentConfig?.serviceUuid) return formField;

  const existing = schema?.postSubmissionActions?.find(
    (action) =>
      action.actionId === APPOINTMENT_ACTION_ID && action.config?.appointmentDateFieldId === formField.id,
  );

  if (existing?.config?.serviceUuid) {
    return {
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        appointmentConfig: {
          serviceUuid: existing.config.serviceUuid,
          ...(existing.config.appointmentKind ? { appointmentKind: existing.config.appointmentKind } : {}),
        },
      },
    };
  }

  return formField;
}
