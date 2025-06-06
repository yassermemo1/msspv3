# Duplicate Routes Report

**Generated:** 2025-06-06T23:03:17.817Z

## Summary

- **Total Routes:** 179
- **Duplicate Groups:** 8
- **Total Duplicate Occurrences:** 16

## Duplicate Routes

| Method | Path | Line Numbers | Action |
|--------|------|--------------|--------|
| GET | `/api/certificates-of-compliance` | 1302 ✅, 6453 ❌ | Keep first, remove others |
| POST | `/api/certificates-of-compliance` | 1351 ✅, 6513 ❌ | Keep first, remove others |
| DELETE | `/api/certificates-of-compliance/:param` | 1417 ✅, 6619 ❌ | Keep first, remove others |
| GET | `/api/license-pools` | 5576 ✅, 6152 ❌ | Keep first, remove others |
| GET | `/api/license-pools/:param` | 5587 ✅, 6163 ❌ | Keep first, remove others |
| POST | `/api/license-pools` | 5604 ✅, 6180 ❌ | Keep first, remove others |
| PUT | `/api/license-pools/:param` | 5618 ✅, 6194 ❌ | Keep first, remove others |
| DELETE | `/api/license-pools/:param` | 5636 ✅, 6212 ❌ | Keep first, remove others |

## Detailed Analysis

### 1. GET /api/certificates-of-compliance

**Occurrences:**

- **Line 1302:** ✅ **KEEP**
  ```javascript
  app.get("/api/certificates-of-compliance", requireAuth, async (req, res) => {
  ```

- **Line 6453:** ❌ **REMOVE**
  ```javascript
  app.get("/api/certificates-of-compliance", requireAuth, async (req, res) => {
  ```

### 2. POST /api/certificates-of-compliance

**Occurrences:**

- **Line 1351:** ✅ **KEEP**
  ```javascript
  app.post("/api/certificates-of-compliance", requireManagerOrAbove, async (req, res) => {
  ```

- **Line 6513:** ❌ **REMOVE**
  ```javascript
  app.post("/api/certificates-of-compliance", requireManagerOrAbove, async (req, res) => {
  ```

### 3. DELETE /api/certificates-of-compliance/:param

**Occurrences:**

- **Line 1417:** ✅ **KEEP**
  ```javascript
  app.delete("/api/certificates-of-compliance/:id", requireManagerOrAbove, async (req, res) => {
  ```

- **Line 6619:** ❌ **REMOVE**
  ```javascript
  app.delete("/api/certificates-of-compliance/:id", requireManagerOrAbove, async (req, res) => {
  ```

### 4. GET /api/license-pools

**Occurrences:**

- **Line 5576:** ✅ **KEEP**
  ```javascript
  app.get("/api/license-pools", requireAuth, async (req, res) => {
  ```

- **Line 6152:** ❌ **REMOVE**
  ```javascript
  app.get("/api/license-pools", requireAuth, async (req, res) => {
  ```

### 5. GET /api/license-pools/:param

**Occurrences:**

- **Line 5587:** ✅ **KEEP**
  ```javascript
  app.get("/api/license-pools/:id", requireAuth, async (req, res) => {
  ```

- **Line 6163:** ❌ **REMOVE**
  ```javascript
  app.get("/api/license-pools/:id", requireAuth, async (req, res) => {
  ```

### 6. POST /api/license-pools

**Occurrences:**

- **Line 5604:** ✅ **KEEP**
  ```javascript
  app.post("/api/license-pools", requireManagerOrAbove, async (req, res) => {
  ```

- **Line 6180:** ❌ **REMOVE**
  ```javascript
  app.post("/api/license-pools", requireManagerOrAbove, async (req, res) => {
  ```

### 7. PUT /api/license-pools/:param

**Occurrences:**

- **Line 5618:** ✅ **KEEP**
  ```javascript
  app.put("/api/license-pools/:id", requireManagerOrAbove, async (req, res) => {
  ```

- **Line 6194:** ❌ **REMOVE**
  ```javascript
  app.put("/api/license-pools/:id", requireManagerOrAbove, async (req, res) => {
  ```

### 8. DELETE /api/license-pools/:param

**Occurrences:**

- **Line 5636:** ✅ **KEEP**
  ```javascript
  app.delete("/api/license-pools/:id", requireManagerOrAbove, async (req, res) => {
  ```

- **Line 6212:** ❌ **REMOVE**
  ```javascript
  app.delete("/api/license-pools/:id", requireManagerOrAbove, async (req, res) => {
  ```

