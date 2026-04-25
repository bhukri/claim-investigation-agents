const CLAIM_TYPES = [
  { value: 'auto', label: 'Auto' },
  { value: 'property', label: 'Property' },
  { value: 'liability', label: 'Liability' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

const PROVINCES = [
  'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT',
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL',
  'IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT',
  'NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export const TEST_FNOL = {
  firstName: 'Sarah',
  lastName: 'Mitchell',
  dateOfBirth: '1988-07-22',
  address: '47 Birchwood Avenue',
  city: 'Toronto',
  province: 'ON',
  postalCode: 'M4K 1A3',
  phone: '416-555-0147',
  email: 'sarah.mitchell@gmail.com',
  policyNumber: 'AUT-2023-884521',
  claimType: 'auto',
  dateOfLoss: '2026-03-15',
  timeOfLoss: '08:15',
  locationOfLoss: 'Intersection of Yonge St and Eglinton Ave, Toronto, ON',
  injuriesReported: true,
  injuryDetails: 'Claimant reports neck and back pain, attended hospital same day by ambulance',
  thirdPartyInvolved: true,
  thirdPartyDetails: 'Other driver: Michael Torres, 416-555-0892, insured with Intact Insurance, plate CXJP 204',
  policeAttended: true,
  policeReportNumber: 'TPS-2026-03-78432',
  fireEmsAttended: true,
  vehicleYear: '2021',
  vehicleMake: 'Honda',
  vehicleModel: 'Civic',
  vehicleVIN: '2HGFC2F59MH123456',
  vehiclePlate: 'BXTP 447',
  incidentDescription: 'I was driving to work when a vehicle ran a red light and struck my car on the driver side. The impact was significant with substantial damage to the door and frame. The other driver admitted fault at the scene. My car is undrivable and I am currently renting a vehicle. The other driver\'s insurer has already contacted me but I want to process through my own policy first.',
};

function Field({ label, required, children }) {
  return (
    <div className="fnol-field">
      <label className="fnol-label">
        {label}
        {required && <span className="fnol-required">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder, disabled, ...rest }) {
  return (
    <input
      className="fnol-input"
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      {...rest}
    />
  );
}

function Select({ value, onChange, options, disabled }) {
  return (
    <select className="fnol-input fnol-select" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

function Toggle({ value, onChange, disabled }) {
  return (
    <div className="fnol-toggle-group">
      <button
        type="button"
        className={`fnol-toggle ${value === true ? 'active' : ''}`}
        onClick={() => onChange(true)}
        disabled={disabled}
      >
        Yes
      </button>
      <button
        type="button"
        className={`fnol-toggle ${value === false ? 'active' : ''}`}
        onClick={() => onChange(false)}
        disabled={disabled}
      >
        No
      </button>
    </div>
  );
}

function SectionHeader({ number, title }) {
  return (
    <div className="fnol-section-header">
      <span className="fnol-section-num">{number}</span>
      <span className="fnol-section-title">{title}</span>
      <div className="fnol-section-line" />
    </div>
  );
}

export default function FNOLForm({ data, onChange, disabled }) {
  const set = (field) => (value) => onChange({ ...data, [field]: value });

  return (
    <div className="fnol-form">
      {/* 1 — Claimant */}
      <SectionHeader number="01" title="Claimant Information" />
      <div className="fnol-grid-2">
        <Field label="First Name" required>
          <Input value={data.firstName} onChange={set('firstName')} placeholder="First name" disabled={disabled} />
        </Field>
        <Field label="Last Name" required>
          <Input value={data.lastName} onChange={set('lastName')} placeholder="Last name" disabled={disabled} />
        </Field>
        <Field label="Date of Birth" required>
          <Input value={data.dateOfBirth} onChange={set('dateOfBirth')} type="date" disabled={disabled} />
        </Field>
        <Field label="Phone" required>
          <Input value={data.phone} onChange={set('phone')} placeholder="e.g. 416-555-0100" disabled={disabled} />
        </Field>
        <Field label="Email">
          <Input value={data.email} onChange={set('email')} type="email" placeholder="claimant@email.com" disabled={disabled} />
        </Field>
        <Field label="Province / State" required>
          <Select value={data.province} onChange={set('province')} options={PROVINCES} disabled={disabled} />
        </Field>
        <Field label="Street Address" required>
          <Input value={data.address} onChange={set('address')} placeholder="Street address" disabled={disabled} />
        </Field>
        <Field label="City" required>
          <Input value={data.city} onChange={set('city')} placeholder="City" disabled={disabled} />
        </Field>
        <Field label="Postal / ZIP Code">
          <Input value={data.postalCode} onChange={set('postalCode')} placeholder="Postal or ZIP code" disabled={disabled} />
        </Field>
      </div>

      {/* 2 — Policy */}
      <SectionHeader number="02" title="Policy Information" />
      <div className="fnol-grid-2">
        <Field label="Policy Number" required>
          <Input value={data.policyNumber} onChange={set('policyNumber')} placeholder="e.g. AUT-2024-123456" disabled={disabled} />
        </Field>
        <Field label="Claim Type" required>
          <Select value={data.claimType} onChange={set('claimType')} options={CLAIM_TYPES} disabled={disabled} />
        </Field>
      </div>

      {/* 3 — Incident */}
      <SectionHeader number="03" title="Incident Details" />
      <div className="fnol-grid-2">
        <Field label="Date of Loss" required>
          <Input value={data.dateOfLoss} onChange={set('dateOfLoss')} type="date" disabled={disabled} />
        </Field>
        <Field label="Time of Loss">
          <Input value={data.timeOfLoss} onChange={set('timeOfLoss')} type="time" disabled={disabled} />
        </Field>
        <Field label="Location of Incident" required>
          <Input value={data.locationOfLoss} onChange={set('locationOfLoss')} placeholder="Address or intersection" disabled={disabled} />
        </Field>
      </div>

      {/* 4 — Vehicle (auto only) */}
      {data.claimType === 'auto' && (
        <>
          <SectionHeader number="04" title="Vehicle Details" />
          <div className="fnol-grid-2">
            <Field label="Year">
              <Input value={data.vehicleYear} onChange={set('vehicleYear')} placeholder="e.g. 2021" disabled={disabled} />
            </Field>
            <Field label="Make">
              <Input value={data.vehicleMake} onChange={set('vehicleMake')} placeholder="e.g. Honda" disabled={disabled} />
            </Field>
            <Field label="Model">
              <Input value={data.vehicleModel} onChange={set('vehicleModel')} placeholder="e.g. Civic" disabled={disabled} />
            </Field>
            <Field label="Plate Number">
              <Input value={data.vehiclePlate} onChange={set('vehiclePlate')} placeholder="e.g. BXTP 447" disabled={disabled} />
            </Field>
            <Field label="VIN">
              <Input value={data.vehicleVIN} onChange={set('vehicleVIN')} placeholder="17-character VIN" disabled={disabled} />
            </Field>
          </div>
        </>
      )}

      {/* 5 — Involved Parties */}
      <SectionHeader number={data.claimType === 'auto' ? '05' : '04'} title="Involved Parties" />
      <div className="fnol-grid-2">
        <Field label="Injuries Reported" required>
          <Toggle value={data.injuriesReported} onChange={set('injuriesReported')} disabled={disabled} />
        </Field>
        <Field label="Third Party Involved" required>
          <Toggle value={data.thirdPartyInvolved} onChange={set('thirdPartyInvolved')} disabled={disabled} />
        </Field>
        {data.injuriesReported && (
          <Field label="Injury Details">
            <Input value={data.injuryDetails} onChange={set('injuryDetails')} placeholder="Who was injured and how" disabled={disabled} />
          </Field>
        )}
        {data.thirdPartyInvolved && (
          <Field label="Third Party Details">
            <Input value={data.thirdPartyDetails} onChange={set('thirdPartyDetails')} placeholder="Name, contact, insurer" disabled={disabled} />
          </Field>
        )}
      </div>

      {/* 6 — Reports */}
      <SectionHeader number={data.claimType === 'auto' ? '06' : '05'} title="Attending Services" />
      <div className="fnol-grid-2">
        <Field label="Police Attended">
          <Toggle value={data.policeAttended} onChange={set('policeAttended')} disabled={disabled} />
        </Field>
        <Field label="Fire / EMS Attended">
          <Toggle value={data.fireEmsAttended} onChange={set('fireEmsAttended')} disabled={disabled} />
        </Field>
        {data.policeAttended && (
          <Field label="Police Report Number">
            <Input value={data.policeReportNumber} onChange={set('policeReportNumber')} placeholder="e.g. TPS-2026-03-78432" disabled={disabled} />
          </Field>
        )}
      </div>

      {/* 7 — Description */}
      <SectionHeader number={data.claimType === 'auto' ? '07' : '06'} title="Incident Description" />
      <Field label="Claimant's Account" required>
        <textarea
          className="fnol-input fnol-textarea"
          value={data.incidentDescription}
          onChange={e => set('incidentDescription')(e.target.value)}
          placeholder="Claimant's own words describing what happened..."
          disabled={disabled}
          rows={4}
        />
      </Field>
    </div>
  );
}
