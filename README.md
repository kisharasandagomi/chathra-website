# Chathra Advertising website

This is the editable source for the Chathra Advertising website. It has three pages:

- `dist/index.html`: homepage
- `dist/tuktuk/index.html`: tuk tuk advertising overview
- `dist/contact/index.html`: contact page

Shared styling and behavior live in `dist/assets/site.css` and `dist/assets/site.js`. The Colombo clip is `dist/assets/colombo.mp4`.

## Preview

Open this folder in VS Code, then serve the `dist` folder with a local web server. For example:

```powershell
python -m http.server 8765 --directory dist
```

Visit `http://localhost:8765`. You can also open `dist/index.html` directly in your browser or from VS Code. The page and asset links now work from local files.

The contact form prepares an email in the visitor's email app. It has no server-side form delivery or message storage.

The Colombo video is by Oshada Geeth from Pexels: https://www.pexels.com/video/colombo-sri-lanka-drone-view-18993625/
