const User = require('../../models/User');
const Player = require('../../models/Player');
const GameBet = require('../../models/GameBet');

const getDashboardStats = async (req, res) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Today Created Agents
		const todayCreatedAgents = await User.countDocuments({
			role: 'agent',
			createdAt: { $gte: today },
		});

		// Total Created Agents
		const totalCreatedAgents = await User.countDocuments({ role: 'agent' });

		// Today Players
		const todayPlayers = await User.countDocuments({
			role: 'player',
			createdAt: { $gte: today },
		});

		// Total Players
		const totalPlayers = await User.countDocuments({ role: 'player' });

		// Today Win/Loss
		const todayWinLoss = await GameBet.aggregate([
			{ $match: { createdAt: { $gte: today } } },
			{
				$group: {
					_id: null,
					totalWin: {
						$sum: {
							$cond: [
								{ $eq: ['$status', 'win'] },
								'$winAmount',
								0,
							],
						},
					},
					totalLoss: {
						$sum: {
							$cond: [{ $eq: ['$status', 'loss'] }, '$amount', 0],
						},
					},
					totalBets: {
						// Add totalBets for profit calculation
						$sum: '$amount',
					},
				},
			},
		]);

		// Today's Profit
		const todayProfit =
			todayWinLoss.length > 0
				? todayWinLoss[0].totalBets - todayWinLoss[0].totalWin
				: 0;

		// Total Win/Loss
		const totalWinLoss = await GameBet.aggregate([
			{
				$group: {
					_id: null,
					totalWin: {
						$sum: {
							$cond: [
								{ $eq: ['$status', 'win'] },
								'$winAmount',
								0,
							],
						},
					},
					totalLoss: {
						$sum: {
							$cond: [{ $eq: ['$status', 'loss'] }, '$amount', 0],
						},
					},
					totalBets: {
						// Add totalBets for profit calculation
						$sum: '$amount',
					},
				},
			},
		]);

		// Total Profit
		const totalProfit =
			totalWinLoss.length > 0
				? totalWinLoss[0].totalBets - totalWinLoss[0].totalWin
				: 0;

		// Real Time Players (Assuming these are players who have active game tokens)
		const realTimePlayers = await Player.countDocuments({
			gameToken: { $exists: true },
		});

		// Max Winning User Today
		const maxWinningUserToday = await GameBet.aggregate([
			{ $match: { createdAt: { $gte: today }, status: 'win' } },
			{
				$group: {
					_id: '$userId',
					totalWin: { $sum: '$winAmount' },
				},
			},
			{ $sort: { totalWin: -1 } },
			{ $limit: 1 },
		]);

		// Combine results
		const maxWinningUserTodayData =
			maxWinningUserToday.length > 0 ? maxWinningUserToday[0] : {};

		res.status(200).json({
			todayCreatedAgents,
			totalCreatedAgents,
			todayPlayers,
			totalPlayers,
			todayWinLoss: todayWinLoss[0] || { totalWin: 0, totalLoss: 0 },
			totalWinLoss: totalWinLoss[0] || { totalWin: 0, totalLoss: 0 },
			realTimePlayers,
			maxWinningUserToday: maxWinningUserTodayData,
			todayProfit,
			totalProfit,
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};


module.exports = {
	getDashboardStats,
};
