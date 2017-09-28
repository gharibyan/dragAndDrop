/**
 * Created by xgharibyan on 6/7/17.
 */


const express = require('express');
const router = express.Router();

router
    /**
     * HEALTH CHECK
     */
    .get('/', (req, res, next) => res.status(200).json('ok'));


module.exports = router;
