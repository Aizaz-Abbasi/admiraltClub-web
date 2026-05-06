const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Player leaderboard ranked by best score
 */

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Get top 10 leaderboard
 *     description: Returns players ranked by their best (lowest) score.
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter to a specific course
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Ranked leaderboard
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 3
 *               leaderboard:
 *                 - rank: 1
 *                   userId: 4
 *                   playerName: "Ali Khan"
 *                   bestScore: 68
 *                   bestScoreCourse: "Augusta National"
 *                   recentScore: 71
 *                   recentScoreCourse: "Augusta National"
 *                   totalRounds: 12
 *                 - rank: 2
 *                   userId: 7
 *                   playerName: "Sara Ahmed"
 *                   bestScore: 72
 *                   bestScoreCourse: "Augusta National"
 *                   recentScore: 74
 *                   recentScoreCourse: "Augusta National"
 *                   totalRounds: 8
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getLeaderboard);

module.exports = router;




// // src/routes/leaderboard.js
// const express = require("express");
// const router = express.Router();
// const { getLeaderboard } = require("../controllers/leaderboardController");
// const authenticate = require("../middleware/authenticate");

// /**
//  * @swagger
//  * tags:
//  *   name: Leaderboard
//  *   description: WHS-ranked player leaderboard
//  */

// /**
//  * @swagger
//  * /leaderboard:
//  *   get:
//  *     summary: Get the WHS handicap leaderboard
//  *     description: |
//  *       Returns all players ranked by their WHS Handicap Index (lowest = best = rank 1).
//  *
//  *       **Handicap Index calculation:**
//  *       - Uses the player's last 20 rounds on active courses
//  *       - Calculates Score Differential per round = (score − par) × (113 / slope)
//  *       - Picks the best differentials based on round count (WHS table)
//  *       - Averages them × 0.96 = Handicap Index (1 decimal place)
//  *
//  *       **Handicap status:**
//  *       - `Active` — player has 3+ rounds, has a real Handicap Index
//  *       - `Establishing` — fewer than 3 rounds, shown after ranked players
//  *
//  *       **Ties:** players with identical handicapIndex AND bestScore share the same rank.
//  *
//  *       **courseId filter:** narrows bestScore and bestScoreCourse to that course only.
//  *       Handicap is always calculated from all rounds regardless of this filter.
//  *     tags: [Leaderboard]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: courseId
//  *         schema:
//  *           type: integer
//  *         required: false
//  *         description: Filter bestScore display to a specific course
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 20
//  *     responses:
//  *       200:
//  *         description: Ranked leaderboard
//  *         content:
//  *           application/json:
//  *             example:
//  *               success: true
//  *               total: 3
//  *               page: 1
//  *               limit: 20
//  *               leaderboard:
//  *                 - rank: 1
//  *                   userId: 4
//  *                   playerName: "Ali Khan"
//  *                   handicapIndex: 2.1
//  *                   handicapStatus: "Active"
//  *                   bestScore: 70
//  *                   bestScoreToPar: -2
//  *                   bestScoreCourse: "Augusta National"
//  *                   totalRounds: 20
//  *                   roundsUsed: 20
//  *                 - rank: 2
//  *                   userId: 7
//  *                   playerName: "Sara Ahmed"
//  *                   handicapIndex: 5.4
//  *                   handicapStatus: "Active"
//  *                   bestScore: 74
//  *                   bestScoreToPar: 2
//  *                   bestScoreCourse: "Augusta National"
//  *                   totalRounds: 12
//  *                   roundsUsed: 12
//  *                 - rank: 3
//  *                   userId: 2
//  *                   playerName: "Usman Tariq"
//  *                   handicapIndex: null
//  *                   handicapStatus: "Establishing"
//  *                   bestScore: 78
//  *                   bestScoreToPar: 6
//  *                   bestScoreCourse: "Augusta National"
//  *                   totalRounds: 2
//  *                   roundsUsed: 2
//  *       401:
//  *         description: Unauthorized
//  */
// router.get("/", authenticate, getLeaderboard);

// module.exports = router;
