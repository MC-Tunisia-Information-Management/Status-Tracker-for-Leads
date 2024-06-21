function checkAndFillStatus() {
  var sheetName = "Leads Data";
  var dataRange = "A4:F";
  var emailColumnIndex = 2; // Index of the "Email" column (starts from 0)
  var statusColumnIndex = 0; // Index of the "SU" column (starts from 0)

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sheet.getRange(dataRange).getValues();

  data.forEach(function (row, rowIndex) {
    var email = row[emailColumnIndex];
    var status = "";

    if (email !== "") {
      var query = `query CheckPersonPresent {
          checkPersonPresent(email: "${email}") {
              status
          }
        }`;

      // Make API request to check if email exists in AIESEC database
      var response = UrlFetchApp.fetch(
        "https://gis-api.aiesec.org/graphql?access_token={access_token}",
        {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify({ query: query }),
          muteHttpExceptions: true,
        }
      );

      var responseData = JSON.parse(response.getContentText());

      if (
        responseData &&
        responseData.data &&
        responseData.data.checkPersonPresent
      ) {
        status = responseData.data.checkPersonPresent.status;
      } else {
        status = "Lead | Wrong mail"; //
      }

      Logger.log(
        "Row " +
          (rowIndex + 4) +
          ": Email: " +
          email +
          ", Status Value: " +
          status
      );
    }

    sheet.getRange(rowIndex + 4, statusColumnIndex + 1).setValue(status);
  });
}
