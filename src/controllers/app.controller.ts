import { Request, Response } from "express";
import { findCSVFile, getCSVJson, parseCSVFileToJson } from "../utils/csv.utils";

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

	return res.status(200).json({
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
 * @property  { Number } req.query.start - Start index for pagination (default: 1)
 * @property  { Number } req.query.max - Maximum number of items per page (default: 20)
 * @property  { String } req.query.search - Search query string
 * @property  { Array } req.query.filters - Array of filter objects eg:["Europe","1992"]
 * @returns   { JSON } - A JSON object representing the parsed CSV data or an error message
 */
const getCSVData = async (req: Request, res: Response) => {
	let { appId, boardId, start = 1, max = 20, search, filters = [] } = req.query;
	if (start === "undefined") start = 1;
	try {
		const filePath = await findCSVFile(String(appId), String(boardId));
		if (filePath) {
			let parsedFilters: any;
			try {
				parsedFilters = JSON.parse(filters);
			} catch (error) {
				parsedFilters = [];
			}
			if ((search !== undefined && search !== "") || parsedFilters.length > 0) {
				const data = await getCSVJson(filePath);
				const totalCount = data.data.length;
				let currentCount = 0;
				let searchFilteredData: any[] = [...data.data];

				if (search !== "" && search !== undefined) {
					searchFilteredData = searchFilteredData.filter((item) => {
						const result = Object.values(item).join(" ").toLowerCase();
						return result.includes(search.toString().toLowerCase());
					});

					if (!searchFilteredData.length) {
						return res.status(400).json({ error: "No search result found" });
					}
				}

				if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
					parsedFilters.forEach((filter: any) => {
						searchFilteredData = searchFilteredData.filter((item) => {
							return Object.values(item).some(
								(val: any) => val.toLowerCase() === filter.toLowerCase(),
							);
						});
					});
				}

				let currentIndex = 0;
				let dataCount = 0;
				const paginatedData: any[] = [];
				const offset = (Number(start) - 1) * Number(max);
				searchFilteredData.forEach((item) => {
					if (currentIndex >= offset && dataCount < Number(max)) {
						paginatedData.push(item);
						dataCount++;
						currentCount++;
					}
					currentIndex++;
				});
				return res.status(200).json({ data: paginatedData, currentCount, totalCount });
			} else {
				const offset = (Number(start) - 1) * Number(max);
				const data = await parseCSVFileToJson(filePath, offset, Number(max));
				return res.status(200).json(data);
			}
		} else {
			return res.status(404).json({ error: "CSV file not found" });
		}
	} catch (error: unknown) {
		console.log(error, "errors");
		return res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * @desc      download CSV data based on appId and boardId
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.query.appId - Application ID
 * @property  { String } req.query.boardId - Board ID
 * @returns   { JSON } - A JSON object representing the parsed CSV data with fileName or an error message
 */
const downloadCSV = async (req: Request, res: Response) => {
	const { appId, boardId } = req.query;
	const filePath = await findCSVFile(String(appId), String(boardId));

	if (!filePath) {
		return res.status(400).json({ error: "File not found" });
	}

	const csvData = await getCSVJson(filePath);
	res.status(200).json(csvData);
};

export const appController = {
	uploadCSV,
	getCSVData,
	downloadCSV,
};
