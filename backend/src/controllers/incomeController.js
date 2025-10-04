const Income = require('../models/Income');

// Get all income entries
exports.getAllIncome = async (req, res) => {
    try {
        const income = await Income.find({ userId: req.user._id }).sort({ date: -1 });
        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching income entries' });
    }
};

// Create new income entry
exports.createIncome = async (req, res) => {
    try {
        console.log('Received income data:', req.body); // Log received data
        console.log('User data:', req.user); // Log user data

        const { amount, description, date, pocketId } = req.body;
        
        // Validate required fields
        if (!amount || !description || !date || !pocketId) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                received: { amount, description, date, pocketId }
            });
        }

        const newIncome = new Income({
            amount: parseFloat(amount),
            description,
            date: new Date(date),
            pocketId,
            userId: req.user._id,
            createdByEmail: req.user.email
        });

        console.log('New income object:', newIncome); // Log new income object

        const savedIncome = await newIncome.save();
        console.log('Saved income:', savedIncome); // Log saved income

        res.status(201).json(savedIncome);
    } catch (error) {
        console.error('Error creating income:', error);
        res.status(500).json({ 
            error: 'Error creating income entry', 
            message: error.message,
            stack: error.stack 
        });
    }
};

// Get income by ID
exports.getIncomeById = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) {
            return res.status(404).json({ error: 'Income entry not found' });
        }
        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching income entry' });
    }
};

// Update income
exports.updateIncome = async (req, res) => {
    try {
        const { amount, description, date, pocketId } = req.body;
        const updatedIncome = await Income.findByIdAndUpdate(
            req.params.id,
            {
                amount,
                description,
                date,
                pocketId
            },
            { new: true }
        );
        if (!updatedIncome) {
            return res.status(404).json({ error: 'Income entry not found' });
        }
        res.status(200).json(updatedIncome);
    } catch (error) {
        res.status(500).json({ error: 'Error updating income entry' });
    }
};

// Delete income
exports.deleteIncome = async (req, res) => {
    try {
        const deletedIncome = await Income.findByIdAndDelete(req.params.id);
        if (!deletedIncome) {
            return res.status(404).json({ error: 'Income entry not found' });
        }
        res.status(200).json({ message: 'Income entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting income entry' });
    }
};

// Create multiple income entries at once
exports.createMultipleIncome = async (req, res) => {
    try {
        const { incomes } = req.body;
        
        if (!incomes || !Array.isArray(incomes) || incomes.length === 0) {
            return res.status(400).json({ error: 'Invalid incomes array' });
        }

        // Validate each income entry
        for (let i = 0; i < incomes.length; i++) {
            const income = incomes[i];
            if (!income.amount || !income.description || !income.date || !income.pocketId) {
                return res.status(400).json({ 
                    error: `Missing required fields in income item ${i + 1}`,
                    received: income
                });
            }
        }

        // Prepare incomes for bulk insertion
        const incomesToInsert = incomes.map(income => ({
            amount: parseFloat(income.amount),
            description: income.description,
            date: new Date(income.date),
            pocketId: income.pocketId,
            userId: req.user._id,
            createdByEmail: req.user.email
        }));

        // Insert all income entries
        const savedIncomes = await Income.insertMany(incomesToInsert);
        
        res.status(201).json({
            message: `Successfully created ${savedIncomes.length} income entries`,
            incomes: savedIncomes
        });
    } catch (error) {
        console.error('Error creating multiple income entries:', error);
        res.status(500).json({ 
            error: 'Error creating multiple income entries',
            message: error.message
        });
    }
};