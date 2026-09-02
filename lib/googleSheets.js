import { google } from 'googleapis';

export const CONFIG = {
  FAMILY_SHEET: 'Families',
  MEMBER_SHEET: 'FamilyMembers',
  SETTINGS_SHEET: 'Settings',
  MAX_FAMILY_MEMBERS: 20,
  DEFAULT_PARISH_NAME: 'Chalassery, St.Pius X Church',
  DEFAULT_PARISH_WARDS: [
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
  ]
};

const FAMILY_HEADERS = [
  'Family ID',
  'Name of Parish',
  'Parish Ward',
  'House Name',
  'Head of Family',
  'Mobile Number',
  'Email Address',
  'Permanent Address',
  'PIN Code',
  'Duration of Residence (Years)',
  'Economic Status',
  'Publications / Newspapers',
  'Submitted At'
];

const MEMBER_HEADERS = [
  'Family ID',
  'Member No',
  'Full Name',
  'Date of Birth',
  'Relation with Head',
  'Current Status',
  'Date',
  'Qualification',
  'Occupation',
  'Country',
  'State',
  'City',
  'Health Condition',
  'Practicing Catholic',
  'Church Activities'
];

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKeyRaw || !sheetId) {
    return null;
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT(
    email,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, sheetId };
}

export async function getSettingsFromSheet() {
  try {
    const client = getSheetsClient();
    if (!client) {
      return {
        parishName: CONFIG.DEFAULT_PARISH_NAME,
        wards: CONFIG.DEFAULT_PARISH_WARDS,
        maxMembers: CONFIG.MAX_FAMILY_MEMBERS,
        isConfigured: false
      };
    }

    const { sheets, sheetId } = client;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${CONFIG.SETTINGS_SHEET}!A2:A`
    }).catch(() => null);

    let wards = CONFIG.DEFAULT_PARISH_WARDS.slice();

    if (response && response.data && response.data.values) {
      const fetchedWards = response.data.values
        .map(row => (row[0] ? String(row[0]).trim() : ''))
        .filter(val => val !== '');
      if (fetchedWards.length > 0) {
        wards = fetchedWards;
      }
    }

    return {
      parishName: CONFIG.DEFAULT_PARISH_NAME,
      wards: wards,
      maxMembers: CONFIG.MAX_FAMILY_MEMBERS,
      isConfigured: true
    };
  } catch (err) {
    console.warn('Google Sheets getSettings failed, using fallback settings:', err.message);
    return {
      parishName: CONFIG.DEFAULT_PARISH_NAME,
      wards: CONFIG.DEFAULT_PARISH_WARDS,
      maxMembers: CONFIG.MAX_FAMILY_MEMBERS,
      isConfigured: false
    };
  }
}

export async function saveFamilyToSheet(data) {
  validateFamily(data);

  const client = getSheetsClient();
  if (!client) {
    throw new Error(
      'Google Sheets configuration missing. Please ensure GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are set in your environment variables (.env.local or Vercel dashboard).'
    );
  }

  const { sheets, sheetId } = client;

  try {
    await ensureHeadersExist(sheets, sheetId);
  } catch (err) {
    if (err.message && err.message.includes('404')) {
      throw new Error(`Google Sheet not found. Please verify GOOGLE_SHEET_ID ("${sheetId}") is correct.`);
    }
    if (err.message && (err.message.includes('403') || err.message.includes('permission'))) {
      throw new Error(`Permission denied. Please open your Google Sheet, click Share, and grant Editor access to your service account email (${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}).`);
    }
    throw new Error(`Google Sheets API Error: ${err.message}`);
  }

  const familyId = generateFamilyId();
  const submittedAt = new Date().toISOString();

  const familyRow = [
    familyId,
    clean(data.parishName),
    clean(data.parishWard),
    clean(data.houseName),
    clean(data.headName),
    clean(data.mobile),
    clean(data.email),
    clean(data.address),
    clean(data.pinCode),
    clean(data.residenceYears),
    clean(data.economicStatus),
    clean(data.publications),
    submittedAt
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${CONFIG.FAMILY_SHEET}!A:M`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [familyRow]
    }
  });

  const memberRows = data.members.map((member, index) => [
    familyId,
    index + 1,
    clean(member.fullName),
    clean(member.dateOfBirth),
    clean(member.relation),
    clean(member.currentStatus),
    clean(member.date),
    clean(member.qualification),
    clean(member.occupation),
    clean(member.country),
    clean(member.state),
    clean(member.city),
    clean(member.healthCondition),
    clean(member.practicingCatholic),
    clean(member.churchActivities)
  ]);

  if (memberRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${CONFIG.MEMBER_SHEET}!A:O`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: memberRows
      }
    });
  }

  return {
    success: true,
    familyId: familyId,
    memberCount: memberRows.length
  };
}

async function ensureHeadersExist(sheets, sheetId) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetNames = (spreadsheet.data.sheets || []).map(
    s => s.properties.title
  );

  const requests = [];

  if (!sheetNames.includes(CONFIG.FAMILY_SHEET)) {
    requests.push({ addSheet: { properties: { title: CONFIG.FAMILY_SHEET } } });
  }
  if (!sheetNames.includes(CONFIG.MEMBER_SHEET)) {
    requests.push({ addSheet: { properties: { title: CONFIG.MEMBER_SHEET } } });
  }
  if (!sheetNames.includes(CONFIG.SETTINGS_SHEET)) {
    requests.push({ addSheet: { properties: { title: CONFIG.SETTINGS_SHEET } } });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { requests }
    });
  }

  const checkAndSetHeader = async (sheetName, headers) => {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z1`
    }).catch(() => null);

    if (!res || !res.data || !res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers]
        }
      });
    }
  };

  await checkAndSetHeader(CONFIG.FAMILY_SHEET, FAMILY_HEADERS);
  await checkAndSetHeader(CONFIG.MEMBER_SHEET, MEMBER_HEADERS);
  await checkAndSetHeader(CONFIG.SETTINGS_SHEET, ['Parish Wards']);
}

