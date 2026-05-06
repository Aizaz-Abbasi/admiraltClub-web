// src/controllers/leaderboardController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── GET /leaderboard ─────────────────────────────────────────────────────────
/**
 * Returns top 10 players ranked by their best (lowest) score.
 * Query params:
 *   courseId — filter to a specific course (optional)
 *   limit    — default 10
 */
const getLeaderboard = async (req, res) => {
  try {
    const { courseId, limit = 10 } = req.query;

    const allUsers = await prisma.user.findMany({
      where: {
        scorecards: { some: {} },
      },
      select: {
        id: true,
        name: true,
        scorecards: {
          where: {
            course: { isActive: true },
            ...(courseId && { courseId: Number(courseId) }),
          },
          include: {
            course: { select: { id: true, name: true } },
          },
          orderBy: { score: "asc" },
        },
      },
    });

    // Build entries — one per user
    const entries = allUsers
      .filter((user) => user.scorecards.length > 0)
      .map((user) => {
        const bestRound = user.scorecards[0]; // already sorted asc by score
        const totalRounds = user.scorecards.length;
        const recentRound = [...user.scorecards].sort(
          (a, b) => new Date(b.datePlayed) - new Date(a.datePlayed)
        )[0];

        return {
          userId: user.id,
          playerName: user.name,
          bestScore: bestRound.score,
          bestScoreCourse: bestRound.course.name,
          recentScore: recentRound.score,
          recentScoreCourse: recentRound.course.name,
          totalRounds,
        };
      });

    // Sort by best score ascending (lowest = best)
    entries.sort((a, b) => a.bestScore - b.bestScore);

    // Assign ranks (ties share same rank)
    let currentRank = 1;
    const ranked = entries.slice(0, Number(limit)).map((entry, index) => {
      if (index > 0 && entry.bestScore !== entries[index - 1].bestScore) {
        currentRank = index + 1;
      }
      return { rank: currentRank, ...entry };
    });

    return res.status(200).json({
      success: true,
      total: ranked.length,
      leaderboard: ranked,
    });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { getLeaderboard };


// // WHS Handicap Formula used below:
// // 1. Collect the player's last 20 rounds (or fewer if they have less)
// // 2. For each round → calculate Score Differential = (score − par) × (113 / slopeRating)
// //   → Since your Course has no slope rating, we use slope = 113 (WHS standard scratch baseline), so differential = score − par
// // 3. Take the best 8 differentials (lowest values)
// // 4. Average them × 0.96 = Handicap Index
// // 5. Rank players by Handicap Index ascending (lowest = best = rank 1)
// // 6. Players with fewer than 3 rounds show as "Establishing" — WHS minimum to get a real index

// // src/controllers/leaderboardController.js
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// // ─── WHS Constants ────────────────────────────────────────────────────────────
// const SLOPE_RATING = 113; // Standard scratch baseline (no slope in schema)
// const WHS_MULTIPLIER = 0.96; // WHS adjustment factor
// const ROUNDS_WINDOW = 20; // Look at last N rounds
// const BEST_DIFFERENTIALS = 8; // Use best M differentials from the window
// const MIN_ROUNDS_FOR_INDEX = 3; // WHS minimum rounds to get a real handicap

// /**
//  * Score Differential (WHS formula):
//  *   (score - par) × (113 / slopeRating)
//  *
//  * Since our Course model has no slope rating we use slope = 113,
//  * which simplifies to just:  score − par
//  *
//  * If you ever add slopeRating to the Course model, swap the formula below.
//  */
// function scoreDifferential(score, par) {
//   return (score - par) * (SLOPE_RATING / SLOPE_RATING); // = score - par
// }

// /**
//  * Calculate WHS Handicap Index for one player.
//  *
//  * @param {Array<{score, par}>} rounds  - All rounds for this player, newest first
//  * @returns {{ handicapIndex: number|null, status: string, roundsUsed: number }}
//  */
// function calculateHandicapIndex(rounds) {
//   // Only look at most recent ROUNDS_WINDOW rounds
//   const recentRounds = rounds.slice(0, ROUNDS_WINDOW);

//   if (recentRounds.length < MIN_ROUNDS_FOR_INDEX) {
//     return {
//       handicapIndex: null,
//       status: "Establishing",
//       roundsUsed: recentRounds.length,
//     };
//   }

//   // Calculate differential for each round
//   const differentials = recentRounds
//     .map((r) => scoreDifferential(r.score, r.course.par))
//     .sort((a, b) => a - b); // ascending — lowest (best) first

//   // How many best differentials to use?
//   // WHS table: fewer rounds → use fewer differentials
//   // Simplified version of the official WHS lookup table:
//   let numToUse;
//   const n = recentRounds.length;
//   if (n <= 4) numToUse = 1;
//   else if (n <= 6) numToUse = 2;
//   else if (n <= 8) numToUse = 2;
//   else if (n <= 11) numToUse = 3;
//   else if (n <= 14) numToUse = 4;
//   else if (n <= 16) numToUse = 5;
//   else if (n <= 18) numToUse = 6;
//   else if (n === 19) numToUse = 7;
//   else numToUse = BEST_DIFFERENTIALS; // 20 rounds → use best 8

//   const bestDiffs = differentials.slice(0, numToUse);
//   const avg = bestDiffs.reduce((sum, d) => sum + d, 0) / bestDiffs.length;
//   const handicapIndex = Math.round(avg * WHS_MULTIPLIER * 10) / 10; // 1 decimal place

//   return { handicapIndex, status: "Active", roundsUsed: recentRounds.length };
// }

// // ─── GET /leaderboard ─────────────────────────────────────────────────────────
// /**
//  * Returns ranked leaderboard using WHS Handicap Index.
//  *
//  * Query params:
//  *   courseId  — filter to rounds on a specific course (optional)
//  *   page      — default 1
//  *   limit     — default 20
//  *
//  * Response per player:
//  *   rank, playerName, handicapIndex, handicapStatus,
//  *   bestScore, bestScoreCourse, totalRounds, roundsUsed
//  */
// const getLeaderboard = async (req, res) => {
//   try {
//     const { courseId, page = 1, limit = 20 } = req.query;
//     const skip = (Number(page) - 1) * Number(limit);

//     // ── Fetch all scorecards grouped by user ─────────────────────────────────
//     // We need ALL rounds per user to calculate handicap correctly,
//     // regardless of the courseId filter (courseId only affects bestScore display)
//     const allUsers = await prisma.user.findMany({
//       where: {
//         scorecards: { some: {} }, // only users who have at least 1 round
//       },
//       select: {
//         id: true,
//         name: true,
//         scorecards: {
//           where: {
//             course: { isActive: true },
//             // NO courseId filter here — handicap needs all rounds
//           },
//           include: {
//             course: { select: { id: true, name: true, par: true } },
//           },
//           orderBy: { datePlayed: "desc" }, // newest first for ROUNDS_WINDOW slice
//         },
//       },
//     });

//     // ── Build leaderboard entries ────────────────────────────────────────────
//     const entries = allUsers
//       .map((user) => {
//         const allRounds = user.scorecards;

//         // Rounds to show bestScore from (respect courseId filter if provided)
//         const filteredRounds = courseId
//           ? allRounds.filter((r) => r.courseId === Number(courseId))
//           : allRounds;

//         // Skip user if they have no rounds on the filtered course
//         if (filteredRounds.length === 0) return null;

//         // WHS handicap — always calculated from ALL rounds, not filtered
//         const { handicapIndex, status, roundsUsed } =
//           calculateHandicapIndex(allRounds);

//         // Best score from filtered rounds
//         const bestRound = filteredRounds.reduce((best, r) =>
//           r.score < best.score ? r : best,
//         );

//         return {
//           userId: user.id,
//           playerName: user.name,
//           handicapIndex, // null = "Establishing"
//           handicapStatus: status, // "Active" | "Establishing"
//           bestScore: bestRound.score,
//           bestScoreToPar: bestRound.score - bestRound.course.par,
//           bestScoreCourse: bestRound.course.name,
//           totalRounds: allRounds.length,
//           roundsUsed, // how many rounds fed into handicap
//         };
//       })
//       .filter(Boolean); // remove nulls (users with no rounds on filtered course)

//     // ── Sort & Rank ──────────────────────────────────────────────────────────
//     // Players with a real handicap come first (ranked by handicap ascending).
//     // "Establishing" players are sorted after them by best score.
//     entries.sort((a, b) => {
//       const aEstablishing = a.handicapIndex === null;
//       const bEstablishing = b.handicapIndex === null;

//       if (!aEstablishing && !bEstablishing)
//         return a.handicapIndex - b.handicapIndex;
//       if (aEstablishing && !bEstablishing) return 1; // a goes after b
//       if (!aEstablishing && bEstablishing) return -1; // a goes before b
//       return a.bestScore - b.bestScore; // both establishing → sort by best score
//     });

//     // ── Assign ranks (ties share same rank) ──────────────────────────────────
//     let currentRank = 1;
//     const ranked = entries.map((entry, index) => {
//       if (index > 0) {
//         const prev = entries[index - 1];
//         // Tie = same handicapIndex AND same bestScore
//         const isTie =
//           entry.handicapIndex !== null &&
//           entry.handicapIndex === prev.handicapIndex &&
//           entry.bestScore === prev.bestScore;

//         if (!isTie) currentRank = index + 1;
//       }
//       return { rank: currentRank, ...entry };
//     });

//     // ── Paginate after ranking ───────────────────────────────────────────────
//     const total = ranked.length;
//     const paginated = ranked.slice(skip, skip + Number(limit));

//     return res.status(200).json({
//       success: true,
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       leaderboard: paginated,
//     });
//   } catch (error) {
//     console.error("getLeaderboard error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error." });
//   }
// };

// module.exports = { getLeaderboard };
