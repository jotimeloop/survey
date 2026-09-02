/*******************************************************
 * FAMILY INFORMATION SURVEY
 * Google Apps Script + Google Sheets
 *******************************************************/

const CONFIG = {

  FAMILY_SHEET: 'Families',
  MEMBER_SHEET: 'FamilyMembers',
  SETTINGS_SHEET: 'Settings',

  MAX_FAMILY_MEMBERS: 20,

  DEFAULT_PARISH_NAME:
    'Chalassery, St.Pius X Church',

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


/*******************************************************
 * WEB APP
 *******************************************************/

function doGet() {

  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle('Family Information Survey')
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1'
    );

}


/*******************************************************
 * INCLUDE HTML FILES
 *******************************************************/

function include(filename) {

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();

}


/*******************************************************
 * RUN THIS ONCE AFTER CREATING THE PROJECT
 *******************************************************/

function setupSheets() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();


  /*****************************************************
   * FAMILIES SHEET
   *****************************************************/

  let familySheet =
    ss.getSheetByName(
      CONFIG.FAMILY_SHEET
    );


  if (!familySheet) {

    familySheet =
      ss.insertSheet(
        CONFIG.FAMILY_SHEET
      );

  }


  const familyHeaders = [

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


  ensureHeaders(
    familySheet,
    familyHeaders
  );


  /*****************************************************
   * FAMILY MEMBERS SHEET
   *****************************************************/

  let memberSheet =
    ss.getSheetByName(
      CONFIG.MEMBER_SHEET
    );


  if (!memberSheet) {

    memberSheet =
      ss.insertSheet(
        CONFIG.MEMBER_SHEET
      );

  }


  const memberHeaders = [

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


  ensureHeaders(
    memberSheet,
    memberHeaders
  );


  /*****************************************************
   * SETTINGS SHEET
   *****************************************************/

  let settingsSheet =
    ss.getSheetByName(
      CONFIG.SETTINGS_SHEET
    );


  if (!settingsSheet) {

    settingsSheet =
      ss.insertSheet(
        CONFIG.SETTINGS_SHEET
      );

  }


  if (settingsSheet.getLastRow() === 0) {

    settingsSheet
      .getRange(1, 1)
      .setValue('Parish Wards');


    CONFIG.DEFAULT_PARISH_WARDS
      .forEach(function(ward, index) {

        settingsSheet
          .getRange(index + 2, 1)
          .setValue(ward);

      });

  }


  familySheet.setFrozenRows(1);
  memberSheet.setFrozenRows(1);
  settingsSheet.setFrozenRows(1);


  familySheet.autoResizeColumns(
    1,
    familyHeaders.length
  );

  memberSheet.autoResizeColumns(
    1,
    memberHeaders.length
  );


  return 'Sheets created successfully.';

}


/*******************************************************
 * ENSURE HEADER ROW
 *******************************************************/

function ensureHeaders(sheet, headers) {

  if (sheet.getLastRow() === 0) {

    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setValues([headers]);

  }

}


/*******************************************************
 * GET APPLICATION SETTINGS
 *******************************************************/

function getSettings() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(
      CONFIG.SETTINGS_SHEET
    );


  let wards =
    CONFIG.DEFAULT_PARISH_WARDS.slice();


  if (sheet && sheet.getLastRow() > 1) {

    const values =
      sheet
        .getRange(
          2,
          1,
          sheet.getLastRow() - 1,
          1
        )
        .getValues();


    wards =
      values
        .map(function(row) {
          return String(row[0]).trim();
        })
        .filter(function(value) {
          return value !== '';
        });

  }


  return {

    parishName:
      CONFIG.DEFAULT_PARISH_NAME,

    wards: wards,

    maxMembers:
      CONFIG.MAX_FAMILY_MEMBERS

  };

}


/*******************************************************
 * SAVE COMPLETE FAMILY
 *******************************************************/

