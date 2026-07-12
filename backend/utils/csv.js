const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const toCsv = (rows, columns) => {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column.key])).join(",")
  );
  return [header, ...body].join("\n");
};

module.exports = {
  toCsv,
};
