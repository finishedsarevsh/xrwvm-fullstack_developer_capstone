from flask import Flask
from nltk.sentiment import SentimentIntensityAnalyzer
import json

app = Flask("Sentiment Analyzer")
sia = SentimentIntensityAnalyzer()


@app.get('/')
def home():
    return ("Welcome to the Sentiment Analyzer. "
            "Use /analyze/text to get the sentiment")


@app.get('/analyze/<input_txt>')
def analyze_sentiment(input_txt):
    scores = sia.polarity_scores(input_txt)
    print(scores)
    pos = float(scores['pos'])
    neg = float(scores['neg'])
    compound = float(scores['compound'])
    if compound >= 0.05 or (pos > neg and pos >= 0.1):
        res = "positive"
    elif compound <= -0.05 or (neg > pos and neg >= 0.1):
        res = "negative"
    else:
        res = "neutral"
    res = json.dumps({"sentiment": res})
    print(res)
    return res


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
