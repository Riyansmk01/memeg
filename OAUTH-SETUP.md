# OAuth Provider Setup Guide

## 🔐 **OAUTH CONFIGURATION FOR ESAWITKU**

### **1. Google OAuth Setup**

#### **Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "eSawitKu SaaS"
4. Click "Create"

#### **Step 2: Enable Google+ API**
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

#### **Step 3: Create OAuth 2.0 Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Select "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
5. Click "Create"
6. Copy Client ID and Client Secret

#### **Step 4: Configure Environment**
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

### **2. GitHub OAuth Setup**

#### **Step 1: Create GitHub OAuth App**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: eSawitKu SaaS
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"

#### **Step 2: Get Credentials**
1. Copy "Client ID" and "Client Secret"
2. Note: Client Secret is only shown once!

#### **Step 3: Configure Environment**
```env
GITHUB_ID=your-client-id-here
GITHUB_SECRET=your-client-secret-here
```

---

### **3. Facebook OAuth Setup**

#### **Step 1: Create Facebook App**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Select "Consumer" → "Next"
4. Enter app name: "eSawitKu SaaS"
5. Enter contact email
6. Click "Create App"

#### **Step 2: Add Facebook Login**
1. In App Dashboard, click "Add Product"
2. Find "Facebook Login" → "Set Up"
3. Select "Web" platform
4. Enter site URL: `http://localhost:3000`

#### **Step 3: Configure OAuth Settings**
1. Go to "Facebook Login" → "Settings"
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook`
3. Save changes

#### **Step 4: Get App Credentials**
1. Go to "Settings" → "Basic"
2. Copy "App ID" and "App Secret"

#### **Step 5: Configure Environment**
```env
FACEBOOK_CLIENT_ID=your-app-id-here
FACEBOOK_CLIENT_SECRET=your-app-secret-here
```

---

## 🔧 **TESTING OAUTH INTEGRATION**

### **Test Google OAuth:**
1. Start the application: `npm run dev`
2. Go to: `http://localhost:3000/auth/signin`
3. Click "Lanjutkan dengan Google"
4. Complete Google OAuth flow
5. Verify redirect to dashboard

### **Test GitHub OAuth:**
1. Go to: `http://localhost:3000/auth/signin`
2. Click "Lanjutkan dengan GitHub"
3. Complete GitHub OAuth flow
4. Verify redirect to dashboard

### **Test Facebook OAuth:**
1. Go to: `http://localhost:3000/auth/signin`
2. Click "Lanjutkan dengan Facebook"
3. Complete Facebook OAuth flow
4. Verify redirect to dashboard

---

## 🚨 **TROUBLESHOOTING OAUTH**

### **Common Issues:**

#### **"Invalid redirect URI" Error:**
- Check that redirect URIs in OAuth app match exactly
- Ensure no trailing slashes
- Verify protocol (http vs https)

#### **"Client ID not found" Error:**
- Verify Client ID is correct
- Check if OAuth app is published
- Ensure app is in correct environment

#### **"Access denied" Error:**
- Check OAuth app permissions
- Verify user has access to the app
- Check if app requires approval

#### **"State mismatch" Error:**
- Clear browser cookies
- Restart the application
- Check NEXTAUTH_SECRET is set

---

## 🔒 **SECURITY BEST PRACTICES**

### **Environment Variables:**
- Never commit OAuth secrets to version control
- Use different credentials for dev/staging/production
- Rotate secrets regularly
- Use environment-specific redirect URIs

### **OAuth App Settings:**
- Enable only necessary permissions
- Set appropriate token expiration
- Use HTTPS in production
- Monitor OAuth usage

### **Application Security:**
- Validate OAuth responses
- Implement proper session management
- Use secure cookies
- Enable CSRF protection

---

## 📊 **MONITORING OAUTH**

### **Track OAuth Events:**
```javascript
// Monitor successful logins
console.log('OAuth login successful:', {
  provider: 'google',
  userId: user.id,
  timestamp: new Date()
})

// Monitor failed attempts
console.log('OAuth login failed:', {
  provider: 'google',
  error: error.message,
  timestamp: new Date()
})
```

### **Analytics Integration:**
- Track OAuth provider usage
- Monitor login success rates
- Identify popular providers
- Detect suspicious activity

---

## 🎯 **PRODUCTION DEPLOYMENT**

### **Update Redirect URIs:**
When deploying to production, update OAuth app settings:

#### **Google:**
- Add: `https://yourdomain.com/api/auth/callback/google`

#### **GitHub:**
- Update: `https://yourdomain.com/api/auth/callback/github`

#### **Facebook:**
- Add: `https://yourdomain.com/api/auth/callback/facebook`

### **Environment Variables:**
```env
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
GITHUB_ID=production-client-id
GITHUB_SECRET=production-client-secret
FACEBOOK_CLIENT_ID=production-app-id
FACEBOOK_CLIENT_SECRET=production-app-secret
```

---

**OAuth setup complete!** 🎉 Your users can now sign in with Google, GitHub, and Facebook.
