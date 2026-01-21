# Production Checklist & Go Live Guide

## 1. Environment Variables (Netlify Site Settings)
Go to **Site configuration > Environment variables** and add the following keys. Values must match your local `.env`.

| Key | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Config |
| `VITE_FIREBASE_APP_ID` | Firebase Config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Config |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS Service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS Template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS Public Key |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v2 Site Key |

> **Note**: `GOOGLE_APPLICATION_CREDENTIALS` is **NOT** required for the frontend (Netlify). It is only for the local migration script.

## 2. Clear Cache & Deploy
1.  Go to **Deploys** tab in Netlify.
2.  Click **"Trigger deploy"** dropdown.
3.  Select **"Clear cache and deploy site"**.
4.  Wait for "Published" status.

## 3. Netlify Deploy Log: Qué buscar
Once the deploy is "Published", check the deploy log:
- [ ] **Build Command**: `vite build` should exit with code 0.
- [ ] **Console Output**: Look for "✓ built in..." without red errors.
- [ ] **No Secrets in Log**: Ensure environment variables are not printed in the logs (Vite handles this by default, but double check).

## 4. Firestore Security Rules
Verify in Firebase Console > Firestore Database > Rules.

**Current Status (Go Live):**
> **Important**: The current rules BLOCK all writes to `products`. This is correct for this phase as we are only reading migrated data.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Public Read, Write only via Admin SDK (backend)
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // BLOCKS frontend writes (Correct for Phase 1)
    }
    // Orders: Public Create (for everyone to buy), No Edit/Delete
    match /pedidos/{pedidoId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

### Future Admin Panel Security Options
When you build the Admin Panel (Phase D2), you will need to enable writes. Choose one of these strategies:

**Option A (Simple - Hardcoded UID)**
*Best for a single admin user.*
```javascript
allow write: if request.auth.uid == "YOUR_ADMIN_UID_FROM_FIREBASE_AUTH";
```

**Option B (Scalable - Custom Claims)**
*Best for multiple roles. Requires backend setup to assign claims.*
```javascript
allow write: if request.auth.token.admin == true;
```

## 5. Domain & Service Whitelisting
Identify your production domain (e.g., `dulzuras-nicky-nicole.netlify.app` or `tu-dominio.cl`).

1.  **EmailJS**:
    *   Go to **Dashboard > Account > Security**.
    *   Ensure "Allowed Origins" includes your Netlify URL (or is left empty/all if permissible for you).
2.  **Google reCAPTCHA v2 (checkbox)**:
    *   Go to **Admin Console > Settings**.
    *   Add **both** `netlify.app` and your final custom domain (e.g. `midominio.cl`) to the "Domains" list.
    *   Save changes (propagation can take a few minutes).
3.  **Firebase Auth** (Optional but recommended):
    *   Go to **Firebase Console > Authentication > Settings > Authorized domains**.
    *   Add your Netlify domain.

## 6. Final QA (Manual Verification)

### Home Page
- [ ] **Destacados**: Are 3 products shown without loading errors?
- [ ] **Modal**: Click a card -> Does the modal open with correct Image, Name, and Price?
- [ ] **CTA Button**: Click "Personalizar/Encargar" -> Does it go to `/formulario`? (Should NOT open modal).

### Catalog
- [ ] **Load**: Does `/catalogo` load products from Firestore?
- [ ] **Filters**: Test filtering by flavor (e.g., "Frambuesa") -> Do items update?
- [ ] **Zero Price**: Do items with `price: 0` show "Precio: $0" or "Desde: $..."? (Check `ProductCard` logic).

### Form (Critical)
- [ ] **Submission**: Fill out the form as a guest.
- [ ] **reCAPTCHA**: Verify the "I'm not a robot" checkbox works.
- [ ] **Success**: Submit -> Check for "Pedido enviado con éxito".
- [ ] **Data**: Check Firebase Console > `pedidos` collection -> Is the new order there?
