# API Endpoint для загрузки файлов

## POST /api/upload

Этот endpoint необходимо реализовать на бэкенде для загрузки файлов.

### Запрос
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData с полем `file`

### Ответ
```json
{
  "url": "https://storage.example.com/documents/abc123.pdf"
}
```

### Пример реализации (Node.js/Express)
```javascript
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    // Загрузка в S3/облако
    const fileUrl = await uploadToStorage(req.file);
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});
```

### Временная заглушка
До реализации бэкенда используется локальное хранилище через Data URLs.
