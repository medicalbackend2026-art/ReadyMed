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

// POST /api/jobs — create a new job listing
router.post('/', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const job = {
      ...req.body,
      recruiterUid: req.uid,
      recruiterEmail: req.email,
      status: req.body.status || 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    const ref = await db.collection('jobs').add(job)
    res.json({ success: true, jobId: ref.id })
  } catch (err) {
    console.error('Error creating job:', err)
    res.status(500).json({ error: 'Failed to create job' })
  }
})

// GET /api/jobs — fetch all non-draft jobs (for job feed)
router.get('/', async (req, res) => {
  try {
    const db = admin.firestore()
    const snap = await db.collection('jobs').where('status', '!=', 'draft').get()
    const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null }))
    jobs.sort((a, b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1)
    res.json({ jobs })
  } catch (err) {
    console.error('Error fetching jobs:', err)
    res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

// GET /api/jobs/mine — fetch jobs posted by this recruiter
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const snap = await db.collection('jobs').where('recruiterUid', '==', req.uid).get()
    const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null }))
    jobs.sort((a, b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1)
    res.json({ jobs })
  } catch (err) {
    console.error('Error fetching recruiter jobs:', err)
    res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

// PUT /api/jobs/:id — update existing job
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const ref = db.collection('jobs').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists) return res.status(404).json({ error: 'Job not found' })
    if (doc.data().recruiterUid !== req.uid) return res.status(403).json({ error: 'Forbidden' })
    const { id, recruiterUid, recruiterEmail, createdAt, ...updates } = req.body
    await ref.update({ ...updates, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
    res.json({ success: true, jobId: req.params.id })
  } catch (err) {
    console.error('Error updating job:', err)
    res.status(500).json({ error: 'Failed to update job' })
  }
})

// GET /api/jobs/:id — fetch single job by ID
router.get('/:id', async (req, res) => {
  try {
    const db = admin.firestore()
    const doc = await db.collection('jobs').doc(req.params.id).get()
    if (!doc.exists) return res.status(404).json({ error: 'Job not found' })
    const job = { id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null }
    res.json({ job })
  } catch (err) {
    console.error('Error fetching job:', err)
    res.status(500).json({ error: 'Failed to fetch job' })
  }
})

// POST /api/jobs/:id/apply — employee applies for a job
router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const jobRef = db.collection('jobs').doc(req.params.id)
    const jobDoc = await jobRef.get()
    if (!jobDoc.exists) return res.status(404).json({ error: 'Job not found' })
    const job = jobDoc.data()

    // Prevent duplicate applications
    const existing = await db.collection('applications')
      .where('jobId', '==', req.params.id)
      .where('applicantUid', '==', req.uid)
      .get()
    if (!existing.empty) return res.status(409).json({ error: 'Already applied' })

    const application = {
      jobId: req.params.id,
      jobTitle: job.title,
      hospital: job.hospital || job.companyName || '',
      recruiterUid: job.recruiterUid,
      recruiterEmail: job.recruiterEmail,
      applicantUid: req.uid,
      applicantEmail: req.email,
      applicantName: req.body.applicantName || '',
      coverNote: req.body.coverNote || '',
      status: 'New',
      appliedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    const ref = await db.collection('applications').add(application)
    res.json({ success: true, applicationId: ref.id })
  } catch (err) {
    console.error('Error applying for job:', err)
    res.status(500).json({ error: 'Failed to apply' })
  }
})

// PATCH /api/jobs/:id/status — pause/activate a job
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const ref = db.collection('jobs').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists || doc.data().recruiterUid !== req.uid) return res.status(403).json({ error: 'Forbidden' })
    await ref.update({ status: req.body.status, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job status' })
  }
})

// DELETE /api/jobs/:id — delete a job
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = admin.firestore()
    const ref = db.collection('jobs').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists || doc.data().recruiterUid !== req.uid) return res.status(403).json({ error: 'Forbidden' })
    await ref.delete()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job' })
  }
})

module.exports = router
