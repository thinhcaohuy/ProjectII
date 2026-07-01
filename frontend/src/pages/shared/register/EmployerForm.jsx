/**
 * EmployerForm.jsx - Employer registration form fields
 */
import { FormGroup } from '../../../components/FormGroup';

export function EmployerForm({ companyName, address, avatarUrl, companySize, website, description, onChange }) {
  return (
    <>
      <FormGroup
        label="Company Name"
        name="companyName"
        type="text"
        placeholder="ABC Tech"
        value={companyName}
        onChange={(e) => onChange('companyName', e.target.value)}
        optional
      />

      <FormGroup
        label="Address"
        name="address"
        type="text"
        placeholder="123 Main St, City"
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
      />

      <FormGroup
        label="Company Size"
        name="companySize"
        type="number"
        placeholder="50"
        value={companySize}
        onChange={(e) => onChange('companySize', e.target.value)}
        optional
      />

      <FormGroup
        label="Website"
        name="website"
        type="url"
        placeholder="https://abc-tech.com"
        value={website}
        onChange={(e) => onChange('website', e.target.value)}
        optional
      />

      <FormGroup
        label="Company Description"
        name="description"
        type="textarea"
        placeholder="Tell us about your company"
        value={description}
        onChange={(e) => onChange('description', e.target.value)}
        optional
        fullWidth
      />
    </>
  );
}

export default EmployerForm;
