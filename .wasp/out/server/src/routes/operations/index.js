import express from 'express'

import auth from 'wasp/core/auth'

import executeSearchQuery from './executeSearchQuery.js'
import processSessionResults from './processSessionResults.js'
import createReviewTag from './createReviewTag.js'
import assignTag from './assignTag.js'
import createNote from './createNote.js'
import exportResults from './exportResults.js'
import updateUserProfile from './updateUserProfile.js'
import changePassword from './changePassword.js'
import createSearchSession from './createSearchSession.js'
import createSearchQuery from './createSearchQuery.js'
import updateSearchQuery from './updateSearchQuery.js'
import getRawResults from './getRawResults.js'
import getProcessedResults from './getProcessedResults.js'
import getReviewTags from './getReviewTags.js'
import getResultsWithTags from './getResultsWithTags.js'
import getReportData from './getReportData.js'
import getUserProfile from './getUserProfile.js'
import getUserSearchSessions from './getUserSearchSessions.js'
import getSearchSessions from './getSearchSessions.js'
import getSearchSession from './getSearchSession.js'

const router = express.Router()

router.post('/execute-search-query', auth, executeSearchQuery)
router.post('/process-session-results', auth, processSessionResults)
router.post('/create-review-tag', auth, createReviewTag)
router.post('/assign-tag', auth, assignTag)
router.post('/create-note', auth, createNote)
router.post('/export-results', auth, exportResults)
router.post('/update-user-profile', auth, updateUserProfile)
router.post('/change-password', auth, changePassword)
router.post('/create-search-session', auth, createSearchSession)
router.post('/create-search-query', auth, createSearchQuery)
router.post('/update-search-query', auth, updateSearchQuery)
router.post('/get-raw-results', auth, getRawResults)
router.post('/get-processed-results', auth, getProcessedResults)
router.post('/get-review-tags', auth, getReviewTags)
router.post('/get-results-with-tags', auth, getResultsWithTags)
router.post('/get-report-data', auth, getReportData)
router.post('/get-user-profile', auth, getUserProfile)
router.post('/get-user-search-sessions', auth, getUserSearchSessions)
router.post('/get-search-sessions', auth, getSearchSessions)
router.post('/get-search-session', auth, getSearchSession)

export default router
