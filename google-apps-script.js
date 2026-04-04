// =============================================
// BUNNDLE – Google Apps Script
// Paste this ENTIRE file into Apps Script editor
// =============================================

function doPost(e) {
  try {
    var raw  = e.postData.contents;
    var data = JSON.parse(raw);
    var sheet = getSheet(data.purpose);
    appendRow(sheet, data);
    return response({ success: true });
  } catch (err) {
    return response({ success: false, error: err.message });
  }
}

function doGet(e) {
  // Also handle GET with query params (fallback)
  if (e.parameter && e.parameter.name) {
    try {
      var sheet = getSheet(e.parameter.purpose);
      appendRow(sheet, e.parameter);
      return response({ success: true });
    } catch (err) {
      return response({ success: false, error: err.message });
    }
  }
  return response({ status: 'Bunndle sheet API running.' });
}

function getSheet(purpose) {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName =
    purpose === 'lease' ? 'Lease a Car' :
    purpose === 'list'  ? 'Rent a Car'  : 'General';

  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['Timestamp', 'Purpose', 'Name', 'Email', 'Phone', 'Message']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  return sheet;
}

function appendRow(sheet, data) {
  sheet.appendRow([
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    data.purpose || '',
    data.name    || '',
    data.email   || '',
    data.phone   || '',
    data.message || '',
  ]);
}

function response(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
