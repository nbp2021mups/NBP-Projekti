const multer = require("multer");

const MYME_TYPE_MAP = {
    "image/png": "png",
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MYME_TYPE_MAP[file.mimetype];
        let err;
        if (isValid)
            err = null;
        else
            err = new Error("Nevalidan mime type!");

        cb(err, "backend/images");
    },
    filename: (req, file, cb) => {
        const imgName = file.originalname.toLowerCase().split(" ").join("-");
        const ext = MYME_TYPE_MAP[file.mimetype];
        cb(null, imgName + "-" + Date.now() + "." + ext);
    },
});

module.exports = storage;