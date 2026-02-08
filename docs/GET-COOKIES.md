# GET YOUR TWITTER COOKIES

## Steps:

1. Open YOUR Chrome (Profile 12) normally
2. Go to https://twitter.com (make sure you're logged in)
3. Press F12 to open DevTools
4. Go to "Application" tab
5. Click "Cookies" on the left
6. Click "https://twitter.com"
7. Find these cookies and copy their values:

   - `auth_token` - COPY THE VALUE
   - `ct0` - COPY THE VALUE

8. Create a file called `twitter-cookies.json` with this content:

```json
{
  "auth_token": "PASTE_YOUR_AUTH_TOKEN_HERE",
  "ct0": "PASTE_YOUR_CT0_HERE"
}
```

9. Save it in C:\ReplyX\twitter-cookies.json

10. Run: node bot-with-cookies.js
