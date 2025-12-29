def debate(inputs:list):
    insights = []
    for i in inputs:
        insights.append({'input': i, 'score': len(str(i)) % 5})
    return sorted(insights, key=lambda x: x['score'], reverse=True)
