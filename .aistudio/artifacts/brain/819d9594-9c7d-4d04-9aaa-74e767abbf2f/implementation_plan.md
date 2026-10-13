# Implementation Plan - Server-Side Gallery Storage & Settings Cleanup

## User Requirements
1. Remove default stock photos so the photo gallery starts clean.
2. Store uploaded photos on the server backend (`parish_db.json`) so they sync across mobile, tablet, and other devices.
3. Remove the background image picker option from the Parish Settings page.
4. Ensure uploaded photos render reliably across the homepage and public gallery.

## Proposed Changes

### 1. Backend Database (`src/server/db.ts`)
- Clear initial default images from `getInitialDatabase()` so `gallery_images` starts empty (`[]`), unless uploaded.
- Ensure backend file persistence successfully saves and retrieves all uploaded gallery images.

### 2. Admin Gallery Page (`src/pages/admin/AdminGalleryPage.tsx`)
- Ensure uploads are sent directly to the server via `POST /gallery/images` and stored server-side.
- Load photos from server API (`GET /gallery/images`) rather than relying solely on local storage.

### 3. Parish Settings Page (`src/pages/admin/AdminSettingsPage.tsx`)
- Remove the hero background image picker and associated modal.
- Clean up settings form state to exclude `heroImageUrl`.

### 4. Public Pages (`HomePage.tsx` & `GalleryPage.tsx`)
- Load published gallery images from the server API (`GET /gallery/images`).
- Render uploaded photos cleanly and reliably without placeholder fallbacks when user has uploaded photos.

## Verification Plan
- Compile and lint applet.
- Test uploading an image from the Priest portal and verifying it appears on Homepage and Gallery.
- Verify Parish Settings no longer contains the image picker.
