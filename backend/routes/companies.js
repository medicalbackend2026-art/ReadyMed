const express = require('express')
const router = express.Router()
const admin = require('../firebase-admin')

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = authHeader.split('Bearer ')[1]
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.uid = decoded.uid
    req.email = decoded.email
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// POST /api/companies/profile — save or update company profile
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    // Exclude logo (base64) to stay under Firestore 1MB doc limit
    const { logo, ...companyData } = req.body
    const data = {
      ...companyData,
      uid: req.uid,
      email: req.email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    await db.collection('companies').doc(req.uid).set(data, { merge: true })
    res.json({ success: true, message: 'Company profile saved' })
  } catch (err) {
    console.error('Error saving company:', err)
    res.status(500).json({ error: 'Failed to save company profile' })
  }
})

// GET /api/companies/profile — fetch company profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const doc = await db.collection('companies').doc(req.uid).get()
    if (!doc.exists) return res.json({ profile: null })
    res.json({ profile: doc.data() })
  } catch (err) {
    console.error('Error fetching company:', err)
    res.status(500).json({ error: 'Failed to fetch company profile' })
  }
})

module.exports = router
