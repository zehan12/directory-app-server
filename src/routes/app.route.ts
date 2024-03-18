import { Router } from "express";
import { appController } from "../controllers/app.controller";
import fileUpload from "../middleware/fileUpload";

const appRouter = Router();

// @route   POST /upload-csv
// @desc    Upload CSV file
// @access  Public
appRouter.post("/upload-csv", fileUpload, appController.uploadCSV);

// @route   GET /get-csv
// @desc    Get CSV data
// @access  Public
appRouter.get("/get-csv", appController.getCSVData);

export default appRouter;
