const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
} = require("../controllers/documentController");



router.post("/",auth,createDocument);

router.get("/",auth,getDocuments);

router.get("/:id",auth,getDocument);

router.put("/:id",auth,updateDocument);

router.delete("/:id",auth,deleteDocument);


module.exports = router;