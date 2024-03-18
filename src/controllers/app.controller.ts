import { Request, Response } from "express";
import { findCSVFile, parseCSVFileToJson } from "../utils/csv.utils";

/**
 * @desc      Handle CSV file upload
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Object } req.file - Uploaded file information
 * @returns   { JSON } - A JSON object indicating the status and information of the uploaded file
 */
const uploadCSV = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, filename, size } = req.file;

  return res.status(201).json({
    message: "File uploaded successfully",
    fileInfo: { originalname, filename, size },
  });
};

/**
 * @desc      Get CSV data based on appId and boardId
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.query.appId - Application ID
 * @property  { String } req.query.boardId - Board ID
 * @returns   { JSON } - A JSON object representing the parsed CSV data or an error message
 */
const getCSVData = async (req: Request, res: Response) => {
  const { appId, boardId, start = 1, max = 20 } = req.query;

  try {
    const filePath = await findCSVFile(String(appId), String(boardId));
    if (filePath) {
      const offset = (Number(start) - 1) * Number(max);
      const data = await parseCSVFileToJson(filePath, offset, Number(max));
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: "CSV file not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const appController = {
  uploadCSV,
  getCSVData,
};
