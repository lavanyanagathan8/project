
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///foundit.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Database model
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    item_type = db.Column(db.String(20), nullable=False)
    category = db.Column(db.String(50))
    colour = db.Column(db.String(50))
    location = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.item_type,
            "category": self.category,
            "colour": self.colour,
            "location": self.location,
            "description": self.description,
            "date": self.created_at.strftime("%Y-%m-%d")
        }


@app.route("/")
def home():
    return jsonify({
        "message": "FOUNDIT Backend is running!",
        "status": "success"
    })


# Display lost and found items
@app.route("/api/items", methods=["GET"])
def get_items():
    item_type = request.args.get("type", "all")

    query = Item.query

    if item_type in ["lost", "found"]:
        query = query.filter_by(item_type=item_type)

    items = query.order_by(Item.created_at.desc()).all()

    return jsonify([item.to_dict() for item in items])


# Report a new item
@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.get_json(silent=True) or {}

    required = ["name", "type", "location"]

    if not all(data.get(field) for field in required):
        return jsonify({"error": "Name, type and location are required"}), 400

    if data["type"] not in ["lost", "found"]:
        return jsonify({"error": "Type must be lost or found"}), 400

    new_item = Item(
        name=data["name"],
        item_type=data["type"],
        category=data.get("category"),
        colour=data.get("colour"),
        location=data["location"],
        description=data.get("description")
    )

    db.session.add(new_item)
    db.session.commit()

    return jsonify({
        "message": "Item reported successfully!",
        "item": new_item.to_dict()
    }), 201


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)
