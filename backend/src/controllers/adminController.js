// src/controllers/adminController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const formatMembershipType = (type) => {
  if (type === "MONTHLY") return "Monthly";
  if (type === "YEARLY") return "Yearly";
  if (type === "DAY_PASS") return "Daypass";
  return null;
};

const formatMembershipStatus = (membership) => {
  if (!membership) return "Expired";

  const now = new Date();
  const hasEnded = membership.endDate && membership.endDate < now;
  const statusValue = (membership.status || "").toLowerCase();
  const isActiveByStatus = statusValue === "active";

  return !hasEnded && isActiveByStatus ? "Active" : "Expired";
};

const getMembersList = async (req, res) => {
  try {
    const membersList = await prisma.user.findMany({
      where: { role: "MEMBER" },
      select: {
        id: true,
        name: true,
        email: true,
        membership: {
          select: {
            type: true,
            status: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const scoreAgg = await prisma.scorecard.groupBy({
      by: ["userId"],
      _count: { _all: true },
      _avg: { score: true },
    });

    const scoreByUserId = new Map(
      scoreAgg.map((row) => [
        row.userId,
        {
          rounds: row._count._all ?? 0,
          avgScore: row._avg.score !== null ? Number(row._avg.score.toFixed(2)) : null,
        },
      ]),
    );

    const members = membersList.map((member) => {
      const score = scoreByUserId.get(member.id) || { rounds: 0, avgScore: null };
      return {
        userId: member.id,
        name: member.name,
        email: member.email,
        type: formatMembershipType(member.membership?.type),
        status: formatMembershipStatus(member.membership),
        rounds: score.rounds,
        avgScore: score.avgScore,
      };
    });

    return res.status(200).json({ success: true, members });
  } catch (error) {
    console.error("getMembersList error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};


const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayBookings,
      activeMembers,
      revenueMonthToDate,
      simulators,
      recentBookings,
      locations,
    ] = await Promise.all([
      // Today's bookings count
      prisma.reservation.count({
        where: {
          createdAt: { gte: startOfDay },
          status: 'BOOKED',
        },
      }),
      // Active members count
      prisma.membership.count({
        where: { status: 'active' },
      }),
      // Revenue month to date
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: 'succeeded',
        },
        _sum: { amount: true },
      }),
      // All simulators for online count
      prisma.simulator.findMany({
        select: { id: true, status: true },
      }),
      // Recent 4 bookings
      prisma.reservation.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          simulator: { select: { name: true } },
        },
      }),
      // Locations with their simulators
      prisma.location.findMany({
        include: {
          simulators: {
            select: { id: true, name: true, status: true, locationId: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    const simulatorsOnline = simulators.filter((s) => s.status === 'ACTIVE').length;

    return res.status(200).json({
      success: true,
      stats: {
        todayBookings,
        activeMembers,
        revenueMonthToDate: revenueMonthToDate._sum.amount ?? 0,
        simulatorsOnline,
        simulatorsTotal: simulators.length,
      },
      recentBookings: recentBookings.map((r) => ({
        id: r.id,
        userName: r.user.name,
        simulatorName: r.simulator.name,
        startTime: r.startTime,
        status: r.status,
      })),
      locations,
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getMembersList,
  getDashboard
};

