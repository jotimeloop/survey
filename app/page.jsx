'use client';

import { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  'Married',
  'Unmarried',
  'Divorced',
  'Priesthood',
  'Consecrated Life'
];

const QUALIFICATION_OPTIONS = [
  'Student',
  'Below SSLC',
  'SSLC',
  'Pre Degree / + 2',
  'Graduate',
  'Post Graduate',
  'PhD'
];

const OCCUPATION_OPTIONS = [
  'Unemployed',
  'Employed',
  'Housewife',
  'Business',
  'Farmer',
  'Self Employed'
];

const COUNTRY_OPTIONS = [
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Other'
];

const STATE_OPTIONS = [
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Other'
];

const HEALTH_OPTIONS = ['Sick', 'Bedridden', 'Healthy', 'Other'];

const YES_NO_OPTIONS = ['Yes', 'No'];

const CHURCH_ACTIVITY_OPTIONS = [
  'Mission League',
  'Vincent de Paul',
  'KCYM',
  'Nothing as Regular',
  'Catholic Congress',
  'DFC',
  'KLM',
  'Prayer Group',
  'Parish Counsellor',
  'Pithruvedhi',
  'Mathruvedhi',
  'Altar Boys',
  'Catechists',
  'Jesus Youth'
];

const RELATION_OPTIONS = [
  'Brother',
  'Daughter',
  'Daughter in Law',
  'Father',
  'Sister',
  'Grand Father',
  'Grand Mother',
  'Grand Son',
  'Grand Daughter',
  'Husband',
  'Mother',
  'Wife',
  'Son',
  'Son in Law',
  'Father-in-law',
  'Mother-in-law',
  'Brother-in-law',
  'Sister-in-law'
];

const FALLBACK_WARDS = [
  '1.St. Mother Teresa',
  '2.St. Little Flower',
  '3.St. Francis Assisi',
  '4.St. Alphonsa',
  '5.St. Jude',
  '6.St. George',
  '7.St. Pius',
  '8.St. Paul',
  '9.St. Mary',
  '10.St. Joseph',
  '11.St. Augustine'
];

