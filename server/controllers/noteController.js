import Note from '../models/Note.js';

// Get user's notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .sort({ isPinned: -1, createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create note
export const createNote = async (req, res) => {
  try {
    const { content } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const note = await Note.create({
      user: req.user._id,
      content,
      images,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update note
export const updateNote = async (req, res) => {
  try {
    const { content, isPinned } = req.body;
    
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (content) note.content = content;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
