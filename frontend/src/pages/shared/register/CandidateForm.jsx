/**
 * CandidateForm.jsx - Candidate registration form fields
 */
import { FormGroup } from '../../../components/FormGroup';

export function CandidateForm({ fullName, phoneNumber, address, avatarUrl, onChange }) {
  return (
    <>
      <FormGroup
        label="Full Name"
        name="fullName"
        type="text"
        placeholder="John Doe"
        value={fullName}
        onChange={(e) => onChange('fullName', e.target.value)}
        optional
      />

      <FormGroup
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        placeholder="+1 (555) 000-0000"
        value={phoneNumber}
        onChange={(e) => onChange('phoneNumber', e.target.value)}
        optional
      />

      <FormGroup
        label="Address"
        name="address"
        type="text"
        placeholder="Your city or street"
        value={address}
        onChange={(e) => onChange('address', e.target.value)}
        optional
      />

      <FormGroup
        label="Avatar URL"
        name="avatarUrl"
        type="text"
        placeholder="https://..."
        value={avatarUrl}
        onChange={(e) => onChange('avatarUrl', e.target.value)}
        optional
        fullWidth
      />
    </>
  );
}

export default CandidateForm;
