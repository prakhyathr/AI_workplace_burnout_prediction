from flask import Flask, request, jsonify
import joblib
import lightgbm as lgb
import pandas as pd
from flask_cors import CORS
import traceback  # 👈 Import this for detailed error logging

app = Flask(__name__)
CORS(app)
# Load preprocessor and model
preprocessor = joblib.load('preprocessor.pkl')
model = lgb.Booster(model_file='employee_burnout_model.txt')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.get_json(force=True)
        print("Received input:", input_data)

        df = pd.DataFrame([input_data])
        print("DataFrame constructed:", df)

        X_processed = preprocessor.transform(df)
        print("Data after preprocessing")

        prob = model.predict(X_processed)[0]
        result = {
            'burnout_probability': round(float(prob), 4),
            'burnout_class': int(prob >= 0.5)
        }

        print("Prediction result:", result)
        return jsonify(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
