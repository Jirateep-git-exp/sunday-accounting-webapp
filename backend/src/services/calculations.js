// src/services/calculations.js

export function calculateTotalIncome(incomeEntries) {
    return incomeEntries.reduce((total, entry) => total + entry.amount, 0);
}

export function calculateTotalExpenses(expenseEntries) {
    return expenseEntries.reduce((total, entry) => total + entry.amount, 0);
}

export function calculateNetIncome(incomeEntries, expenseEntries) {
    const totalIncome = calculateTotalIncome(incomeEntries);
    const totalExpenses = calculateTotalExpenses(expenseEntries);
    return totalIncome - totalExpenses;
}