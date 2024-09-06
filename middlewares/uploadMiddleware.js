const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fsPromises = require("fs").promises;
//const ollama = require("ollama").default; // Correct import for default export
require("dotenv").config();

// const ENV = process.env.ENV;

// Define storage for posts
const storagePosts = multer.diskStorage({
  destination: function (req, file, callback) {
    const uploadDir = path.join(__dirname, "../static/posts/");
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    callback(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

// Define the resize image middleware
const resizeImage = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Bitte fügen Sie eine Foto hinzu."));
  }
  try {
    const inputPath = req.file.path;
    const tempOutputPath = path.join(
      path.dirname(inputPath),
      "temp-" + path.basename(inputPath)
    );

    // Resize the image and save to a temporary location
    await sharp(inputPath).resize(1080, 724).toFile(tempOutputPath);

    // Replace the original file with the resized file
    await fsPromises.rename(tempOutputPath, inputPath);

    next();
  } catch (error) {
    next(error);
  }
};

/*

NICHT NÖTIG FÜR BEWERBUNGEN! EINRICHTUNG ZU KOMPLIZIERT!
WENN SIE DAS LESEN UND DENNOCH NEUGIERIG SIND -> KOMMENTAR ENTFERNEN -> OLLAMA INSTALLIEREN -> LLAVA INSTALLIEREN
AUCH WICHTIG DIE KOMMENTARE BEI endpoints/services/postServices.js ENTFERNEN! 
ZEILEN: 5; 192; 194-211;
ALLES AUF DEM EIGENEN RECHNER
ES WIRD EINE GRAFIKKARTE BENÖTIGT FÜR DIE BILDANALYSE! OHNE GRAKA -> SEHR LANGE BEARBEITUNGSZEITEN!

// Function to analyze a single image using the Ollama API
const analyzeImage = async (imageBuffer) => {
  try {
    const response = await ollama.generate({
      model: "llava",
      prompt:
        "Beschreibe was du siehst in 3 Schlüsselwörtern auf Deutsch. Nur die Schlüsselwörter ohne zusätzliche Beschreibung.",
      images: [imageBuffer],
    });

    if (response && response.response) {
      return response.response.trim();
    } else {
      throw new Error("Invalid response from Ollama API");
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Error analyzing image");
  }
};

// Function to resize and preprocess image before analysis
const preprocessImage = async (imagePath) => {
  try {
    // Resize image to a smaller size if necessary
    const resizedImageBuffer = await sharp(imagePath)
      .resize({ width: 500 }) // Adjust width as needed
      .toBuffer();

    return resizedImageBuffer;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    throw new Error("Error preprocessing image");
  }
};

// Middleware to add image tags using the Ollama API
const addImageTags = async (req, res, next) => {

  if (!ENV) {
    if (!req.file) {
      return next(new Error("Bitte fügen Sie eine Foto hinzu."));
    }
    try {
      const imagePath = req.file.path;
      const imageBuffer = await preprocessImage(imagePath);
      const tags = await analyzeImage(imageBuffer);
      req.body.tags = tags; // Assuming you want to store tags in req.body
      next();
    } catch (error) {
      next(error);
    }
  }else{
    next();
  }
};
*/

function addImageTags(req, res, next){
  next();
}

// Define storage for profile pictures
const storageProfile = multer.diskStorage({
  destination: function (req, file, callback) {
    const uploadDir = path.join(__dirname, "../static/profile/");
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    callback(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

// Storage for Profile Banner
const storageBanner = multer.diskStorage({
  destination: function (req, file, callback) {
    const uploadDir = path.join(__dirname, "../static/profile/banner/");
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    callback(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

const uploadPost = multer({ storage: storagePosts });
const uploadProfile = multer({ storage: storageProfile });
const uploadBanner = multer({ storage: storageBanner });

module.exports = {
  uploadPost,
  uploadProfile,
  resizeImage,
  addImageTags, // Export the middleware to add image tags
  uploadBanner,
};
