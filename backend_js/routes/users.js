const express = require('express')
const router = express.Router()
const admin = require('../firebase-admin')

// Middleware: verify Firebase ID token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
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

// POST /api/users/profile — save or update professional profile
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    // Exclude photo (base64) to stay under Firestore 1MB doc limit
    const { photo, ...profileData } = req.body
    const data = {
      ...profileData,
      uid: req.uid,
      email: req.email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    await db.collection('users').doc(req.uid).set(data, { merge: true })
    res.json({ success: true, message: 'Profile saved' })
  } catch (err) {
    console.error('Error saving profile:', err)
    res.status(500).json({ error: 'Failed to save profile' })
  }
})

// GET /api/users/profile — fetch profile from Firestore
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const doc = await db.collection('users').doc(req.uid).get()
    if (!doc.exists) return res.json({ profile: null })
    res.json({ profile: doc.data() })
  } catch (err) {
    console.error('Error fetching profile:', err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// GET /api/users — recruiter fetches all candidates from Firestore
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const snap = await db.collection('users').get()
    const users = await Promise.all(snap.docs.map(async doc => {
      const d = doc.data()
      let name = d.name || ''
      // Fallback: get display name from Firebase Auth if not in Firestore
      if (!name) {
        try {
          const authUser = await admin.auth().getUser(doc.id)
          name = authUser.displayName || ''
        } catch {}
      }
      return {
        uid: doc.id,
        name,
        profession: d.profession || '',
        location: d.preferredCity || d.city || '',
        experience: d.experiences?.[0]?.jobTitle || '',
        skills: d.skills || [],
        expectedSalary: d.expectedSalary || '',
        resumeFilename: d.resumeFilename || null,
        resumeUrl: d.resumeUrl || null,
        experiences: d.experiences || [],
        qualifications: d.qualifications || [],
        preferredJobType: d.preferredJobType || '',
        noticePeriod: d.noticePeriod || '',
        openToRelocation: d.openToRelocation || '',
      }
    }))
    res.json({ users: users.filter(u => u.name) })
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET /api/users/:uid/profile-public — recruiter reads a candidate's public profile
router.get('/:uid/profile', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const doc = await db.collection('users').doc(req.params.uid).get()
    if (!doc.exists) return res.json({ profile: null })
    // Return only non-sensitive fields
    const { email, uid, updatedAt, ...pub } = doc.data()
    res.json({ profile: pub })
  } catch (err) {
    console.error('Error fetching public profile:', err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

module.exports = router
