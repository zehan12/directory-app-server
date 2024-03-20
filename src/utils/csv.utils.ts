import csvParser from "csv-parser";
import fs from "fs";
import path from "path";

export const findCSVFile = async (
  appId: string,
  boardId: string
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const directory = path.join(__dirname, "..", "..", "uploads");
    const filenamePrefix = `${appId}-${boardId}-`;

    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      const csvFile = files.find((file) => file.startsWith(filenamePrefix));
      if (csvFile) {
        resolve(path.join(directory, csvFile));
      } else {
        resolve(null);
      }
    });
  });
};

export const parseCSVFileToJson = (
  filePath: string,
  offset: number,
  limit: number
): Promise<{ data: any[]; totalCount: number }> => {
  return new Promise((resolve, reject) => {
    const jsonArray: any[] = [];
    let currentIndex = 0;
    let dataCount = 0;
    let totalCount = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        totalCount += data ? 1 : 0;
        if (currentIndex >= offset && dataCount < limit) {
          jsonArray.push(data);
          dataCount++;
        }
        currentIndex++;
      })
      .on("end", () => {
        const result = { data: jsonArray, totalCount };
        resolve(result);
      })
      .on("error", (err) => reject(err));
  });
};

export const getCSVJson = (
  filePath: string
): Promise<{
  fileName: string;
  data: any[];
  totalCount: number;
}> => {
  return new Promise((resolve, reject) => {
    const jsonArray: any[] = [];
    let totalCount = 0;
    const fileName = filePath.split("/uploads")[1]?.slice(1);
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        jsonArray.push(data);
        totalCount++;
      })
      .on("end", () => {
        const result = { data: jsonArray, totalCount, fileName };
        resolve(result);
      })
      .on("error", (err) => reject(err));
  });
};
