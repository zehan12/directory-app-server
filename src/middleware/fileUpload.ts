import { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "node:fs";

const uploadDirectory = "./uploads";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: Function
  ) {
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }
    cb(null, uploadDirectory);
  },

  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const { appId, boardId } = req.query;
    const filename = `${appId}-${boardId}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage }).single("csvFile");

const fileUpload = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    const { appId, boardId } = req.query;

    if (!appId || !boardId) {
      return res
        .status(400)
        .json({ error: "Missing required parameters: appId and boardId" });
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "File field is missing" });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    next();
  });
};

export default fileUpload;
