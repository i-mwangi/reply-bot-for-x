# Security Policy

## 🔒 Reporting a Vulnerability

If you discover a security vulnerability in ReplyX, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: justinlord@empusaai.com
3. Include detailed steps to reproduce the vulnerability
4. Allow up to 48 hours for initial response

## 🛡️ Security Best Practices

### For Users

1. **Never commit sensitive files**
   - `.env.local` contains API keys
   - `twitter-cookies.json` contains authentication tokens
   - Both are in `.gitignore` by default

2. **Rotate credentials regularly**
   - Update Twitter cookies every 30 days
   - Regenerate API keys if you suspect compromise
   - Use different passwords for each service

3. **Monitor your accounts**
   - Check UltraContext dashboard daily
   - Watch for unusual Twitter activity
   - Review bot-generated comments regularly

4. **Use dedicated accounts**
   - Don't use your personal Twitter account
   - Create a separate professional account for automation
   - Keep API keys separate from production systems

### For Contributors

1. **Code Review**
   - All PRs require security review
   - No hardcoded credentials in code
   - Use environment variables for all secrets

2. **Dependencies**
   - Keep dependencies up to date
   - Run `npm audit` regularly
   - Review dependency changes in PRs

3. **Data Handling**
   - Never log sensitive data
   - Sanitize user inputs
   - Use secure communication channels

## 🔐 What We Protect

- Twitter authentication cookies
- API keys (Replicate, UltraContext)
- User activity data
- Browser session data

## ✅ What's Safe to Share

- Configuration examples (without real values)
- Code structure and logic
- Documentation and guides
- Non-sensitive logs

## 📋 Security Checklist

Before running the bot:
- [ ] `.env.local` is in `.gitignore`
- [ ] `twitter-cookies.json` is in `.gitignore`
- [ ] All API keys are from example files
- [ ] No sensitive data in git history
- [ ] UltraContext API key is valid and secure

## 🚨 Known Limitations

1. **Browser Automation Detection**
   - Twitter may detect Puppeteer despite stealth plugins
   - Use at your own risk
   - Follow rate limits strictly

2. **Cookie Expiration**
   - Twitter cookies expire periodically
   - You'll need to refresh them manually
   - Monitor for authentication errors

3. **Rate Limiting**
   - Twitter has undocumented rate limits
   - Exceeding them may result in temporary restrictions
   - Follow the recommended usage guidelines

## 📞 Contact

For security concerns: justinlord@empusaai.com

---

**Last Updated:** January 29, 2026
