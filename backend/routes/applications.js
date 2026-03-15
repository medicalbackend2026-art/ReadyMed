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

// GET /api/applications/mine — employee's own submitted applications
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const snap = await db.collection('applications').where('applicantUid', '==', req.uid).get()
    const apps = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.()?.toISOString() || null,
    }))
    apps.sort((a, b) => (b.appliedAt || '') > (a.appliedAt || '') ? 1 : -1)
    res.json({ applications: apps })
  } catch (err) {
    console.error('Error fetching my applications:', err)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

// GET /api/applications/for-recruiter — all applications for this recruiter's jobs
router.get('/for-recruiter', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const snap = await db.collection('applications').where('recruiterUid', '==', req.uid).get()
    const apps = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.()?.toISOString() || null,
    }))
    apps.sort((a, b) => (b.appliedAt || '') > (a.appliedAt || '') ? 1 : -1)
    res.json({ applications: apps })
  } catch (err) {
    console.error('Error fetching recruiter applications:', err)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

// GET /api/applications/job/:jobId — all applications for a specific job (recruiter)
router.get('/job/:jobId', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const snap = await db.collection('applications').where('jobId', '==', req.params.jobId).get()
    const apps = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.()?.toISOString() || null,
    }))
    apps.sort((a, b) => (b.appliedAt || '') > (a.appliedAt || '') ? 1 : -1)
    res.json({ applications: apps })
  } catch (err) {
    console.error('Error fetching job applications:', err)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

// PATCH /api/applications/:id/status — recruiter updates application status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const ref = db.collection('applications').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists) return res.status(404).json({ error: 'Not found' })
    if (doc.data().recruiterUid !== req.uid) return res.status(403).json({ error: 'Forbidden' })
    await ref.update({ status: req.body.status, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' })
  }
})

module.exports = router

