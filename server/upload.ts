import multer from "multer";
import path from "path";
import { Request } from "express";

// Configuração de storage para produtos
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configuração de storage para arquivos de arte
const artworkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/artwork/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "artwork-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Validação de imagens de produtos (PNG, JPG, JPEG, WebP)
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de imagem inválido. Use apenas JPG, PNG ou WebP."));
  }
};

// Validação de arquivos de arte (PDF ou CDR)
const artworkFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "application/pdf",
    "application/x-cdr",
    "application/coreldraw",
    "image/x-coreldraw",
    "application/cdr",
    "application/x-coreldraw"
  ];
  
  const allowedExtensions = [".pdf", ".cdr"];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de arquivo inválido. Use apenas PDF ou CDR."));
  }
};

// Multer configurado para imagens de produtos
export const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Multer configurado para arquivos de arte
export const uploadArtwork = multer({
  storage: artworkStorage,
  fileFilter: artworkFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
});
