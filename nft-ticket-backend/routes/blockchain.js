const express = require('express');
const router = express.Router();
const web3Service = require('../services/web3Service');

// GET /api/blockchain/transaction/:txHash
router.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    const result = await web3Service.getTransactionStatus(txHash);
    
    if (result.success) {
      res.json({
        success: true,
        transaction: result.transaction
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;