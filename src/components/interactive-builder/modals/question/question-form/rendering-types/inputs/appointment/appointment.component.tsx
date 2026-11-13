import React, { useCallback } from 'react';
import { InlineLoading, InlineNotification, Select, SelectItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import useSWRImmutable from 'swr/immutable';
import { getAppointmentServices, type AppointmentService } from '@openmrs/esm-form-engine-lib';
import { useFormField } from '../../../../form-field-context';

/**
 * Additional configuration shown when a question's rendering is `appointment`.
 * Renders a dropdown of OpenMRS appointment services fetched via
 * `getAppointmentServices()`; the selected service UUID is stored on the question as
 * `questionOptions.appointmentConfig.serviceUuid` and synced to a
 * `AppointmentSubmissionAction` post-submission action when the question is saved.
 */
const Appointment: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  const { data: services, error, isLoading } = useSWRImmutable<AppointmentService[]>(
    'appointment-services',
    getAppointmentServices,
  );

  const selectedServiceUuid = formField.questionOptions?.appointmentConfig?.serviceUuid ?? '';

  const handleServiceChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const serviceUuid = event.target.value;
      setFormField((prevField) => ({
        ...prevField,
        questionOptions: {
          ...prevField.questionOptions,
          // Clearing the dropdown drops the config entirely so no stale action is generated.
          appointmentConfig: serviceUuid ? { serviceUuid } : undefined,
        },
      }));
    },
    [setFormField],
  );

  if (isLoading) {
    return <InlineLoading description={t('loadingAppointmentServices', 'Loading appointment services') + '...'} />;
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        lowContrast
        hideCloseButton
        title={t('appointmentServicesLoadError', 'Could not load appointment services')}
        subtitle={t(
          'appointmentServicesLoadErrorDetail',
          'Ensure the OpenMRS appointment module is installed and that appointment services are configured.',
        )}
      />
    );
  }

  const availableServices = services ?? [];

  return (
    <Select
      id="appointmentService"
      value={selectedServiceUuid}
      onChange={handleServiceChange}
      labelText={t('appointmentService', 'Appointment service')}
      helperText={t(
        'appointmentServiceHelper',
        'Select the appointment service to schedule when this form is submitted.',
      )}
      disabled={availableServices.length === 0}
    >
      <SelectItem text={t('chooseAppointmentService', 'Choose an appointment service')} value="" />
      {availableServices.map((service) => (
        <SelectItem key={service.uuid} text={service.name} value={service.uuid} />
      ))}
    </Select>
  );
};

export default Appointment;