function validateFamily(data) {
  if (!data) {
    throw new Error('No information was received.');
  }

  const requiredFamilyFields = {
    parishName: 'Name of Parish',
    parishWard: 'Parish Ward',
    houseName: 'House Name',
    headName: 'Head of Family',
    mobile: 'Mobile Number',
    address: 'Permanent Address',
    pinCode: 'PIN Code',
    residenceYears: 'Duration of Residence',
    economicStatus: 'Economic Status'
  };

  Object.keys(requiredFamilyFields).forEach(key => {
    if (
      data[key] === undefined ||
      data[key] === null ||
      String(data[key]).trim() === ''
    ) {
      throw new Error(`${requiredFamilyFields[key]} is required.`);
    }
  });

  const mobile = String(data.mobile).replace(/\s/g, '');
  if (!/^[0-9]{10}$/.test(mobile)) {
    throw new Error('Mobile number must contain 10 digits.');
  }

  const pin = String(data.pinCode).replace(/\s/g, '');
  if (!/^[0-9]{6}$/.test(pin)) {
    throw new Error('PIN Code must contain 6 digits.');
  }

  if (!Array.isArray(data.members) || data.members.length < 1) {
    throw new Error('Family head information is required.');
  }

  if (data.members.length > CONFIG.MAX_FAMILY_MEMBERS) {
    throw new Error(
      `Maximum ${CONFIG.MAX_FAMILY_MEMBERS} family members are allowed.`
    );
  }

  data.members.forEach((member, index) => {
    const number = index + 1;
    const required = {
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth',
      currentStatus: 'Current Status',
      qualification: 'Qualification',
      occupation: 'Occupation',
      country: 'Country',
      state: 'State',
      city: 'City',
      healthCondition: 'Health Condition',
      practicingCatholic: 'Practicing Catholic',
      churchActivities: 'Church Activities',
      relation: 'Relation with Head'
    };

    Object.keys(required).forEach(key => {
      if (
        member[key] === undefined ||
        member[key] === null ||
        String(member[key]).trim() === ''
      ) {
        throw new Error(
          `${required[key]} is required for member ${number}.`
        );
      }
    });
  });
}

function generateFamilyId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const random = Math.floor(100000 + Math.random() * 900000);
  return `F${dateStr}-${random}`;
}

function clean(value) {
  if (value === undefined || value === null) {
    return '';
  }
  let result = String(value).trim();
  if (/^[=+\-@]/.test(result)) {
    result = "'" + result;
  }
  return result;
}
