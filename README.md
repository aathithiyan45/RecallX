# RecallX

RecallX is a Personal Knowledge Management System that helps users rediscover information from their own documents.

Instead of manually searching through folders, users can ask questions like:

> "Where did I read about FastAPI authentication?"

RecallX searches the user's personal knowledge library and retrieves the most relevant documents with supporting information.

---

## Features

- Add local folders as Knowledge Sources 
- Automatically index PDF, DOCX, TXT, and Markdown files
- Continuously monitor folders for newly added or modified documents
- Perform semantic search using vector embeddings
- Generate answers using a local Large Language Model
- Display document references and relevant excerpts
- Run completely offline with local storage

---

## Technology Stack

### Frontend

- React
- Vite
- Axios
- CSS3

### Backend

- FastAPI
- Python

### AI Components

- Ollama
- Gemma 3
- Sentence Transformers

### Database

- SQLite
- ChromaDB

### File Monitoring

- Watchdog

---

## Project Structure

```
RecallX/
│
├── frontend/
│   ├── React Application
│   └── UI Components
│
├── backend/
│   ├── FastAPI Server
│   ├── Watchdog
│   ├── ChromaDB
│   ├── SQLite
│   └── Ollama Integration
│
└── README.md
```

---

## How RecallX Works

1. Add a local folder as a Knowledge Source.
2. RecallX indexes all supported documents.
3. The selected folder is continuously monitored for changes.
4. Newly added or modified files are automatically indexed.
5. Users ask questions in natural language.
6. RecallX retrieves relevant documents and generates responses based on the user's own knowledge.

---

## Example

**User**

```
Where did I study SQL JOIN?
```

**RecallX**

```
I found this in Database Management Systems.pdf.

The SQL JOIN concepts are explained in the relational database chapter.

Relevant excerpt:

"RIGHT JOIN returns all rows from the right table..."
```

---

## Supported File Types

- PDF (.pdf)
- Microsoft Word (.docx)
- Text Files (.txt)
- Markdown (.md)

---

## Future Improvements

- Open source documents directly from search results
- Highlight matched paragraphs inside documents
- PDF page navigation
- Knowledge graph visualization
- Timeline-based knowledge search
- Desktop application using Tauri

---

## Author

**Aathithiyan P**

GitHub: https://github.com/aathithiyan45

---

## License

This project is intended for educational, research, and personal productivity purposes.