export default function SurveyApp() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [settings, setSettings] = useState({
    parishName: 'Chalassery, St.Pius X Church',
    wards: FALLBACK_WARDS,
    maxMembers: 20
  });

  // Step 1 Form Data
  const [familyData, setFamilyData] = useState({
    parishName: 'Chalassery, St.Pius X Church',
    parishWard: '',
    houseName: '',
    headName: '',
    mobile: '',
    email: '',
    address: '',
    pinCode: '',
    residenceYears: '',
    economicStatus: '',
    publications: ''
  });

  // Step 2 (Head of Family Member) Data
  const [headMember, setHeadMember] = useState({
    fullName: '',
    dateOfBirth: '',
    relation: 'SELF',
    currentStatus: '',
    date: '',
    qualification: '',
    occupation: '',
    country: 'India',
    state: 'Kerala',
    city: '',
    healthCondition: '',
    practicingCatholic: '',
    churchActivities: ''
  });

  // Flag to check if head member full name was manually altered
  const [isHeadNameAuto, setIsHeadNameAuto] = useState(true);

  // Step 3 Additional Members List
  const [additionalMembers, setAdditionalMembers] = useState([]);

  // Load Settings from API on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.parishName) {
          setFamilyData(prev => ({ ...prev, parishName: data.parishName }));
        }
      }
    } catch (err) {
      console.error('Could not load settings from server, using fallback wards:', err);
    }
  };

  // Sync head name from Step 1 to Step 2
  const handleHeadNameChange = (val) => {
    setFamilyData(prev => ({ ...prev, headName: val }));
    if (isHeadNameAuto) {
      setHeadMember(prev => ({ ...prev, fullName: val }));
    }
  };

  const handleHeadFullNameChange = (val) => {
    setIsHeadNameAuto(false);
    setHeadMember(prev => ({ ...prev, fullName: val }));
  };

  // Step 3: Add new member
  const handleAddMember = () => {
    const totalCount = 1 + additionalMembers.length; // 1 head + additionals
    if (totalCount >= settings.maxMembers) {
      alert(`Maximum ${settings.maxMembers} family members are allowed.`);
      return;
    }

    setAdditionalMembers(prev => [
      ...prev,
      {
        fullName: '',
        dateOfBirth: '',
        relation: '',
        currentStatus: '',
        date: '',
        qualification: '',
        occupation: '',
        country: 'India',
        state: 'Kerala',
        city: '',
        healthCondition: '',
        practicingCatholic: '',
        churchActivities: ''
      }
    ]);
  };

  const handleRemoveMember = (index) => {
    if (!confirm('Remove this family member?')) return;
    setAdditionalMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index, field, val) => {
    setAdditionalMembers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  // Page Validations
  const validatePage = (pageNo) => {
    if (pageNo === 1) {
      const { parishName, parishWard, houseName, headName, mobile, address, pinCode, residenceYears, economicStatus } = familyData;
      if (!parishName || !parishWard || !houseName || !headName || !mobile || !address || !pinCode || !residenceYears || !economicStatus) {
        alert('Please fill out all required fields marked with * in Step 1.');
        return false;
      }
      if (!/^[0-9]{10}$/.test(mobile.trim())) {
        alert('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!/^[0-9]{6}$/.test(pinCode.trim())) {
        alert('Please enter a valid 6-digit PIN Code.');
        return false;
      }
    }

    if (pageNo === 2) {
      const requiredHeadFields = [
        ['fullName', 'Full Name'],
        ['dateOfBirth', 'Date of Birth'],
        ['currentStatus', 'Current Status'],
        ['qualification', 'Qualification'],
        ['occupation', 'Occupation'],
        ['country', 'Country'],
        ['state', 'State'],
        ['city', 'City'],
        ['healthCondition', 'Health Condition'],
        ['practicingCatholic', 'Practicing Catholic'],
        ['churchActivities', 'Church Activities']
      ];
      for (const [key, label] of requiredHeadFields) {
        if (!headMember[key] || String(headMember[key]).trim() === '') {
          alert(`Family Head: ${label} is required.`);
          return false;
        }
      }
    }

    if (pageNo === 3) {
      for (let i = 0; i < additionalMembers.length; i++) {
        const member = additionalMembers[i];
        const number = i + 2; // Member 1 is head
        const requiredFields = [
          ['fullName', 'Full Name'],
          ['dateOfBirth', 'Date of Birth'],
          ['currentStatus', 'Current Status'],
          ['qualification', 'Qualification'],
          ['occupation', 'Occupation'],
          ['country', 'Country'],
          ['state', 'State'],
          ['city', 'City'],
          ['healthCondition', 'Health Condition'],
          ['practicingCatholic', 'Practicing Catholic'],
          ['churchActivities', 'Church Activities'],
          ['relation', 'Relation with Head']
        ];
        for (const [key, label] of requiredFields) {
          if (!member[key] || String(member[key]).trim() === '') {
            alert(`${label} is required for Member ${number}.`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleNextPage = (targetPage) => {
    if (targetPage > currentPage) {
      if (!validatePage(currentPage)) return;
    }

    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Application
  const handleSubmit = async () => {
    if (!validatePage(1) || !validatePage(2) || !validatePage(3)) {
      return;
    }

    setIsVerified(true);

    if (!confirm('Please confirm that all the information is correct.\n\nClick OK to submit this family.')) {
      return;
    }

    const payload = {
      ...familyData,
      members: [
        { ...headMember, isHead: true, relation: 'SELF' },
        ...additionalMembers.map(m => ({ ...m, isHead: false }))
      ]
    };

    setLoading(true);

    try {
      const res = await fetch('/api/save-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      setLoading(false);

      if (res.ok && result.success) {
        setSuccessData(result);
      } else {
        alert(`Unable to save information:\n${result.error || 'Server error'}`);
      }
    } catch (err) {
      setLoading(false);
      alert(`Unable to save information:\n${err.message}`);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setIsVerified(false);
    setCurrentPage(1);
    setFamilyData({
      parishName: settings.parishName || 'Chalassery, St.Pius X Church',
      parishWard: '',
      houseName: '',
      headName: '',
      mobile: '',
      email: '',
      address: '',
      pinCode: '',
      residenceYears: '',
      economicStatus: '',
      publications: ''
    });
    setHeadMember({
      fullName: '',
      dateOfBirth: '',
      relation: 'SELF',
      currentStatus: '',
      date: '',
      qualification: '',
      occupation: '',
      country: 'India',
      state: 'Kerala',
      city: '',
      healthCondition: '',
      practicingCatholic: '',
      churchActivities: ''
    });
    setIsHeadNameAuto(true);
    setAdditionalMembers([]);
  };

  const allMembers = [
    { ...headMember, isHead: true, relation: 'SELF' },
    ...additionalMembers.map(m => ({ ...m, isHead: false }))
  ];

  return (
    <div className="app">
      {/* HEADER */}
      <header className="top-header">
        <div>
          <div className="small-title">{familyData.parishName || 'Parish Information'}</div>
          <h1>Family Information Survey</h1>
        </div>
        <div className="progress-area">
          <div id="progressText">Page {currentPage} of 4</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${currentPage * 25}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* CONTAINER */}
      <div className="container">

        {/* STEP 1 */}
        <div className={`page ${currentPage === 1 ? 'active' : ''}`}>
          <div className="page-heading">
            <div className="page-category">STEP 1 OF 4</div>
            <h2>Basic Family Information</h2>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Name of Parish <span>*</span></label>
              <input
                type="text"
                value={familyData.parishName}
                onChange={e => setFamilyData({ ...familyData, parishName: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Parish Ward <span>*</span></label>
              <select
                value={familyData.parishWard}
                onChange={e => setFamilyData({ ...familyData, parishWard: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {(settings.wards || FALLBACK_WARDS).map((ward, idx) => (
                  <option key={idx} value={ward}>{ward}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>House Name <span>*</span></label>
              <input
                type="text"
                value={familyData.houseName}
                onChange={e => setFamilyData({ ...familyData, houseName: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Head of Family <span>*</span></label>
              <input
                type="text"
                value={familyData.headName}
                onChange={e => handleHeadNameChange(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Mobile Number <span>*</span> <small>(10 digits)</small></label>
              <input
                type="text"
                value={familyData.mobile}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                  setFamilyData({ ...familyData, mobile: val });
                }}
                maxLength={10}
                required
              />
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                value={familyData.email}
                onChange={e => setFamilyData({ ...familyData, email: e.target.value })}
              />
            </div>

            <div className="field field-wide">
              <label>Permanent Address <span>*</span></label>
              <textarea
                value={familyData.address}
                onChange={e => setFamilyData({ ...familyData, address: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>PIN Code <span>*</span> <small>(6 digits)</small></label>
              <input
                type="text"
                value={familyData.pinCode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setFamilyData({ ...familyData, pinCode: val });
                }}
                maxLength={6}
                required
              />
            </div>

            <div className="field">
              <label>Duration of Residence (Years) <span>*</span></label>
              <input
                type="number"
                min="0"
                value={familyData.residenceYears}
                onChange={e => setFamilyData({ ...familyData, residenceYears: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Economic Status <span>*</span></label>
              <select
                value={familyData.economicStatus}
                onChange={e => setFamilyData({ ...familyData, economicStatus: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                <option value="APL">APL</option>
                <option value="BPL">BPL</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="field field-wide">
              <label>Publications / Newspapers Subscribed</label>
              <textarea
                value={familyData.publications}
                onChange={e => setFamilyData({ ...familyData, publications: e.target.value })}
                placeholder="e.g. Deepika, Malayala Manorama"
              />
            </div>
          </div>

          <div className="navigation right">
            <button
              type="button"
              className="btn primary"
              onClick={() => handleNextPage(2)}
            >
              Next: Head Details &rarr;
            </button>
          </div>
        </div>

        {/* STEP 2 */}
        <div className={`page ${currentPage === 2 ? 'active' : ''}`}>
          <div className="page-heading">
            <div className="page-category">STEP 2 OF 4</div>
            <h2>Family Head Details</h2>
          </div>

          <div className="info-message">
            The Head of Family is Member #1 of this family survey.
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Full Name <span>*</span></label>
              <input
                type="text"
                value={headMember.fullName}
                onChange={e => handleHeadFullNameChange(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Date of Birth <span>*</span></label>
              <input
                type="date"
                value={headMember.dateOfBirth}
                onChange={e => setHeadMember({ ...headMember, dateOfBirth: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Current Status <span>*</span></label>
              <select
                value={headMember.currentStatus}
                onChange={e => setHeadMember({ ...headMember, currentStatus: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={headMember.date}
                onChange={e => setHeadMember({ ...headMember, date: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Qualification <span>*</span></label>
              <select
                value={headMember.qualification}
                onChange={e => setHeadMember({ ...headMember, qualification: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {QUALIFICATION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Occupation <span>*</span></label>
              <select
                value={headMember.occupation}
                onChange={e => setHeadMember({ ...headMember, occupation: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {OCCUPATION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Country <span>*</span></label>
              <select
                value={headMember.country}
                onChange={e => setHeadMember({ ...headMember, country: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {COUNTRY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>State <span>*</span></label>
              <select
                value={headMember.state}
                onChange={e => setHeadMember({ ...headMember, state: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {STATE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>City <span>*</span></label>
              <input
                type="text"
                value={headMember.city}
                onChange={e => setHeadMember({ ...headMember, city: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Health Condition <span>*</span></label>
              <select
                value={headMember.healthCondition}
                onChange={e => setHeadMember({ ...headMember, healthCondition: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {HEALTH_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Practicing Catholic? <span>*</span></label>
              <select
                value={headMember.practicingCatholic}
                onChange={e => setHeadMember({ ...headMember, practicingCatholic: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {YES_NO_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Church Activities <span>*</span></label>
              <select
                value={headMember.churchActivities}
                onChange={e => setHeadMember({ ...headMember, churchActivities: e.target.value })}
                required
              >
                <option value="">--- Select ---</option>
                {CHURCH_ACTIVITY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="navigation">
            <button
              type="button"
              className="btn secondary"
              onClick={() => handleNextPage(1)}
            >
              &larr; Back to Step 1
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => handleNextPage(3)}
            >
              Next: Additional Members &rarr;
            </button>
          </div>
        </div>

        {/* STEP 3 */}
        <div className={`page ${currentPage === 3 ? 'active' : ''}`}>
          <div className="page-heading">
            <div className="page-category">STEP 3 OF 4</div>
            <h2>Additional Family Members</h2>
          </div>

          {/* HEAD CARD */}
          <div className="member-card self">
            <h3>Family Member 1 <span className="self-label">SELF</span></h3>
            <div className="form-grid">
              <div className="field">
                <label>Full Name</label>
                <input type="text" value={headMember.fullName} readOnly />
              </div>
              <div className="field">
                <label>Relation with Head</label>
                <input type="text" value="SELF" readOnly />
              </div>
            </div>
          </div>

          {/* ADDITIONAL MEMBER CARDS */}
          {additionalMembers.map((member, idx) => (
            <div className="member-card" key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Family Member {idx + 2}</h3>
                <button
                  type="button"
                  className="action-button delete-button"
                  onClick={() => handleRemoveMember(idx)}
                  title="Remove Member"
                >
                  🗑
                </button>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Full Name <span>*</span></label>
                  <input
                    type="text"
                    value={member.fullName}
                    onChange={e => handleMemberChange(idx, 'fullName', e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Date of Birth <span>*</span></label>
                  <input
                    type="date"
                    value={member.dateOfBirth}
                    onChange={e => handleMemberChange(idx, 'dateOfBirth', e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Relation with Head <span>*</span></label>
                  <select
                    value={member.relation}
                    onChange={e => handleMemberChange(idx, 'relation', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {RELATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Current Status <span>*</span></label>
                  <select
                    value={member.currentStatus}
                    onChange={e => handleMemberChange(idx, 'currentStatus', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={member.date}
                    onChange={e => handleMemberChange(idx, 'date', e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Qualification <span>*</span></label>
                  <select
                    value={member.qualification}
                    onChange={e => handleMemberChange(idx, 'qualification', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {QUALIFICATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Occupation <span>*</span></label>
                  <select
                    value={member.occupation}
                    onChange={e => handleMemberChange(idx, 'occupation', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {OCCUPATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Country <span>*</span></label>
                  <select
                    value={member.country}
                    onChange={e => handleMemberChange(idx, 'country', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {COUNTRY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>State <span>*</span></label>
                  <select
                    value={member.state}
                    onChange={e => handleMemberChange(idx, 'state', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {STATE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>City <span>*</span></label>
                  <input
                    type="text"
                    value={member.city}
                    onChange={e => handleMemberChange(idx, 'city', e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Health Condition <span>*</span></label>
                  <select
                    value={member.healthCondition}
                    onChange={e => handleMemberChange(idx, 'healthCondition', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {HEALTH_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Practicing Catholic? <span>*</span></label>
                  <select
                    value={member.practicingCatholic}
                    onChange={e => handleMemberChange(idx, 'practicingCatholic', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {YES_NO_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Church Activities <span>*</span></label>
                  <select
                    value={member.churchActivities}
                    onChange={e => handleMemberChange(idx, 'churchActivities', e.target.value)}
                    required
                  >
                    <option value="">--- Select ---</option>
                    {CHURCH_ACTIVITY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* ADD MEMBER BUTTON & SUMMARY TABLE */}
          <div className="add-member-row">
            <button
              type="button"
              className="btn add secondary"
              onClick={handleAddMember}
              disabled={allMembers.length >= settings.maxMembers}
            >
              + Add Family Member
            </button>
            <div id="memberCount">
              {allMembers.length} / {settings.maxMembers} members
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Summary Member List</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Date of Birth</th>
                    <th>Relation</th>
                    <th>Occupation</th>
                    <th>Location</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allMembers.map((m, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{m.fullName || '—'}</td>
                      <td>{m.dateOfBirth || '—'}</td>
                      <td>{m.relation || '—'}</td>
                      <td>{m.occupation || '—'}</td>
                      <td>{[m.city, m.state].filter(Boolean).join(', ') || '—'}</td>
                      <td>
                        {m.isHead ? (
                          <span>—</span>
                        ) : (
                          <button
                            type="button"
                            className="action-button delete-button"
                            onClick={() => handleRemoveMember(idx - 1)}
                          >
                            🗑
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="navigation">
            <button
              type="button"
              className="btn secondary"
              onClick={() => handleNextPage(2)}
            >
              &larr; Back to Step 2
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => handleNextPage(4)}
            >
              Next: Review &amp; Verify &rarr;
            </button>
          </div>
        </div>

        {/* STEP 4 */}
        <div className={`page ${currentPage === 4 ? 'active' : ''}`}>
          <div className="preview-heading">
            <div className="page-heading" style={{ marginBottom: 0 }}>
              <div className="page-category">STEP 4 OF 4</div>
              <h2>Review &amp; Verify Information</h2>
            </div>
            <div className={`badge ${isVerified ? 'verified' : ''}`}>
              {isVerified ? 'Verified' : 'Unverified'}
            </div>
          </div>

          <div className="preview-title">Family Summary</div>
          <div className="preview-grid">
            <div className="preview-item">
              <label>House Name &amp; Parish</label>
              <div>{familyData.houseName || '—'} ({familyData.parishName})</div>
            </div>
            <div className="preview-item">
              <label>Parish Ward</label>
              <div>{familyData.parishWard || '—'}</div>
            </div>
            <div className="preview-item">
              <label>Mobile Number</label>
              <div>{familyData.mobile || '—'}</div>
            </div>
            <div className="preview-item">
              <label>Email Address</label>
              <div>{familyData.email || '—'}</div>
            </div>
            <div className="preview-item">
              <label>Permanent Address</label>
              <div>{familyData.address || '—'} - {familyData.pinCode || ''}</div>
            </div>
            <div className="preview-item">
              <label>Economic Status</label>
              <div>{familyData.economicStatus || '—'}</div>
            </div>
            <div className="preview-item">
              <label>Duration of Residence</label>
              <div>{familyData.residenceYears ? `${familyData.residenceYears} Years` : '—'}</div>
            </div>
            <div className="preview-item">
              <label>Publications Subscribed</label>
              <div>{familyData.publications || 'None'}</div>
            </div>
          </div>

          <div className="preview-title">Family Members Details</div>
          {allMembers.map((m, idx) => (
            <div className="detail-card" key={idx}>
              <div className="detail-title">
                {idx + 1}. {m.fullName || '—'} {m.isHead ? ' — SELF' : ''}
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Current Status</label>
                  <span>{m.currentStatus || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <span>{m.dateOfBirth || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Qualification</label>
                  <span>{m.qualification || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Occupation</label>
                  <span>{m.occupation || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Location</label>
                  <span>{[m.city, m.state, m.country].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Health Condition</label>
                  <span>{m.healthCondition || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Practicing Catholic</label>
                  <span>{m.practicingCatholic || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Church Activities</label>
                  <span>{m.churchActivities || '—'}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="navigation">
            <button
              type="button"
              className="btn secondary"
              onClick={() => handleNextPage(3)}
            >
              &larr; Back to Step 3
            </button>
            <button
              type="button"
              className="btn verify"
              onClick={handleSubmit}
            >
              Verify &amp; Submit Application
            </button>
          </div>
        </div>

      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="overlay">
          <div className="loader"></div>
          <div>Saving survey responses to Google Sheets...</div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successData && (
        <div className="modal">
          <div className="modal-box">
            <div className="success-icon">&#10003;</div>
            <h2>Survey Submitted!</h2>
            <p>Thank you. Your family survey has been successfully saved to Google Sheets.</p>
            <div className="family-id">
              <span>Family ID</span>
              <strong>{successData.familyId}</strong>
            </div>
            <p style={{ fontSize: '13px', color: '#555' }}>
              {successData.memberCount} member(s) recorded.
            </p>
            <button
              type="button"
              className="btn primary"
              onClick={handleReset}
              style={{ width: '100%', marginTop: '15px' }}
            >
              Start New Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