function saveFamily(data) {

  validateFamily(data);


  const lock =
    LockService.getScriptLock();


  try {

    lock.waitLock(30000);


    const ss =
      SpreadsheetApp.getActiveSpreadsheet();


    const familySheet =
      ss.getSheetByName(
        CONFIG.FAMILY_SHEET
      );


    const memberSheet =
      ss.getSheetByName(
        CONFIG.MEMBER_SHEET
      );


    if (!familySheet ||
        !memberSheet) {

      setupSheets();

    }


    const familySheetFinal =
      ss.getSheetByName(
        CONFIG.FAMILY_SHEET
      );


    const memberSheetFinal =
      ss.getSheetByName(
        CONFIG.MEMBER_SHEET
      );


    const familyId =
      generateFamilyId();


    const submittedAt =
      new Date();


    /***************************************************
     * SAVE FAMILY
     ***************************************************/

    familySheetFinal.appendRow([

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

    ]);


    /***************************************************
     * SAVE MEMBERS
     ***************************************************/

    const memberRows =
      data.members.map(
        function(member, index) {

          return [

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

          ];

        }
      );


    if (memberRows.length > 0) {

      memberSheetFinal
        .getRange(
          memberSheetFinal.getLastRow() + 1,
          1,
          memberRows.length,
          memberRows[0].length
        )
        .setValues(memberRows);

    }


    return {

      success: true,

      familyId: familyId,

      memberCount:
        memberRows.length

    };


  } catch (error) {

    throw new Error(
      'Unable to save information: ' +
      error.message
    );

  } finally {

    try {
      lock.releaseLock();
    } catch (e) {}

  }

}


/*******************************************************
 * VALIDATE FAMILY
 *******************************************************/

function validateFamily(data) {

  if (!data) {

    throw new Error(
      'No information was received.'
    );

  }


  const requiredFamilyFields = {

    parishName:
      'Name of Parish',

    parishWard:
      'Parish Ward',

    houseName:
      'House Name',

    headName:
      'Head of Family',

    mobile:
      'Mobile Number',

    address:
      'Permanent Address',

    pinCode:
      'PIN Code',

    residenceYears:
      'Duration of Residence',

    economicStatus:
      'Economic Status'

  };


  Object.keys(
    requiredFamilyFields
  ).forEach(function(key) {

    if (
      data[key] === undefined ||
      data[key] === null ||
      String(data[key]).trim() === ''
    ) {

      throw new Error(
        requiredFamilyFields[key] +
        ' is required.'
      );

    }

  });


  /*****************************************************
   * MOBILE VALIDATION
   *****************************************************/

  const mobile =
    String(data.mobile)
      .replace(/\s/g, '');


  if (!/^[0-9]{10}$/.test(mobile)) {

    throw new Error(
      'Mobile number must contain 10 digits.'
    );

  }


  /*****************************************************
   * PIN VALIDATION
   *****************************************************/

  const pin =
    String(data.pinCode)
      .replace(/\s/g, '');


  if (!/^[0-9]{6}$/.test(pin)) {

    throw new Error(
      'PIN Code must contain 6 digits.'
    );

  }


  /*****************************************************
   * MEMBERS
   *****************************************************/

  if (!Array.isArray(data.members)) {

    throw new Error(
      'Family member information is invalid.'
    );

  }


  if (
    data.members.length < 1
  ) {

    throw new Error(
      'Family head information is missing.'
    );

  }


  if (
    data.members.length >
    CONFIG.MAX_FAMILY_MEMBERS
  ) {

    throw new Error(
      'Maximum ' +
      CONFIG.MAX_FAMILY_MEMBERS +
      ' family members are allowed.'
    );

  }


  data.members.forEach(
    function(member, index) {

      const number =
        index + 1;


      const required = {

        fullName:
          'Full Name',

        dateOfBirth:
          'Date of Birth',

        currentStatus:
          'Current Status',

        qualification:
          'Qualification',

        occupation:
          'Occupation',

        country:
          'Country',

        state:
          'State',

        city:
          'City',

        healthCondition:
          'Health Condition',

        practicingCatholic:
          'Practicing Catholic',

        churchActivities:
          'Church Activities',

        relation:
          'Relation with Head'

      };


      Object.keys(required)
        .forEach(function(key) {

          if (
            member[key] === undefined ||
            member[key] === null ||
            String(member[key]).trim() === ''
          ) {

            throw new Error(

              required[key] +
              ' is required for member ' +
              number +
              '.'

            );

          }

        });

    }
  );

}


/*******************************************************
 * GENERATE UNIQUE FAMILY ID
 *******************************************************/

function generateFamilyId() {

  const date =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd'
    );


  const random =
    Math.floor(
      100000 +
      Math.random() * 900000
    );


  return 'F' + date + '-' + random;

}


/*******************************************************
 * CLEAN DATA
 *******************************************************/

function clean(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return '';

  }


  let result =
    String(value).trim();


  /*
   * Prevent accidental spreadsheet
   * formula injection.
   */

  if (
    /^[=+\-@]/.test(result)
  ) {

    result = "'" + result;

  }


  return result;

}
