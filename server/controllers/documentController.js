const Document = require("../models/Document");

// CREATE
const createDocument = async (req, res) => {
  try {
    const { title, type, content } = req.body;

    if (!title || !type || !content) {
      return res.status(400).json({
        error: "title, type, and content are required",
      });
    }

    const document = await Document.create({
      user: req.user.id,
      title,
      type,
      content,
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
};

// GET ALL FOR LOGGED-IN USER
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

// GET ONE
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
};

// UPDATE
const updateDocument = async (req, res) => {
  try {
    const { title, type, content } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Save previous version to history
    document.history.push({
      content: document.content,
      updatedAt: new Date(),
    });

    if (title) document.title = title;
    if (type) document.type = type;
    if (content) document.content = content;

    await document.save();

    res.json(document);
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
};

// DELETE
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};