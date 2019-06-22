const router = require('express').Router();
const { Sentiment, Entry } = require('../db/models');
const axios = require('axios');

router.get('/', (req, res, next) => {
    Sentiment.findAll()
        .then(data => res.send(data))
        .catch(next);
});

router.post('/analyze', (req, res, next) => {
    const postObj = req.body;
    console.log(postObj);
    axios.post('http://134.209.163.8:5000/analyze', postObj)
        .then(response => response.data)
        .then(data => {
            res.send(data);
        })
        .catch(next)
})

router.post('/sentiment', (req, res, next) => {
    const postObj = req.body;
    console.log(postObj);
    axios.post('http://134.209.163.8:5000/sentiment', postObj)
        .then(response => response.data)
        .then(data => {
            res.send(data);
        })
        .catch(next)
})

router.post('/', async (req, res, next) => {
    const { emotions, sentiments, entries } = req.body;
    try {
        const sentiment = await Sentiment.create({
            anger: emotions.anger[0],
            anticipation: emotions.anticipation[0],
            disgust: emotions.disgust[0],
            fear: emotions.fear[0],
            joy: emotions.joy[0],
            sadness: emotions.sadness[0],
            surprise: emotions.surprise[0],
            trust: emotions.trust[0],
            compound: sentiments.compound,
            negative: sentiments.neg,
            neutral: sentiments.neu,
            positive: sentiments.pos
        })
        await entries.map(entry => {
            Entry.findByPk(entry.id)
                .then(foundEntry => foundEntry.update({
                    sentimentId: sentiment.id
                }))
                .catch(next)
        })
        res.send(sentiment)
    } catch (error) {
        next(error)
    }
})

module.exports = router;
