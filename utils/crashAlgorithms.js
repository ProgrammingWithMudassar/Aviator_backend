// utils/crashAlgorithms.js

// EGP Algorithm (Every Game Percentage)
const calculateEGPCrashAt = (totalDailyProfit) => {
    // Example logic for EGP (Every Game Percentage)
    // Adjust crash based on total daily profit
    if (totalDailyProfit > 0) {
        return Math.random() * (2.5 - 1.1) + 1.1; // Higher crash when profit is positive
    } else {
        return Math.random() * (1.1 - 0.1) + 0.1; // Lower crash when profit is negative
    }
};

// DPP Algorithm (Daily Profit Percentage)
const calculateDPPCrashAt = (previousGames, totalDailyProfit) => {
    // Example logic for DPP (Daily Profit Percentage)
    // Simulate keeping a certain percentage of profit
    if (totalDailyProfit < 0) {
        return Math.random() * (1.5 - 0.5) + 0.5; // Lower crash when profit is negative
    } else {
        return Math.random() * (3 - 1.5) + 1.5; // Higher crash when profit is positive
    }
};

// NPA Algorithm (No Player Algorithm)
const calculateNPACrashAt = () => {
    // Predefined distribution of crash values
    const ratioDistribution = [0, 0, 0, 5, 10, 15, 50, 100, 150];
    return ratioDistribution[Math.floor(Math.random() * ratioDistribution.length)];
};

// Random Crash Algorithm
const generateRandomCrashAt = () => {
    // Completely random crash value between 1 and 100x
    return Math.random() * (100 - 1) + 1;
};

// Main function to select the crash algorithm
const generateCrashAt = (algorithm, previousGames = [], totalDailyProfit = 0) => {
    switch (algorithm) {
        case 'egp':
            return calculateEGPCrashAt(totalDailyProfit);
        case 'dpp':
            return calculateDPPCrashAt(previousGames, totalDailyProfit);
        case 'npa':
            return calculateNPACrashAt();
        case 'random':
        default:
            return generateRandomCrashAt();
    }
};

module.exports = {
    generateCrashAt,
    calculateEGPCrashAt,
    calculateDPPCrashAt,
    calculateNPACrashAt,
    generateRandomCrashAt
};
