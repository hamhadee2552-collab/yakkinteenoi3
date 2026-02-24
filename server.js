app.get("/latest", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B:D`,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.json({ error: "ไม่มีข้อมูลในชีท" });
    }

    // === หา "แถวล่างสุดที่มีข้อมูลจริงๆ" ===
    let lastRowWithData = null;
    let lastRowIndex = -1;

    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];

      // เช็คว่ามีตัวเลขจริงใน B, C หรือ D ไหม
      const hasNumber = row.some(v => !isNaN(parseFloat(v)));

      if (hasNumber) {
        lastRowWithData = row;
        lastRowIndex = i + 1; // แปลงเป็นเลขแถวจริงใน Sheets
        break;
      }
    }

    if (!lastRowWithData) {
      return res.json({ error: "ไม่พบแถวที่มีตัวเลขใน B,C,D" });
    }

    // แปลงเป็นตัวเลข (ถ้าว่าง = null)
    const latest = lastRowWithData.map(v => {
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    });

    res.json({
      latest: latest,          // [B, C, D] ของแถวล่าสุดที่มีข้อมูลจริง
      rowNumber: lastRowIndex  // แถวจริงใน Google Sheets
    });

  } catch (error) {
    console.error(error);
    res.json({ error: error.message });
  }
});
